using System;
using System.Drawing;
using System.Threading.Tasks;
using System.Windows.Forms;
using TallySync.Services;
using TallySync.Models;

namespace TallySync.Forms
{
    public partial class MainForm : Form
    {
        private readonly RealTallyConnector _tallyConnector;
        private readonly CloudApiService _cloudService;
        private NotifyIcon _trayIcon;
        private Timer _heartbeatTimer;
        private Timer _syncTimer;
        
        // UI Controls
        private Label _statusLabel;
        private Label _lastSyncLabel;
        private Button _connectButton;
        private Button _syncButton;
        private ProgressBar _progressBar;
        private TextBox _logTextBox;
        private TabControl _tabControl;
        
        public MainForm(RealTallyConnector tallyConnector, CloudApiService cloudService)
        {
            _tallyConnector = tallyConnector;
            _cloudService = cloudService;
            
            InitializeComponent();
            SetupTrayIcon();
            SetupTimers();
            
            // Start initial connection attempt
            _ = Task.Run(InitializeConnectionsAsync);
        }
        
        private void InitializeComponent()
        {
            this.Text = "TallySync - Real Tally ERP Integration";
            this.Size = new Size(800, 600);
            this.MinimumSize = new Size(600, 400);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Icon = SystemIcons.Application;
            
            // Create main tab control
            _tabControl = new TabControl
            {
                Dock = DockStyle.Fill
            };
            
            // Connection Tab
            var connectionTab = new TabPage("Connection Status");
            SetupConnectionTab(connectionTab);
            _tabControl.TabPages.Add(connectionTab);
            
            // Sync Tab
            var syncTab = new TabPage("Data Synchronization");
            SetupSyncTab(syncTab);
            _tabControl.TabPages.Add(syncTab);
            
            // Logs Tab
            var logsTab = new TabPage("Activity Logs");
            SetupLogsTab(logsTab);
            _tabControl.TabPages.Add(logsTab);
            
            this.Controls.Add(_tabControl);
        }
        
        private void SetupConnectionTab(TabPage tab)
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };
            
            // Status display
            var statusGroup = new GroupBox
            {
                Text = "Connection Status",
                Size = new Size(350, 200),
                Location = new Point(20, 20)
            };
            
            _statusLabel = new Label
            {
                Text = "Initializing...",
                Font = new Font("Arial", 12, FontStyle.Bold),
                ForeColor = Color.Orange,
                Location = new Point(20, 30),
                Size = new Size(300, 30)
            };
            
            _lastSyncLabel = new Label
            {
                Text = "Last Sync: Never",
                Location = new Point(20, 70),
                Size = new Size(300, 20)
            };
            
            _connectButton = new Button
            {
                Text = "Connect to Tally",
                Location = new Point(20, 110),
                Size = new Size(120, 35),
                BackColor = Color.LightBlue
            };
            _connectButton.Click += ConnectButton_Click;
            
            statusGroup.Controls.AddRange(new Control[] { _statusLabel, _lastSyncLabel, _connectButton });
            panel.Controls.Add(statusGroup);
            
            // Configuration group
            var configGroup = new GroupBox
            {
                Text = "Configuration",
                Size = new Size(350, 150),
                Location = new Point(400, 20)
            };
            
            var cloudUrlLabel = new Label
            {
                Text = "Cloud Server:",
                Location = new Point(20, 30),
                Size = new Size(100, 20)
            };
            
            var cloudUrlTextBox = new TextBox
            {
                Text = "https://your-app.replit.dev",
                Location = new Point(20, 50),
                Size = new Size(300, 25),
                ReadOnly = true
            };
            
            var tallyPortLabel = new Label
            {
                Text = "Tally Gateway Port:",
                Location = new Point(20, 85),
                Size = new Size(120, 20)
            };
            
            var tallyPortTextBox = new TextBox
            {
                Text = "9000",
                Location = new Point(150, 82),
                Size = new Size(60, 25),
                ReadOnly = true
            };
            
            configGroup.Controls.AddRange(new Control[] { cloudUrlLabel, cloudUrlTextBox, tallyPortLabel, tallyPortTextBox });
            panel.Controls.Add(configGroup);
            
            tab.Controls.Add(panel);
        }
        
        private void SetupSyncTab(TabPage tab)
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };
            
            // Sync controls
            var syncGroup = new GroupBox
            {
                Text = "Data Synchronization",
                Size = new Size(400, 200),
                Location = new Point(20, 20)
            };
            
            _syncButton = new Button
            {
                Text = "Start Full Sync",
                Location = new Point(20, 30),
                Size = new Size(120, 35),
                BackColor = Color.LightGreen
            };
            _syncButton.Click += SyncButton_Click;
            
            _progressBar = new ProgressBar
            {
                Location = new Point(20, 80),
                Size = new Size(350, 25),
                Style = ProgressBarStyle.Continuous
            };
            
            var progressLabel = new Label
            {
                Text = "Sync Progress:",
                Location = new Point(20, 60),
                Size = new Size(100, 20)
            };
            
            var autoSyncCheckBox = new CheckBox
            {
                Text = "Enable Auto Sync (Every 5 minutes)",
                Location = new Point(20, 120),
                Size = new Size(250, 25),
                Checked = true
            };
            autoSyncCheckBox.CheckedChanged += AutoSyncCheckBox_CheckedChanged;
            
            syncGroup.Controls.AddRange(new Control[] { _syncButton, progressLabel, _progressBar, autoSyncCheckBox });
            panel.Controls.Add(syncGroup);
            
            tab.Controls.Add(panel);
        }
        
        private void SetupLogsTab(TabPage tab)
        {
            _logTextBox = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                Font = new Font("Consolas", 9),
                ReadOnly = true,
                BackColor = Color.Black,
                ForeColor = Color.LimeGreen
            };
            
            tab.Controls.Add(_logTextBox);
        }
        
        private void SetupTrayIcon()
        {
            _trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "TallySync - Real Tally Integration",
                Visible = true
            };
            
            var contextMenu = new ContextMenuStrip();
            contextMenu.Items.Add("Show", null, (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; });
            contextMenu.Items.Add("Sync Now", null, (s, e) => _ = Task.Run(PerformSyncAsync));
            contextMenu.Items.Add("-");
            contextMenu.Items.Add("Exit", null, (s, e) => Application.Exit());
            
            _trayIcon.ContextMenuStrip = contextMenu;
            _trayIcon.DoubleClick += (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; };
        }
        
        private void SetupTimers()
        {
            // Heartbeat timer - every 15 seconds
            _heartbeatTimer = new Timer
            {
                Interval = 15000,
                Enabled = true
            };
            _heartbeatTimer.Tick += async (s, e) => await SendHeartbeatAsync();
            
            // Sync timer - every 5 minutes
            _syncTimer = new Timer
            {
                Interval = 300000,
                Enabled = true
            };
            _syncTimer.Tick += async (s, e) => await PerformSyncAsync();
        }
        
        private async Task InitializeConnectionsAsync()
        {
            LogMessage("🚀 TallySync started - Initializing connections...");
            
            // Test cloud connection
            var cloudConnected = await _cloudService.TestConnectionAsync();
            if (cloudConnected)
            {
                LogMessage("✅ Cloud server connection established");
                await SendHeartbeatAsync();
            }
            else
            {
                LogMessage("❌ Failed to connect to cloud server");
                UpdateStatus("Cloud Disconnected", Color.Red);
                return;
            }
            
            // Test Tally connection
            var tallyConnected = await _tallyConnector.TestConnectionAsync();
            if (tallyConnected)
            {
                LogMessage("✅ Tally ERP connection established");
                UpdateStatus("Connected", Color.Green);
                
                // Perform initial sync
                await PerformSyncAsync();
            }
            else
            {
                LogMessage("⚠️ Tally ERP not detected - waiting for Tally to start");
                UpdateStatus("Waiting for Tally", Color.Orange);
            }
        }
        
        private async Task SendHeartbeatAsync()
        {
            try
            {
                var success = await _cloudService.SendHeartbeatAsync();
                if (success)
                {
                    LogMessage($"💓 Heartbeat sent at {DateTime.Now:HH:mm:ss}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"❌ Heartbeat failed: {ex.Message}");
            }
        }
        
        private async Task PerformSyncAsync()
        {
            if (_progressBar.Value > 0) return; // Already syncing
            
            try
            {
                LogMessage("🔄 Starting data synchronization...");
                UpdateProgress(10);
                
                // Get companies from Tally
                var companies = await _tallyConnector.GetCompaniesAsync();
                UpdateProgress(30);
                
                if (companies?.Count > 0)
                {
                    LogMessage($"📊 Found {companies.Count} companies in Tally");
                    
                    // Send to cloud
                    var syncResult = await _cloudService.SyncCompaniesAsync(companies);
                    UpdateProgress(60);
                    
                    if (syncResult.Success)
                    {
                        LogMessage($"✅ Successfully synced {companies.Count} companies");
                        
                        // Get and sync ledgers
                        var ledgers = await _tallyConnector.GetLedgersAsync();
                        UpdateProgress(80);
                        
                        if (ledgers?.Count > 0)
                        {
                            var ledgerResult = await _cloudService.SyncLedgersAsync(ledgers);
                            if (ledgerResult.Success)
                            {
                                LogMessage($"✅ Successfully synced {ledgers.Count} ledgers");
                                UpdateLastSync();
                            }
                        }
                    }
                }
                
                UpdateProgress(100);
                LogMessage("🎉 Synchronization completed successfully");
                
                // Reset progress after 2 seconds
                await Task.Delay(2000);
                UpdateProgress(0);
            }
            catch (Exception ex)
            {
                LogMessage($"❌ Sync failed: {ex.Message}");
                UpdateProgress(0);
            }
        }
        
        private void UpdateStatus(string status, Color color)
        {
            if (InvokeRequired)
            {
                Invoke(new Action(() => UpdateStatus(status, color)));
                return;
            }
            
            _statusLabel.Text = $"Status: {status}";
            _statusLabel.ForeColor = color;
        }
        
        private void UpdateProgress(int value)
        {
            if (InvokeRequired)
            {
                Invoke(new Action(() => UpdateProgress(value)));
                return;
            }
            
            _progressBar.Value = Math.Min(value, 100);
        }
        
        private void UpdateLastSync()
        {
            if (InvokeRequired)
            {
                Invoke(new Action(UpdateLastSync));
                return;
            }
            
            _lastSyncLabel.Text = $"Last Sync: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
        }
        
        private void LogMessage(string message)
        {
            if (InvokeRequired)
            {
                Invoke(new Action(() => LogMessage(message)));
                return;
            }
            
            var timestamp = DateTime.Now.ToString("HH:mm:ss");
            var logEntry = $"[{timestamp}] {message}\r\n";
            _logTextBox.AppendText(logEntry);
            _logTextBox.ScrollToCaret();
        }
        
        private async void ConnectButton_Click(object sender, EventArgs e)
        {
            await InitializeConnectionsAsync();
        }
        
        private async void SyncButton_Click(object sender, EventArgs e)
        {
            await PerformSyncAsync();
        }
        
        private void AutoSyncCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            var checkBox = sender as CheckBox;
            _syncTimer.Enabled = checkBox.Checked;
            LogMessage($"🔄 Auto sync {(checkBox.Checked ? "enabled" : "disabled")}");
        }
        
        protected override void SetVisibleCore(bool value)
        {
            base.SetVisibleCore(value);
            if (value && WindowState == FormWindowState.Minimized)
            {
                Hide();
            }
        }
        
        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                Hide();
                _trayIcon.ShowBalloonTip(2000, "TallySync", "Application minimized to system tray", ToolTipIcon.Info);
            }
            else
            {
                _trayIcon?.Dispose();
                base.OnFormClosing(e);
            }
        }
    }
}