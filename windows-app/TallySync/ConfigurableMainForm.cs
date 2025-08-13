using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace TallySync
{
    public partial class ConfigurableMainForm : Form
    {
        private readonly HttpClient httpClient;
        private readonly IConfiguration configuration;
        private string backendApiUrl;
        private string apiKey;
        private int timeoutSeconds;

        // UI Controls
        private TabControl tabControl;
        private TabPage configTab;
        private TabPage connectionTab;
        private TabPage syncTab;
        
        // Configuration Controls
        private TextBox txtApiUrl;
        private TextBox txtApiKey;
        private NumericUpDown numTimeout;
        private Button btnSaveConfig;
        private Button btnTestConnection;
        
        // Connection Status Controls
        private Label lblConnectionStatus;
        private ListBox lstCompanies;
        private Button btnRefreshCompanies;
        private Button btnSyncData;
        private ProgressBar progressBar;
        
        // Sync Controls
        private TextBox txtSyncLog;
        private Button btnClearLog;

        public ConfigurableMainForm()
        {
            LoadConfiguration();
            InitializeComponent();
            httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
            SetupUI();
            LoadConfigurationIntoUI();
        }

        private void LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
            
            configuration = builder.Build();
            
            backendApiUrl = configuration["BackendSettings:ApiBaseUrl"] ?? "http://localhost:5000/api/tally";
            apiKey = configuration["BackendSettings:ApiKey"] ?? "test-api-key-123";
            timeoutSeconds = int.Parse(configuration["BackendSettings:TimeoutSeconds"] ?? "30");
        }

        private void InitializeComponent()
        {
            this.Text = "TallySync Desktop - Local Windows Application";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.Sizable;
            this.MinimumSize = new Size(600, 400);
        }

        private void SetupUI()
        {
            // Create main tab control
            tabControl = new TabControl
            {
                Dock = DockStyle.Fill,
                Font = new Font("Segoe UI", 9F)
            };

            // Configuration Tab
            configTab = new TabPage("Configuration");
            SetupConfigurationTab();
            
            // Connection Tab  
            connectionTab = new TabPage("Connection & Sync");
            SetupConnectionTab();
            
            // Sync Log Tab
            syncTab = new TabPage("Sync Logs");
            SetupSyncTab();

            tabControl.TabPages.AddRange(new TabPage[] { configTab, connectionTab, syncTab });
            this.Controls.Add(tabControl);
        }

        private void SetupConfigurationTab()
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };
            
            // Title
            var lblTitle = new Label
            {
                Text = "Backend Configuration Settings",
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Size = new Size(400, 30),
                Location = new Point(0, 10)
            };
            
            // API URL
            var lblApiUrl = new Label
            {
                Text = "Backend API URL:",
                Size = new Size(150, 20),
                Location = new Point(0, 50)
            };
            
            txtApiUrl = new TextBox
            {
                Size = new Size(400, 25),
                Location = new Point(0, 75),
                Font = new Font("Consolas", 9F)
            };
            
            // API Key
            var lblApiKey = new Label
            {
                Text = "API Key:",
                Size = new Size(150, 20),
                Location = new Point(0, 110)
            };
            
            txtApiKey = new TextBox
            {
                Size = new Size(400, 25),
                Location = new Point(0, 135),
                Font = new Font("Consolas", 9F)
            };
            
            // Timeout
            var lblTimeout = new Label
            {
                Text = "Timeout (seconds):",
                Size = new Size(150, 20),
                Location = new Point(0, 170)
            };
            
            numTimeout = new NumericUpDown
            {
                Size = new Size(100, 25),
                Location = new Point(0, 195),
                Minimum = 5,
                Maximum = 120,
                Value = timeoutSeconds
            };
            
            // Save Button
            btnSaveConfig = new Button
            {
                Text = "Save Configuration",
                Size = new Size(150, 35),
                Location = new Point(0, 240),
                BackColor = Color.FromArgb(0, 120, 215),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnSaveConfig.Click += BtnSaveConfig_Click;
            
            // Instructions
            var lblInstructions = new Label
            {
                Text = "Instructions:\n\n" +
                       "1. Update the Backend API URL to your Replit deployment URL\n" +
                       "2. Use the API key from your web interface\n" +
                       "3. Save the configuration and test the connection\n" +
                       "4. This app runs locally on your Windows computer\n\n" +
                       "Example URL: https://your-app.your-username.repl.co/api/tally",
                Size = new Size(450, 150),
                Location = new Point(0, 290),
                BackColor = Color.FromArgb(245, 245, 245),
                Padding = new Padding(10),
                BorderStyle = BorderStyle.FixedSingle
            };

            panel.Controls.AddRange(new Control[] {
                lblTitle, lblApiUrl, txtApiUrl, lblApiKey, txtApiKey, 
                lblTimeout, numTimeout, btnSaveConfig, lblInstructions
            });
            
            configTab.Controls.Add(panel);
        }

        private void SetupConnectionTab()
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };
            
            // Connection Status
            lblConnectionStatus = new Label
            {
                Text = "Not Connected",
                Size = new Size(400, 25),
                Location = new Point(0, 10),
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                ForeColor = Color.Red
            };
            
            // Test Connection Button
            btnTestConnection = new Button
            {
                Text = "Test Connection",
                Size = new Size(150, 35),
                Location = new Point(0, 45),
                BackColor = Color.FromArgb(0, 120, 215),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnTestConnection.Click += BtnTestConnection_Click;
            
            // Refresh Companies Button
            btnRefreshCompanies = new Button
            {
                Text = "Refresh Companies",
                Size = new Size(150, 35),
                Location = new Point(160, 45),
                BackColor = Color.FromArgb(40, 167, 69),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Enabled = false
            };
            btnRefreshCompanies.Click += BtnRefreshCompanies_Click;
            
            // Companies List
            var lblCompanies = new Label
            {
                Text = "Registered Companies:",
                Size = new Size(200, 20),
                Location = new Point(0, 100)
            };
            
            lstCompanies = new ListBox
            {
                Size = new Size(450, 150),
                Location = new Point(0, 125),
                Font = new Font("Consolas", 9F)
            };
            
            // Sync Data Button
            btnSyncData = new Button
            {
                Text = "Sync Sample Data",
                Size = new Size(150, 35),
                Location = new Point(0, 290),
                BackColor = Color.FromArgb(220, 53, 69),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Enabled = false
            };
            btnSyncData.Click += BtnSyncData_Click;
            
            // Progress Bar
            progressBar = new ProgressBar
            {
                Size = new Size(450, 20),
                Location = new Point(0, 340),
                Visible = false
            };

            panel.Controls.AddRange(new Control[] {
                lblConnectionStatus, btnTestConnection, btnRefreshCompanies,
                lblCompanies, lstCompanies, btnSyncData, progressBar
            });
            
            connectionTab.Controls.Add(panel);
        }

        private void SetupSyncTab()
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };
            
            var lblTitle = new Label
            {
                Text = "Synchronization Logs",
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Size = new Size(300, 30),
                Location = new Point(0, 10)
            };
            
            txtSyncLog = new TextBox
            {
                Size = new Size(450, 300),
                Location = new Point(0, 50),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Font = new Font("Consolas", 9F),
                BackColor = Color.Black,
                ForeColor = Color.Lime
            };
            
            btnClearLog = new Button
            {
                Text = "Clear Log",
                Size = new Size(100, 30),
                Location = new Point(0, 360),
                BackColor = Color.Gray,
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnClearLog.Click += (s, e) => txtSyncLog.Clear();

            panel.Controls.AddRange(new Control[] { lblTitle, txtSyncLog, btnClearLog });
            syncTab.Controls.Add(panel);
        }

        private void LoadConfigurationIntoUI()
        {
            txtApiUrl.Text = backendApiUrl;
            txtApiKey.Text = apiKey;
            numTimeout.Value = timeoutSeconds;
        }

        private void BtnSaveConfig_Click(object sender, EventArgs e)
        {
            try
            {
                backendApiUrl = txtApiUrl.Text.Trim();
                apiKey = txtApiKey.Text.Trim();
                timeoutSeconds = (int)numTimeout.Value;
                
                httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                
                // Update config file
                var configData = new
                {
                    BackendSettings = new
                    {
                        ApiBaseUrl = backendApiUrl,
                        ApiKey = apiKey,
                        TimeoutSeconds = timeoutSeconds
                    },
                    TallySettings = new
                    {
                        DefaultPort = 9000,
                        DefaultHost = "localhost",
                        ConnectionTimeoutSeconds = 10
                    },
                    Application = new
                    {
                        Version = "1.0.0",
                        Name = "TallySync Desktop"
                    }
                };
                
                var json = JsonSerializer.Serialize(configData, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText("appsettings.json", json);
                
                LogMessage("Configuration saved successfully!");
                MessageBox.Show("Configuration saved successfully!", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                LogMessage($"Error saving configuration: {ex.Message}");
                MessageBox.Show($"Error saving configuration: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async void BtnTestConnection_Click(object sender, EventArgs e)
        {
            try
            {
                btnTestConnection.Enabled = false;
                lblConnectionStatus.Text = "Testing connection...";
                lblConnectionStatus.ForeColor = Color.Blue;
                progressBar.Visible = true;
                progressBar.Style = ProgressBarStyle.Marquee;
                
                LogMessage("Testing backend connection...");
                
                var response = await httpClient.GetAsync($"{backendApiUrl}/companies");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    lblConnectionStatus.Text = "Connected Successfully!";
                    lblConnectionStatus.ForeColor = Color.Green;
                    
                    btnRefreshCompanies.Enabled = true;
                    btnSyncData.Enabled = true;
                    
                    LogMessage($"Connection successful! Status: {response.StatusCode}");
                    await LoadCompanies();
                }
                else
                {
                    lblConnectionStatus.Text = $"Connection Failed: {response.StatusCode}";
                    lblConnectionStatus.ForeColor = Color.Red;
                    LogMessage($"Connection failed: {response.StatusCode} - {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                lblConnectionStatus.Text = $"Connection Error: {ex.Message}";
                lblConnectionStatus.ForeColor = Color.Red;
                LogMessage($"Connection error: {ex.Message}");
            }
            finally
            {
                btnTestConnection.Enabled = true;
                progressBar.Visible = false;
            }
        }

        private async void BtnRefreshCompanies_Click(object sender, EventArgs e)
        {
            await LoadCompanies();
        }

        private async Task LoadCompanies()
        {
            try
            {
                LogMessage("Loading companies from backend...");
                var response = await httpClient.GetAsync($"{backendApiUrl}/companies");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    
                    if (string.IsNullOrEmpty(content) || content.Trim() == "[]")
                    {
                        lstCompanies.Items.Clear();
                        lstCompanies.Items.Add("No companies found");
                        LogMessage("No companies found in backend");
                    }
                    else
                    {
                        var companies = JsonSerializer.Deserialize<JsonElement[]>(content);
                        lstCompanies.Items.Clear();
                        
                        foreach (var company in companies)
                        {
                            var name = company.GetProperty("name").GetString();
                            var externalId = company.TryGetProperty("externalId", out var extId) ? extId.GetString() : "N/A";
                            lstCompanies.Items.Add($"{name} (External ID: {externalId})");
                        }
                        
                        LogMessage($"Loaded {companies.Length} companies successfully");
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error loading companies: {ex.Message}");
            }
        }

        private async void BtnSyncData_Click(object sender, EventArgs e)
        {
            try
            {
                btnSyncData.Enabled = false;
                LogMessage("Starting sample data sync...");
                
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var syncData = new
                {
                    apiKey = apiKey,
                    companies = new[]
                    {
                        new
                        {
                            name = $"Windows Desktop Sync - {timestamp}",
                            externalId = $"WIN_DESKTOP_{timestamp}",
                            apiKey = $"win-desktop-{timestamp}"
                        }
                    }
                };

                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{backendApiUrl}/sync/companies", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    LogMessage("Sample data synced successfully!");
                    await LoadCompanies();
                }
                else
                {
                    LogMessage($"Sync failed: {response.StatusCode} - {responseContent}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Sync error: {ex.Message}");
            }
            finally
            {
                btnSyncData.Enabled = true;
            }
        }

        private void LogMessage(string message)
        {
            var logEntry = $"[{DateTime.Now:HH:mm:ss}] {message}{Environment.NewLine}";
            if (txtSyncLog.InvokeRequired)
            {
                txtSyncLog.Invoke(new Action(() => {
                    txtSyncLog.AppendText(logEntry);
                    txtSyncLog.ScrollToCaret();
                }));
            }
            else
            {
                txtSyncLog.AppendText(logEntry);
                txtSyncLog.ScrollToCaret();
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            httpClient?.Dispose();
            base.OnFormClosing(e);
        }
    }
}