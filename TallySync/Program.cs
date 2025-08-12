using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Security.Cryptography;
using System.Linq;
using System.Xml;
using System.Xml.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace TallySync
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            // Enable visual styles
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Check for command line arguments
            if (args.Length > 0)
            {
                HandleCommandLine(args);
                return;
            }
            
            // Run the main form
            Application.Run(new MainForm());
        }
        
        static void HandleCommandLine(string[] args)
        {
            switch (args[0].ToLower())
            {
                case "--test-connection":
                    TestConnection().Wait();
                    break;
                case "--push-sample":
                    PushSample().Wait();
                    break;
                case "--help":
                    ShowHelp();
                    break;
                default:
                    Console.WriteLine($"Unknown argument: {args[0]}");
                    ShowHelp();
                    break;
            }
        }
        
        static async Task TestConnection()
        {
            Console.WriteLine("Testing Tally connection...");
            try
            {
                var config = LoadConfiguration();
                string tallyUrl = $"http://{config["Tally:Host"]}:{config["Tally:Port"]}";
                
                using var client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                
                var response = await client.GetAsync(tallyUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("✓ Tally connection successful");
                    Console.WriteLine($"  URL: {tallyUrl}");
                    Console.WriteLine($"  Status: {response.StatusCode}");
                }
                else
                {
                    Console.WriteLine($"✗ Tally connection failed: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Connection error: {ex.Message}");
            }
        }
        
        static async Task PushSample()
        {
            Console.WriteLine("Pushing sample data to cloud...");
            try
            {
                var config = LoadConfiguration();
                var sampleData = new
                {
                    dataType = "Test",
                    records = new[]
                    {
                        new { name = "Sample Company", gstin = "TEST123", _hash = "sample_hash", _timestamp = DateTime.Now }
                    }
                };
                
                using var client = new HttpClient();
                var json = JsonSerializer.Serialize(sampleData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                client.DefaultRequestHeaders.Add("x-api-key", config["Cloud:ApiKey"]);
                
                var response = await client.PostAsync($"{config["Cloud:BaseUrl"]}/api/tally/push", content);
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("✓ Sample data sent successfully");
                    var responseText = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"  Response: {responseText}");
                }
                else
                {
                    Console.WriteLine($"✗ Failed to send sample: {response.StatusCode}");
                    Console.WriteLine($"  Response: {await response.Content.ReadAsStringAsync()}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Error: {ex.Message}");
            }
        }
        
        static void ShowHelp()
        {
            Console.WriteLine("Tally Sync Application");
            Console.WriteLine("Usage:");
            Console.WriteLine("  TallySync.exe                - Run GUI application");
            Console.WriteLine("  TallySync.exe --test-connection  - Test Tally connection");
            Console.WriteLine("  TallySync.exe --push-sample      - Send sample data to cloud");
            Console.WriteLine("  TallySync.exe --help             - Show this help");
        }
        
        static IConfiguration LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            
            return builder.Build();
        }
    }

    public partial class MainForm : Form
    {
        private System.Windows.Forms.Timer syncTimer;
        private readonly HttpClient httpClient;
        private readonly IConfiguration config;
        private readonly string logPath;
        private readonly string statePath;
        
        // UI Components
        private Label lblStatus;
        private Label lblLastSync;
        private Label lblRecords;
        private Button btnStartStop;
        private Button btnTestConnection;
        private Button btnSettings;
        private TextBox txtLogs;
        private GroupBox grpStatus;
        private GroupBox grpLogs;
        private GroupBox grpControls;
        
        // Tracking variables
        private int totalFetched = 0;
        private int totalSent = 0;
        private int totalFailed = 0;
        private DateTime lastSyncTime = DateTime.MinValue;
        private bool isConnected = false;

        public MainForm()
        {
            try
            {
                httpClient = new HttpClient();
                config = LoadConfiguration();
                
                // Initialize paths
                logPath = Environment.ExpandEnvironmentVariables(
                    config["Logging:File:Path"] ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Wizone", "TallyConnector", "logs", "app.log"));
                statePath = Environment.ExpandEnvironmentVariables(
                    config["State:Path"] ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Wizone", "TallyConnector", "state.json"));
                
                InitializeComponent();
                InitializeLogging();
                LoadState();
                UpdateUI();
                
                LogMessage("Application started successfully");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing application: {ex.Message}", "Initialization Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private IConfiguration LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            
            return builder.Build();
        }

        private void InitializeComponent()
        {
            this.Text = "Tally Sync Application v1.0";
            this.Size = new System.Drawing.Size(900, 700);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MinimumSize = new System.Drawing.Size(800, 600);

            // Status Group
            grpStatus = new GroupBox
            {
                Text = "Connection Status",
                Location = new System.Drawing.Point(12, 12),
                Size = new System.Drawing.Size(860, 120)
            };

            lblStatus = new Label
            {
                Text = "Connection: Disconnected",
                Location = new System.Drawing.Point(15, 25),
                Size = new System.Drawing.Size(400, 20),
                ForeColor = System.Drawing.Color.Red,
                Font = new System.Drawing.Font("Segoe UI", 9, System.Drawing.FontStyle.Bold)
            };

            lblLastSync = new Label
            {
                Text = "Last Sync: Never",
                Location = new System.Drawing.Point(15, 50),
                Size = new System.Drawing.Size(400, 20),
                Font = new System.Drawing.Font("Segoe UI", 9)
            };

            lblRecords = new Label
            {
                Text = "Records - Fetched: 0, Sent: 0, Failed: 0",
                Location = new System.Drawing.Point(15, 75),
                Size = new System.Drawing.Size(500, 20),
                Font = new System.Drawing.Font("Segoe UI", 9)
            };

            grpStatus.Controls.AddRange(new Control[] { lblStatus, lblLastSync, lblRecords });

            // Controls Group
            grpControls = new GroupBox
            {
                Text = "Controls",
                Location = new System.Drawing.Point(12, 145),
                Size = new System.Drawing.Size(860, 80)
            };

            btnStartStop = new Button
            {
                Text = "Start Sync",
                Location = new System.Drawing.Point(15, 25),
                Size = new System.Drawing.Size(120, 40),
                BackColor = System.Drawing.Color.Green,
                ForeColor = System.Drawing.Color.White,
                Font = new System.Drawing.Font("Segoe UI", 9, System.Drawing.FontStyle.Bold)
            };
            btnStartStop.Click += BtnStartStop_Click;

            btnTestConnection = new Button
            {
                Text = "Test Connection",
                Location = new System.Drawing.Point(150, 25),
                Size = new System.Drawing.Size(120, 40),
                BackColor = System.Drawing.Color.Blue,
                ForeColor = System.Drawing.Color.White,
                Font = new System.Drawing.Font("Segoe UI", 9)
            };
            btnTestConnection.Click += BtnTestConnection_Click;

            btnSettings = new Button
            {
                Text = "Settings",
                Location = new System.Drawing.Point(285, 25),
                Size = new System.Drawing.Size(120, 40),
                BackColor = System.Drawing.Color.Gray,
                ForeColor = System.Drawing.Color.White,
                Font = new System.Drawing.Font("Segoe UI", 9)
            };
            btnSettings.Click += BtnSettings_Click;

            grpControls.Controls.AddRange(new Control[] { btnStartStop, btnTestConnection, btnSettings });

            // Logs Group
            grpLogs = new GroupBox
            {
                Text = "Application Logs",
                Location = new System.Drawing.Point(12, 240),
                Size = new System.Drawing.Size(860, 400)
            };

            txtLogs = new TextBox
            {
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Location = new System.Drawing.Point(15, 25),
                Size = new System.Drawing.Size(830, 360),
                BackColor = System.Drawing.Color.Black,
                ForeColor = System.Drawing.Color.LimeGreen,
                Font = new System.Drawing.Font("Consolas", 9)
            };

            grpLogs.Controls.Add(txtLogs);

            this.Controls.AddRange(new Control[] { grpStatus, grpControls, grpLogs });
        }

        private void InitializeLogging()
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(logPath));
            }
            catch (Exception ex)
            {
                LogMessage($"Warning: Could not create log directory: {ex.Message}");
            }
        }

        private void LoadState()
        {
            try
            {
                if (File.Exists(statePath))
                {
                    var json = File.ReadAllText(statePath);
                    var state = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                    
                    if (state != null)
                    {
                        if (state.TryGetValue("lastSyncTime", out var syncTime))
                        {
                            DateTime.TryParse(syncTime.ToString(), out lastSyncTime);
                        }
                        if (state.TryGetValue("totalFetched", out var fetched))
                        {
                            int.TryParse(fetched.ToString(), out totalFetched);
                        }
                        if (state.TryGetValue("totalSent", out var sent))
                        {
                            int.TryParse(sent.ToString(), out totalSent);
                        }
                        if (state.TryGetValue("totalFailed", out var failed))
                        {
                            int.TryParse(failed.ToString(), out totalFailed);
                        }
                    }
                    
                    LogMessage("Previous state loaded successfully");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error loading state: {ex.Message}");
            }
        }

        private void SaveState()
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(statePath));
                
                var state = new Dictionary<string, object>
                {
                    ["lastSyncTime"] = lastSyncTime,
                    ["totalFetched"] = totalFetched,
                    ["totalSent"] = totalSent,
                    ["totalFailed"] = totalFailed,
                    ["isConnected"] = isConnected
                };
                
                var json = JsonSerializer.Serialize(state, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(statePath, json);
            }
            catch (Exception ex)
            {
                LogMessage($"Error saving state: {ex.Message}");
            }
        }

        private async void BtnStartStop_Click(object sender, EventArgs e)
        {
            if (syncTimer == null || !syncTimer.Enabled)
            {
                await StartSync();
            }
            else
            {
                StopSync();
            }
        }

        private async void BtnTestConnection_Click(object sender, EventArgs e)
        {
            LogMessage("Testing connections...");
            
            btnTestConnection.Enabled = false;
            btnTestConnection.Text = "Testing...";
            
            try
            {
                await TestTallyConnection();
                await TestCloudConnection();
            }
            finally
            {
                btnTestConnection.Enabled = true;
                btnTestConnection.Text = "Test Connection";
            }
        }

        private void BtnSettings_Click(object sender, EventArgs e)
        {
            try
            {
                var settingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
                if (File.Exists(settingsPath))
                {
                    System.Diagnostics.Process.Start("notepad.exe", settingsPath);
                }
                else
                {
                    MessageBox.Show("Settings file not found: " + settingsPath, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error opening settings: {ex.Message}");
                MessageBox.Show($"Could not open settings file: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task StartSync()
        {
            try
            {
                btnStartStop.Text = "Stop Sync";
                btnStartStop.BackColor = System.Drawing.Color.Red;
                
                LogMessage("Starting Tally Sync Service...");
                
                // Test connections first
                await TestTallyConnection();
                await TestCloudConnection();
                
                if (!isConnected)
                {
                    throw new Exception("Cannot start sync - connection test failed");
                }
                
                // Start timer
                int intervalMinutes = config.GetValue<int>("Sync:IntervalMinutes", 15);
                syncTimer = new System.Windows.Forms.Timer();
                syncTimer.Interval = intervalMinutes * 60 * 1000; // Convert to milliseconds
                syncTimer.Tick += async (s, e) => await PerformSync();
                syncTimer.Start();
                
                LogMessage($"Sync timer started - Running every {intervalMinutes} minutes");
                
                // Perform initial sync
                await PerformSync();
            }
            catch (Exception ex)
            {
                LogMessage($"Error starting sync: {ex.Message}");
                StopSync();
                MessageBox.Show($"Failed to start sync: {ex.Message}", "Sync Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void StopSync()
        {
            syncTimer?.Stop();
            syncTimer?.Dispose();
            syncTimer = null;
            
            btnStartStop.Text = "Start Sync";
            btnStartStop.BackColor = System.Drawing.Color.Green;
            
            LogMessage("Sync service stopped");
            UpdateConnectionStatus(false);
            SaveState();
        }

        private async Task TestTallyConnection()
        {
            try
            {
                string tallyHost = config["Tally:Host"] ?? "localhost";
                int tallyPort = config.GetValue<int>("Tally:Port", 9000);
                string tallyUrl = $"http://{tallyHost}:{tallyPort}";
                
                LogMessage($"Testing Tally connection at {tallyUrl}...");
                
                var response = await httpClient.GetAsync(tallyUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    LogMessage("✓ Tally connection successful");
                    UpdateConnectionStatus(true);
                }
                else
                {
                    throw new Exception($"Tally returned status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"✗ Tally connection failed: {ex.Message}");
                UpdateConnectionStatus(false);
                throw;
            }
        }

        private async Task TestCloudConnection()
        {
            try
            {
                string cloudUrl = config["Cloud:BaseUrl"] ?? "";
                string apiKey = config["Cloud:ApiKey"] ?? "";
                
                if (string.IsNullOrEmpty(cloudUrl) || string.IsNullOrEmpty(apiKey))
                {
                    throw new Exception("Cloud URL or API Key not configured");
                }
                
                LogMessage($"Testing cloud connection at {cloudUrl}...");
                
                httpClient.DefaultRequestHeaders.Clear();
                httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
                
                var response = await httpClient.GetAsync($"{cloudUrl}/api/tally/status");
                
                if (response.IsSuccessStatusCode)
                {
                    LogMessage("✓ Cloud API connection successful");
                }
                else
                {
                    throw new Exception($"Cloud API returned status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"✗ Cloud connection failed: {ex.Message}");
                throw;
            }
        }

        private async Task PerformSync()
        {
            try
            {
                LogMessage("Starting sync process...");
                
                // Get date range from config
                var fromDate = DateTime.Parse(config["Sync:DateRange:FromDate"] ?? DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd"));
                var toDate = DateTime.Parse(config["Sync:DateRange:ToDate"] ?? DateTime.Now.ToString("yyyy-MM-dd"));
                
                LogMessage($"Syncing data from {fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd}");
                
                // Fetch and send data
                await SyncDataType("Companies", fromDate, toDate);
                await SyncDataType("Ledgers", fromDate, toDate);
                await SyncDataType("StockItems", fromDate, toDate);
                await SyncDataType("Vouchers", fromDate, toDate);
                
                lastSyncTime = DateTime.Now;
                UpdateLastSync(lastSyncTime);
                SaveState();
                
                LogMessage($"Sync completed successfully at {lastSyncTime:yyyy-MM-dd HH:mm:ss}");
            }
            catch (Exception ex)
            {
                LogMessage($"Sync error: {ex.Message}");
            }
        }

        private async Task SyncDataType(string dataType, DateTime fromDate, DateTime toDate)
        {
            try
            {
                LogMessage($"Syncing {dataType}...");
                
                var data = await FetchTallyData(dataType, fromDate, toDate);
                
                if (data.Count > 0)
                {
                    var result = await SendDataInBatches(data, dataType);
                    
                    totalFetched += data.Count;
                    totalSent += result.sent;
                    totalFailed += result.failed;
                    
                    UpdateRecordCounts(totalFetched, totalSent, totalFailed);
                    
                    LogMessage($"{dataType}: Fetched {data.Count}, Sent {result.sent}, Failed {result.failed}");
                }
                else
                {
                    LogMessage($"{dataType}: No data to sync");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error syncing {dataType}: {ex.Message}");
                totalFailed++;
                UpdateRecordCounts(totalFetched, totalSent, totalFailed);
            }
        }

        private async Task<List<Dictionary<string, object>>> FetchTallyData(string dataType, DateTime fromDate, DateTime toDate)
        {
            var results = new List<Dictionary<string, object>>();
            
            try
            {
                string tallyHost = config["Tally:Host"] ?? "localhost";
                int tallyPort = config.GetValue<int>("Tally:Port", 9000);
                string tallyUrl = $"http://{tallyHost}:{tallyPort}";
                
                // Create Tally XML request
                string xmlRequest = CreateTallyXMLRequest(dataType, fromDate, toDate);
                
                var content = new StringContent(xmlRequest, Encoding.UTF8, "application/xml");
                var response = await httpClient.PostAsync(tallyUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var xmlResponse = await response.Content.ReadAsStringAsync();
                    results = ParseTallyXML(xmlResponse, dataType);
                    
                    LogMessage($"Fetched {results.Count} {dataType} records from Tally");
                }
                else
                {
                    throw new Exception($"Tally API returned: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error fetching {dataType}: {ex.Message}");
            }
            
            return results;
        }

        private string CreateTallyXMLRequest(string dataType, DateTime fromDate, DateTime toDate)
        {
            // Enhanced Tally XML request with proper structure
            return $@"<ENVELOPE>
                <HEADER>
                    <VERSION>1</VERSION>
                    <TALLYREQUEST>Export</TALLYREQUEST>
                    <TYPE>Data</TYPE>
                    <ID>All {dataType}</ID>
                </HEADER>
                <BODY>
                    <DESC>
                        <STATICVARIABLES>
                            <SVEXPORTFORMAT>XML (Data Interchange)</SVEXPORTFORMAT>
                            <SVFROMDATE>{fromDate:yyyyMMdd}</SVFROMDATE>
                            <SVTODATE>{toDate:yyyyMMdd}</SVTODATE>
                        </STATICVARIABLES>
                        <TDL>
                            <TDLMESSAGE>
                                <COLLECTION NAME=""All {dataType}"">
                                    <TYPE>{dataType.TrimEnd('s')}</TYPE>
                                    <FETCH>*</FETCH>
                                    <FILTER>All {dataType}</FILTER>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>";
        }

        private List<Dictionary<string, object>> ParseTallyXML(string xmlData, string dataType)
        {
            var results = new List<Dictionary<string, object>>();
            
            try
            {
                var doc = XDocument.Parse(xmlData);
                var items = doc.Descendants(dataType.TrimEnd('s')); // Remove 's' from plural forms
                
                foreach (var item in items)
                {
                    var record = new Dictionary<string, object>();
                    
                    foreach (var element in item.Elements())
                    {
                        record[element.Name.LocalName] = element.Value;
                    }
                    
                    // Add metadata for tracking and idempotency
                    var hash = GenerateHash(JsonSerializer.Serialize(record));
                    record["_hash"] = hash;
                    record["_type"] = dataType;
                    record["_timestamp"] = DateTime.Now;
                    record["_source"] = "Tally";
                    
                    results.Add(record);
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error parsing XML for {dataType}: {ex.Message}");
            }
            
            return results;
        }

        private async Task<(int sent, int failed)> SendDataInBatches(List<Dictionary<string, object>> data, string dataType)
        {
            int batchSize = config.GetValue<int>("Sync:BatchSize", 100);
            int sent = 0;
            int failed = 0;
            
            var batches = data.Select((item, index) => new { item, index })
                             .GroupBy(x => x.index / batchSize)
                             .Select(g => g.Select(x => x.item).ToList());
            
            foreach (var batch in batches)
            {
                var result = await SendBatch(batch, dataType);
                sent += result.sent;
                failed += result.failed;
                
                // Small delay between batches to avoid overwhelming the API
                await Task.Delay(1000);
            }
            
            return (sent, failed);
        }

        private async Task<(int sent, int failed)> SendBatch(List<Dictionary<string, object>> batch, string dataType)
        {
            int maxRetries = config.GetValue<int>("Retry:MaxAttempts", 5);
            int baseDelay = config.GetValue<int>("Retry:BaseDelayMs", 1000);
            int sent = 0;
            int failed = 0;
            
            for (int retry = 0; retry <= maxRetries; retry++)
            {
                try
                {
                    string cloudUrl = config["Cloud:BaseUrl"];
                    string apiKey = config["Cloud:ApiKey"];
                    string endpoint = config["Cloud:PushEndpoint"] ?? "/api/tally/push";
                    
                    var payload = new { 
                        dataType = dataType,
                        records = batch,
                        timestamp = DateTime.UtcNow,
                        source = "TallySyncApp"
                    };
                    
                    var json = JsonSerializer.Serialize(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    httpClient.DefaultRequestHeaders.Clear();
                    httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
                    
                    var response = await httpClient.PostAsync($"{cloudUrl}{endpoint}", content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        sent += batch.Count;
                        LogMessage($"Successfully sent batch of {batch.Count} {dataType} records");
                        break;
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        throw new Exception($"API returned: {response.StatusCode} - {errorContent}");
                    }
                }
                catch (Exception ex)
                {
                    LogMessage($"Batch send attempt {retry + 1} failed: {ex.Message}");
                    
                    if (retry == maxRetries)
                    {
                        failed += batch.Count;
                        LogMessage($"Failed to send batch after {maxRetries + 1} attempts");
                    }
                    else
                    {
                        // Exponential backoff
                        int delay = baseDelay * (int)Math.Pow(2, retry);
                        await Task.Delay(delay);
                    }
                }
            }
            
            return (sent, failed);
        }

        private string GenerateHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToBase64String(bytes);
            }
        }

        private void UpdateConnectionStatus(bool connected)
        {
            isConnected = connected;
            
            if (InvokeRequired)
            {
                Invoke(new Action(() => UpdateConnectionStatus(connected)));
                return;
            }
            
            lblStatus.Text = connected ? "Connection: Connected" : "Connection: Disconnected";
            lblStatus.ForeColor = connected ? System.Drawing.Color.Green : System.Drawing.Color.Red;
        }

        private void UpdateLastSync(DateTime syncTime)
        {
            if (InvokeRequired)
            {
                Invoke(new Action(() => UpdateLastSync(syncTime)));
                return;
            }
            
            lblLastSync.Text = $"Last Sync: {syncTime:yyyy-MM-dd HH:mm:ss}";
        }

        private void UpdateRecordCounts(int fetched, int sent, int failed)
        {
            if (InvokeRequired)
            {
                Invoke(new Action(() => UpdateRecordCounts(fetched, sent, failed)));
                return;
            }
            
            lblRecords.Text = $"Records - Fetched: {fetched}, Sent: {sent}, Failed: {failed}";
        }

        private void UpdateUI()
        {
            UpdateConnectionStatus(isConnected);
            
            if (lastSyncTime != DateTime.MinValue)
            {
                UpdateLastSync(lastSyncTime);
            }
            
            UpdateRecordCounts(totalFetched, totalSent, totalFailed);
        }

        private void LogMessage(string message)
        {
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            var logEntry = $"[{timestamp}] {message}";
            
            // Update UI log
            if (InvokeRequired)
            {
                Invoke(new Action(() => LogMessage(message)));
                return;
            }
            
            txtLogs.AppendText(logEntry + Environment.NewLine);
            txtLogs.ScrollToCaret();
            
            // Write to file log
            try
            {
                File.AppendAllText(logPath, logEntry + Environment.NewLine);
            }
            catch
            {
                // Ignore file logging errors
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            StopSync();
            SaveState();
            httpClient?.Dispose();
            base.OnFormClosing(e);
        }
    }
}