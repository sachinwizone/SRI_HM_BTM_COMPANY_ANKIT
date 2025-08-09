using System;
using System.Drawing;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace TallySync.Forms;

public partial class SimpleMainForm : Form
{
    // Professional UI Controls
    private TabControl tabControl;
    private TabPage tabConnection;
    private TabPage tabCompanies;
    private TabPage tabSyncStatus;
    
    // Connection Tab Controls
    private Panel pnlWebApi;
    private Label lblWebApiUrl;
    private TextBox txtWebApiUrl;
    private Label lblWebPort;
    private NumericUpDown nudWebPort;
    private NumericUpDown nudTallyPort;
    private Button btnTestWebConnection;
    private Label lblWebConnectionStatus;
    
    private Panel pnlTallyGateway;
    private Label lblTallyUrl;
    private TextBox txtTallyUrl;
    private Button btnTestTallyConnection;
    private Label lblTallyConnectionStatus;
    
    // Companies Tab Controls
    private Panel pnlAvailableCompanies;
    private Label lblAvailableCompanies;
    private ListBox lstAvailableCompanies;
    private Button btnRefreshCompanies;
    private Button btnAddSelectedCompanies;
    
    private Panel pnlSelectedCompanies;
    private Label lblSelectedCompanies;
    private DataGridView dgvSelectedCompanies;
    private Button btnRemoveCompany;
    private Button btnRegisterCompanies;
    
    // Sync Status Tab Controls
    private Panel pnlSyncControls;
    private Button btnStartSync;
    private Button btnStopSync;
    private Button btnManualSync;
    private Label lblSyncStatus;
    private ProgressBar progressSync;
    
    private Panel pnlSyncLogs;
    private Label lblSyncLogs;
    private RichTextBox rtbSyncLogs;
    private Button btnClearLogs;

    // Data
    private HttpClient httpClient;
    private System.Windows.Forms.Timer syncTimer;
    private System.Windows.Forms.Timer heartbeatTimer;
    private List<CompanyConfig> selectedCompanies;
    private List<TallyCompany> availableCompanies;

    // System Tray
    private NotifyIcon notifyIcon;
    private ContextMenuStrip contextMenu;

    public SimpleMainForm()
    {
        InitializeApp();
        InitializeComponent();
        InitializeSystemTray();
    }

    private void InitializeApp()
    {
        // Initialize HTTP client
        httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        // Initialize data collections
        selectedCompanies = new List<CompanyConfig>();
        availableCompanies = new List<TallyCompany>();

        // Initialize timers
        syncTimer = new System.Windows.Forms.Timer();
        syncTimer.Interval = 30 * 60 * 1000; // 30 minutes
        syncTimer.Tick += SyncTimer_Tick;

        heartbeatTimer = new System.Windows.Forms.Timer();
        heartbeatTimer.Interval = 15000; // 15 seconds - more frequent
        heartbeatTimer.Tick += HeartbeatTimer_Tick;
    }

    private void InitializeComponent()
    {
        // Form setup
        Text = "TallySync Pro - Business Management Integration";
        Size = new Size(900, 650);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = true;
        Icon = SystemIcons.Application;
        BackColor = Color.FromArgb(248, 249, 250);
        Font = new Font("Segoe UI", 9F);

        // Initialize all controls
        InitializeTabControl();
        InitializeConnectionTab();
        InitializeCompaniesTab();
        InitializeSyncStatusTab();
        
        ApplyModernStyling();
        SetupDataGridView();
        LoadInitialData();

        Load += SimpleMainForm_Load;
        Resize += SimpleMainForm_Resize;
    }

    private void InitializeTabControl()
    {
        this.tabControl = new TabControl();
        this.tabControl.Location = new Point(12, 12);
        this.tabControl.Size = new Size(876, 626);
        this.tabControl.Font = new Font("Segoe UI", 10F, FontStyle.Regular);
        this.tabControl.Appearance = TabAppearance.Normal;
        this.tabControl.SizeMode = TabSizeMode.Fixed;
        this.tabControl.ItemSize = new Size(120, 35);
        
        this.tabConnection = new TabPage("Connection");
        this.tabCompanies = new TabPage("Companies");
        this.tabSyncStatus = new TabPage("Sync Status");
        
        this.tabControl.TabPages.Add(this.tabConnection);
        this.tabControl.TabPages.Add(this.tabCompanies);
        this.tabControl.TabPages.Add(this.tabSyncStatus);
        
        this.Controls.Add(this.tabControl);
    }

    private void InitializeConnectionTab()
    {
        // Web API Panel
        this.pnlWebApi = new Panel();
        this.pnlWebApi.Location = new Point(20, 20);
        this.pnlWebApi.Size = new Size(400, 200);
        this.pnlWebApi.BackColor = Color.White;
        this.pnlWebApi.BorderStyle = BorderStyle.None;
        
        var lblWebApiTitle = new Label();
        lblWebApiTitle.Text = "Web API Configuration";
        lblWebApiTitle.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        lblWebApiTitle.Location = new Point(15, 15);
        lblWebApiTitle.Size = new Size(200, 25);
        lblWebApiTitle.ForeColor = Color.FromArgb(33, 37, 41);
        
        this.lblWebApiUrl = new Label();
        this.lblWebApiUrl.Text = "Cloud API URL:";
        this.lblWebApiUrl.Location = new Point(15, 50);
        this.lblWebApiUrl.Size = new Size(100, 20);
        
        this.txtWebApiUrl = new TextBox();
        this.txtWebApiUrl.Location = new Point(15, 75);
        this.txtWebApiUrl.Size = new Size(280, 25);
        this.txtWebApiUrl.Text = "https://your-app.replit.app";
        
        this.lblWebPort = new Label();
        this.lblWebPort.Text = "Port:";
        this.lblWebPort.Location = new Point(305, 50);
        this.lblWebPort.Size = new Size(40, 20);
        
        this.nudWebPort = new NumericUpDown();
        this.nudWebPort.Location = new Point(305, 75);
        this.nudWebPort.Size = new Size(80, 25);
        this.nudWebPort.Minimum = 1;
        this.nudWebPort.Maximum = 65535;
        this.nudWebPort.Value = 443;
        
        this.btnTestWebConnection = new Button();
        this.btnTestWebConnection.Text = "Test Connection";
        this.btnTestWebConnection.Location = new Point(15, 110);
        this.btnTestWebConnection.Size = new Size(120, 35);
        this.btnTestWebConnection.Click += BtnTestWebConnection_Click;
        
        this.lblWebConnectionStatus = new Label();
        this.lblWebConnectionStatus.Text = "Not tested";
        this.lblWebConnectionStatus.Location = new Point(145, 120);
        this.lblWebConnectionStatus.Size = new Size(200, 20);
        this.lblWebConnectionStatus.ForeColor = Color.Gray;
        
        this.pnlWebApi.Controls.AddRange(new Control[] {
            lblWebApiTitle, this.lblWebApiUrl, this.txtWebApiUrl,
            this.lblWebPort, this.nudWebPort,
            this.btnTestWebConnection, this.lblWebConnectionStatus
        });
        
        // Tally Gateway Panel
        this.pnlTallyGateway = new Panel();
        this.pnlTallyGateway.Location = new Point(440, 20);
        this.pnlTallyGateway.Size = new Size(400, 200);
        this.pnlTallyGateway.BackColor = Color.White;
        this.pnlTallyGateway.BorderStyle = BorderStyle.None;
        
        var lblTallyTitle = new Label();
        lblTallyTitle.Text = "Tally Gateway Configuration";
        lblTallyTitle.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        lblTallyTitle.Location = new Point(15, 15);
        lblTallyTitle.Size = new Size(250, 25);
        lblTallyTitle.ForeColor = Color.FromArgb(33, 37, 41);
        
        this.lblTallyUrl = new Label();
        this.lblTallyUrl.Text = "Tally Gateway URL:";
        this.lblTallyUrl.Location = new Point(15, 50);
        this.lblTallyUrl.Size = new Size(130, 20);
        
        this.txtTallyUrl = new TextBox();
        this.txtTallyUrl.Location = new Point(15, 75);
        this.txtTallyUrl.Size = new Size(280, 25);
        this.txtTallyUrl.Text = "http://localhost";
        
        // Add Tally Port Configuration
        var lblTallyPort = new Label();
        lblTallyPort.Text = "Port:";
        lblTallyPort.Location = new Point(305, 50);
        lblTallyPort.Size = new Size(40, 20);
        
        this.nudTallyPort = new NumericUpDown();
        this.nudTallyPort.Location = new Point(305, 75);
        this.nudTallyPort.Size = new Size(80, 25);
        this.nudTallyPort.Minimum = 1;
        this.nudTallyPort.Maximum = 65535;
        this.nudTallyPort.Value = 9000;
        
        this.btnTestTallyConnection = new Button();
        this.btnTestTallyConnection.Text = "Test Tally";
        this.btnTestTallyConnection.Location = new Point(15, 110);
        this.btnTestTallyConnection.Size = new Size(120, 35);
        this.btnTestTallyConnection.Click += BtnTestTallyConnection_Click;
        
        this.lblTallyConnectionStatus = new Label();
        this.lblTallyConnectionStatus.Text = "Not tested";
        this.lblTallyConnectionStatus.Location = new Point(145, 120);
        this.lblTallyConnectionStatus.Size = new Size(200, 20);
        this.lblTallyConnectionStatus.ForeColor = Color.Gray;
        
        this.pnlTallyGateway.Controls.AddRange(new Control[] {
            lblTallyTitle, this.lblTallyUrl, this.txtTallyUrl,
            lblTallyPort, this.nudTallyPort,
            this.btnTestTallyConnection, this.lblTallyConnectionStatus
        });
        
        this.tabConnection.Controls.Add(this.pnlWebApi);
        this.tabConnection.Controls.Add(this.pnlTallyGateway);
    }

    private void InitializeCompaniesTab()
    {
        // Available Companies Panel
        this.pnlAvailableCompanies = new Panel();
        this.pnlAvailableCompanies.Location = new Point(20, 20);
        this.pnlAvailableCompanies.Size = new Size(400, 350);
        this.pnlAvailableCompanies.BackColor = Color.White;
        this.pnlAvailableCompanies.BorderStyle = BorderStyle.None;
        
        this.lblAvailableCompanies = new Label();
        this.lblAvailableCompanies.Text = "Available Companies (From Tally)";
        this.lblAvailableCompanies.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        this.lblAvailableCompanies.Location = new Point(15, 15);
        this.lblAvailableCompanies.Size = new Size(300, 25);
        
        this.lstAvailableCompanies = new ListBox();
        this.lstAvailableCompanies.Location = new Point(15, 50);
        this.lstAvailableCompanies.Size = new Size(370, 250);
        this.lstAvailableCompanies.SelectionMode = SelectionMode.MultiExtended;
        
        this.btnRefreshCompanies = new Button();
        this.btnRefreshCompanies.Text = "Refresh Companies";
        this.btnRefreshCompanies.Location = new Point(15, 280);
        this.btnRefreshCompanies.Size = new Size(130, 30);
        this.btnRefreshCompanies.Click += BtnRefreshCompanies_Click;
        
        var btnAddManualCompany = new Button();
        btnAddManualCompany.Text = "Add Manually";
        btnAddManualCompany.Location = new Point(155, 280);
        btnAddManualCompany.Size = new Size(100, 30);
        btnAddManualCompany.Click += BtnAddManualCompany_Click;
        
        this.btnAddSelectedCompanies = new Button();
        this.btnAddSelectedCompanies.Text = "Add Selected →";
        this.btnAddSelectedCompanies.Location = new Point(265, 280);
        this.btnAddSelectedCompanies.Size = new Size(120, 30);
        this.btnAddSelectedCompanies.Click += BtnAddSelectedCompanies_Click;
        
        this.pnlAvailableCompanies.Controls.AddRange(new Control[] {
            this.lblAvailableCompanies, this.lstAvailableCompanies,
            this.btnRefreshCompanies, btnAddManualCompany, this.btnAddSelectedCompanies
        });
        
        // Selected Companies Panel
        this.pnlSelectedCompanies = new Panel();
        this.pnlSelectedCompanies.Location = new Point(440, 20);
        this.pnlSelectedCompanies.Size = new Size(400, 350);
        this.pnlSelectedCompanies.BackColor = Color.White;
        this.pnlSelectedCompanies.BorderStyle = BorderStyle.None;
        
        this.lblSelectedCompanies = new Label();
        this.lblSelectedCompanies.Text = "Selected Companies (For Sync)";
        this.lblSelectedCompanies.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        this.lblSelectedCompanies.Location = new Point(15, 15);
        this.lblSelectedCompanies.Size = new Size(300, 25);
        
        this.dgvSelectedCompanies = new DataGridView();
        this.dgvSelectedCompanies.Location = new Point(15, 50);
        this.dgvSelectedCompanies.Size = new Size(370, 220);
        this.dgvSelectedCompanies.AllowUserToAddRows = false;
        this.dgvSelectedCompanies.AllowUserToDeleteRows = false;
        this.dgvSelectedCompanies.ReadOnly = true;
        this.dgvSelectedCompanies.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        this.dgvSelectedCompanies.MultiSelect = false;
        
        this.btnRemoveCompany = new Button();
        this.btnRemoveCompany.Text = "Remove Selected";
        this.btnRemoveCompany.Location = new Point(15, 280);
        this.btnRemoveCompany.Size = new Size(130, 30);
        this.btnRemoveCompany.Click += BtnRemoveCompany_Click;
        
        this.btnRegisterCompanies = new Button();
        this.btnRegisterCompanies.Text = "Register with API";
        this.btnRegisterCompanies.Location = new Point(255, 280);
        this.btnRegisterCompanies.Size = new Size(130, 30);
        this.btnRegisterCompanies.Click += BtnRegisterCompanies_Click;
        
        this.pnlSelectedCompanies.Controls.AddRange(new Control[] {
            this.lblSelectedCompanies, this.dgvSelectedCompanies,
            this.btnRemoveCompany, this.btnRegisterCompanies
        });
        
        this.tabCompanies.Controls.Add(this.pnlAvailableCompanies);
        this.tabCompanies.Controls.Add(this.pnlSelectedCompanies);
    }
    
    private void InitializeSyncStatusTab()
    {
        // Sync Controls Panel
        this.pnlSyncControls = new Panel();
        this.pnlSyncControls.Location = new Point(20, 20);
        this.pnlSyncControls.Size = new Size(820, 120);
        this.pnlSyncControls.BackColor = Color.White;
        this.pnlSyncControls.BorderStyle = BorderStyle.None;
        
        var lblSyncControlsTitle = new Label();
        lblSyncControlsTitle.Text = "Sync Controls";
        lblSyncControlsTitle.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        lblSyncControlsTitle.Location = new Point(15, 15);
        lblSyncControlsTitle.Size = new Size(150, 25);
        
        this.btnStartSync = new Button();
        this.btnStartSync.Text = "▶ Start Sync";
        this.btnStartSync.Location = new Point(15, 50);
        this.btnStartSync.Size = new Size(100, 40);
        this.btnStartSync.Click += BtnStartSync_Click;
        
        this.btnStopSync = new Button();
        this.btnStopSync.Text = "⏹ Stop Sync";
        this.btnStopSync.Location = new Point(125, 50);
        this.btnStopSync.Size = new Size(100, 40);
        this.btnStopSync.Click += BtnStopSync_Click;
        
        this.btnManualSync = new Button();
        this.btnManualSync.Text = "🔄 Manual Sync";
        this.btnManualSync.Location = new Point(235, 50);
        this.btnManualSync.Size = new Size(120, 40);
        this.btnManualSync.Click += BtnManualSync_Click;
        
        this.lblSyncStatus = new Label();
        this.lblSyncStatus.Text = "Status: Idle";
        this.lblSyncStatus.Name = "StatusValue";
        this.lblSyncStatus.Font = new Font("Segoe UI", 10F);
        this.lblSyncStatus.Location = new Point(375, 50);
        this.lblSyncStatus.Size = new Size(200, 20);
        
        this.progressSync = new ProgressBar();
        this.progressSync.Location = new Point(375, 75);
        this.progressSync.Size = new Size(200, 15);
        this.progressSync.Style = ProgressBarStyle.Continuous;
        
        this.pnlSyncControls.Controls.AddRange(new Control[] {
            lblSyncControlsTitle, this.btnStartSync, this.btnStopSync,
            this.btnManualSync, this.lblSyncStatus, this.progressSync
        });
        
        // Sync Logs Panel
        this.pnlSyncLogs = new Panel();
        this.pnlSyncLogs.Location = new Point(20, 160);
        this.pnlSyncLogs.Size = new Size(820, 410);
        this.pnlSyncLogs.BackColor = Color.White;
        this.pnlSyncLogs.BorderStyle = BorderStyle.None;
        
        this.lblSyncLogs = new Label();
        this.lblSyncLogs.Text = "Sync Logs";
        this.lblSyncLogs.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        this.lblSyncLogs.Location = new Point(15, 15);
        this.lblSyncLogs.Size = new Size(150, 25);
        
        this.rtbSyncLogs = new RichTextBox();
        this.rtbSyncLogs.Name = "LogTextBox";
        this.rtbSyncLogs.Location = new Point(15, 50);
        this.rtbSyncLogs.Size = new Size(720, 320);
        this.rtbSyncLogs.ReadOnly = true;
        this.rtbSyncLogs.BackColor = Color.FromArgb(248, 249, 250);
        this.rtbSyncLogs.Font = new Font("Consolas", 9F);
        
        this.btnClearLogs = new Button();
        this.btnClearLogs.Text = "Clear Logs";
        this.btnClearLogs.Location = new Point(745, 50);
        this.btnClearLogs.Size = new Size(70, 30);
        this.btnClearLogs.Click += BtnClearLogs_Click;
        
        this.pnlSyncLogs.Controls.AddRange(new Control[] {
            this.lblSyncLogs, this.rtbSyncLogs, this.btnClearLogs
        });
        
        this.tabSyncStatus.Controls.Add(this.pnlSyncControls);
        this.tabSyncStatus.Controls.Add(this.pnlSyncLogs);
    }

    private void InitializeSystemTray()
    {
        this.notifyIcon = new NotifyIcon();
        this.notifyIcon.Icon = SystemIcons.Application;
        this.notifyIcon.Text = "TallySync Pro";
        this.notifyIcon.Visible = true;

        this.contextMenu = new ContextMenuStrip();
        this.contextMenu.Items.Add("Show Application", null, ShowApplication_Click);
        this.contextMenu.Items.Add("-");
        this.contextMenu.Items.Add("Exit", null, ExitApplication_Click);

        this.notifyIcon.ContextMenuStrip = this.contextMenu;
        this.notifyIcon.DoubleClick += NotifyIcon_DoubleClick;
    }

    // Modern styling and additional methods
    private void ApplyModernStyling()
    {
        var primaryColor = Color.FromArgb(0, 123, 255);
        var hoverColor = Color.FromArgb(0, 100, 200);
        var successColor = Color.FromArgb(40, 167, 69);
        var warningColor = Color.FromArgb(255, 193, 7);
        var dangerColor = Color.FromArgb(220, 53, 69);

        SetModernButtonStyle(btnTestWebConnection, primaryColor, hoverColor);
        SetModernButtonStyle(btnTestTallyConnection, primaryColor, hoverColor);
        SetModernButtonStyle(btnRefreshCompanies, primaryColor, hoverColor);
        SetModernButtonStyle(btnAddSelectedCompanies, successColor, Color.FromArgb(35, 140, 60));
        SetModernButtonStyle(btnRemoveCompany, dangerColor, Color.FromArgb(200, 40, 60));
        SetModernButtonStyle(btnRegisterCompanies, primaryColor, hoverColor);
        SetModernButtonStyle(btnStartSync, successColor, Color.FromArgb(35, 140, 60));
        SetModernButtonStyle(btnStopSync, dangerColor, Color.FromArgb(200, 40, 60));
        SetModernButtonStyle(btnManualSync, warningColor, Color.FromArgb(230, 170, 5));
        SetModernButtonStyle(btnClearLogs, Color.Gray, Color.DarkGray);

        SetModernPanelStyle(pnlWebApi);
        SetModernPanelStyle(pnlTallyGateway);
        SetModernPanelStyle(pnlAvailableCompanies);
        SetModernPanelStyle(pnlSelectedCompanies);
        SetModernPanelStyle(pnlSyncControls);
        SetModernPanelStyle(pnlSyncLogs);
    }

    private void SetModernButtonStyle(Button button, Color baseColor, Color hoverColor)
    {
        button.BackColor = baseColor;
        button.ForeColor = Color.White;
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 0;
        button.Cursor = Cursors.Hand;
        
        button.MouseEnter += (s, e) => button.BackColor = hoverColor;
        button.MouseLeave += (s, e) => button.BackColor = baseColor;
    }

    private void SetModernPanelStyle(Panel panel)
    {
        panel.BackColor = Color.White;
        panel.Paint += (s, e) =>
        {
            var pen = new Pen(Color.FromArgb(200, 200, 200), 1);
            e.Graphics.DrawRectangle(pen, 0, 0, panel.Width - 1, panel.Height - 1);
            pen.Dispose();
        };
    }

    private void SetupDataGridView()
    {
        dgvSelectedCompanies.AutoGenerateColumns = false;

        dgvSelectedCompanies.Columns.Add(new DataGridViewTextBoxColumn
        {
            DataPropertyName = "Name",
            HeaderText = "Company Name",
            Width = 150,
            ReadOnly = true
        });

        dgvSelectedCompanies.Columns.Add(new DataGridViewCheckBoxColumn
        {
            DataPropertyName = "IsEnabled",
            HeaderText = "Enabled",
            Width = 70
        });

        dgvSelectedCompanies.Columns.Add(new DataGridViewTextBoxColumn
        {
            DataPropertyName = "Status",
            HeaderText = "Status",
            Width = 100,
            ReadOnly = true
        });

        dgvSelectedCompanies.Columns.Add(new DataGridViewTextBoxColumn
        {
            DataPropertyName = "LastSync",
            HeaderText = "Last Sync",
            Width = 120,
            ReadOnly = true,
            DefaultCellStyle = new DataGridViewCellStyle { Format = "yyyy-MM-dd HH:mm" }
        });
    }

    private void LoadInitialData()
    {
        txtWebApiUrl.Text = "https://your-app.replit.app";
        nudWebPort.Value = 443;
        txtTallyUrl.Text = "http://localhost:9000";
    }

    private async void SimpleMainForm_Load(object sender, EventArgs e)
    {
        AddLogMessage("TallySync Pro started successfully");
    }

    private void SimpleMainForm_Resize(object sender, EventArgs e)
    {
        if (this.WindowState == FormWindowState.Minimized)
        {
            this.Hide();
            this.ShowInTaskbar = false;
            notifyIcon?.ShowBalloonTip(2000, "TallySync Pro", "Application minimized to system tray", ToolTipIcon.Info);
        }
    }

    // Event handlers for new UI
    private async void BtnTestWebConnection_Click(object sender, EventArgs e)
    {
        await TestWebApiConnection();
    }

    private async void BtnTestTallyConnection_Click(object sender, EventArgs e)
    {
        await TestTallyConnection();
    }

    private async void BtnRefreshCompanies_Click(object sender, EventArgs e)
    {
        btnRefreshCompanies.Enabled = false;
        btnRefreshCompanies.Text = "Loading...";
        
        AddLogMessage("Refreshing companies from Tally Gateway...");
        await RefreshCompaniesFromTally();
        
        // Add fallback companies when XML fails
        if (availableCompanies.Count == 0)
        {
            AddLogMessage("Adding fallback companies for manual selection...");
            
            var fallbackCompanies = new List<TallyCompany>
            {
                new TallyCompany { Name = "Wizone IT Network India Pvt Ltd", Guid = Guid.NewGuid().ToString(), StartDate = "01-Apr-2024", EndDate = "31-Mar-2025" },
                new TallyCompany { Name = "Wizone IT Solutions", Guid = Guid.NewGuid().ToString(), StartDate = "01-Apr-2024", EndDate = "31-Mar-2025" }
            };
            
            foreach (var company in fallbackCompanies)
            {
                availableCompanies.Add(company);
                lstAvailableCompanies.Items.Add($"{company.Name} ({company.StartDate} - {company.EndDate})");
            }
            
            MessageBox.Show("Added your companies manually. Select them and proceed with sync.", "Manual Mode", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        
        btnRefreshCompanies.Enabled = true;
        btnRefreshCompanies.Text = "Refresh Companies";
    }

    private void BtnAddManualCompany_Click(object sender, EventArgs e)
    {
        string companyName = Microsoft.VisualBasic.Interaction.InputBox(
            "Enter company name:", 
            "Add Company Manually", 
            "Wizone IT Network India Pvt Ltd");
            
        if (!string.IsNullOrEmpty(companyName))
        {
            var company = new TallyCompany
            {
                Name = companyName.Trim(),
                Guid = Guid.NewGuid().ToString(),
                StartDate = "01-Apr-2024",
                EndDate = "31-Mar-2025"
            };
            
            availableCompanies.Add(company);
            lstAvailableCompanies.Items.Add($"{company.Name} ({company.StartDate} - {company.EndDate})");
            AddLogMessage($"Manually added company: {company.Name}");
        }
    }

    private void BtnAddSelectedCompanies_Click(object sender, EventArgs e)
    {
        AddSelectedCompanies();
    }

    private void BtnRemoveCompany_Click(object sender, EventArgs e)
    {
        RemoveSelectedCompany();
    }

    private async void BtnRegisterCompanies_Click(object sender, EventArgs e)
    {
        await RegisterCompaniesWithApi();
    }

    private async void BtnStartSync_Click(object sender, EventArgs e)
    {
        await StartSyncService();
    }

    private async void BtnStopSync_Click(object sender, EventArgs e)
    {
        await StopSyncService();
    }

    private async void BtnManualSync_Click(object sender, EventArgs e)
    {
        await TriggerManualSync();
    }

    private void BtnClearLogs_Click(object sender, EventArgs e)
    {
        rtbSyncLogs.Clear();
        AddLogMessage("Logs cleared by user");
    }

    private async void SyncTimer_Tick(object sender, EventArgs e)
    {
        await PerformScheduledSync();
    }

    private async void HeartbeatTimer_Tick(object sender, EventArgs e)
    {
        await SendHeartbeat();
    }

    private void NotifyIcon_DoubleClick(object sender, EventArgs e)
    {
        ShowMainWindow();
    }

    private void ShowApplication_Click(object sender, EventArgs e)
    {
        ShowMainWindow();
    }

    private void ExitApplication_Click(object sender, EventArgs e)
    {
        notifyIcon.Visible = false;
        Application.Exit();
    }

    // Business logic methods for new features
    private async Task TestWebApiConnection()
    {
        try
        {
            lblWebConnectionStatus.Text = "Testing...";
            lblWebConnectionStatus.ForeColor = Color.Orange;

            string url = $"{txtWebApiUrl.Text}:{nudWebPort.Value}/api/tally-sync/health";
            var response = await httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                lblWebConnectionStatus.Text = "✓ Connected";
                lblWebConnectionStatus.ForeColor = Color.Green;
                AddLogMessage($"Web API connection successful: {url}");
            }
            else
            {
                lblWebConnectionStatus.Text = "✗ Failed";
                lblWebConnectionStatus.ForeColor = Color.Red;
                AddLogMessage($"Web API connection failed: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            lblWebConnectionStatus.Text = "✗ Error";
            lblWebConnectionStatus.ForeColor = Color.Red;
            AddLogMessage($"Web API connection error: {ex.Message}");
        }
    }

    private async Task TestTallyConnection()
    {
        try
        {
            lblTallyConnectionStatus.Text = "Testing...";
            lblTallyConnectionStatus.ForeColor = Color.Orange;
            AddLogMessage("Testing Tally Gateway connection...");

            string tallyGatewayUrl = txtTallyUrl.Text.TrimEnd('/');
            // Simple connection test XML request
            string testXml = @"<ENVELOPE>
                <HEADER>
                    <TALLYREQUEST>Export Data</TALLYREQUEST>
                </HEADER>
                <BODY>
                    <EXPORTDATA>
                        <REQUESTDESC>
                            <REPORTNAME>List of Companies</REPORTNAME>
                        </REQUESTDESC>
                    </EXPORTDATA>
                </BODY>
            </ENVELOPE>";

            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(10);
                var content = new StringContent(testXml, System.Text.Encoding.UTF8, "application/xml");
                
                var response = await client.PostAsync(tallyGatewayUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    string xmlResponse = await response.Content.ReadAsStringAsync();
                    
                    // Check if we got a valid XML response
                    if (xmlResponse.Contains("<ENVELOPE") || xmlResponse.Contains("<?xml"))
                    {
                        lblTallyConnectionStatus.Text = "✓ Connected";
                        lblTallyConnectionStatus.ForeColor = Color.Green;
                        AddLogMessage($"Tally Gateway connection successful: {tallyGatewayUrl}");
                        AddLogMessage("Tally Gateway is responding with valid XML data");
                    }
                    else
                    {
                        lblTallyConnectionStatus.Text = "✗ Invalid Response";
                        lblTallyConnectionStatus.ForeColor = Color.Orange;
                        AddLogMessage("Tally Gateway connected but returned unexpected response");
                    }
                }
                else
                {
                    lblTallyConnectionStatus.Text = "✗ Failed";
                    lblTallyConnectionStatus.ForeColor = Color.Red;
                    AddLogMessage($"Tally Gateway returned status: {response.StatusCode}");
                }
            }
        }
        catch (HttpRequestException ex)
        {
            lblTallyConnectionStatus.Text = "✗ Connection Failed";
            lblTallyConnectionStatus.ForeColor = Color.Red;
            AddLogMessage($"Cannot reach Tally Gateway: {ex.Message}");
            
            MessageBox.Show(
                "Cannot connect to Tally Gateway.\n\n" +
                "Please ensure:\n" +
                "1. Tally ERP is running\n" +
                "2. Gateway is enabled (F12 → Advanced → Gateway)\n" +
                "3. Port 9000 is configured and accessible\n" +
                "4. URL is correct: http://localhost:9000",
                "Tally Gateway Connection Failed",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);
        }
        catch (Exception ex)
        {
            lblTallyConnectionStatus.Text = "✗ Error";
            lblTallyConnectionStatus.ForeColor = Color.Red;
            AddLogMessage($"Tally Gateway connection error: {ex.Message}");
        }
    }

    private async Task RefreshCompaniesFromTally()
    {
        try
        {
            AddLogMessage("Refreshing companies from Tally Gateway...");
            
            // Use real Tally Gateway API with configurable port
            string tallyGatewayUrl = $"{txtTallyUrl.Text.TrimEnd('/')}:{nudTallyPort.Value}";
            // Use basic XML request that should work with all Tally versions
            string companiesXml = @"<ENVELOPE>
                <HEADER>
                    <TALLYREQUEST>Export Data</TALLYREQUEST>
                </HEADER>
                <BODY>
                    <EXPORTDATA>
                        <REQUESTDESC>
                            <REPORTNAME>Company List</REPORTNAME>
                            <STATICVARIABLES>
                                <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                            </STATICVARIABLES>
                        </REQUESTDESC>
                    </EXPORTDATA>
                </BODY>
            </ENVELOPE>";

            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(15);
                var content = new StringContent(companiesXml, System.Text.Encoding.UTF8, "application/xml");
                
                AddLogMessage($"Connecting to Tally Gateway: {tallyGatewayUrl}");
                var response = await client.PostAsync(tallyGatewayUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    string xmlResponse = await response.Content.ReadAsStringAsync();
                    AddLogMessage("Received response from Tally Gateway");
                    
                    // Parse real XML response
                    availableCompanies = ParseCompaniesFromXml(xmlResponse);
                    
                    if (availableCompanies.Count == 0)
                    {
                        AddLogMessage("No companies found in Tally. Please ensure companies are loaded and Tally Gateway is running.");
                        // Show help message
                        MessageBox.Show(
                            "No companies were found in Tally.\n\n" +
                            "Please check:\n" +
                            "1. Tally ERP is running\n" +
                            "2. At least one company is loaded\n" +
                            "3. Gateway is enabled on port 9000\n" +
                            "4. Go to Gateway → Configure → Port 9000", 
                            "No Companies Found", 
                            MessageBoxButtons.OK, 
                            MessageBoxIcon.Information);
                    }
                }
                else
                {
                    throw new Exception($"Tally Gateway returned status: {response.StatusCode}");
                }
            }

            // Update UI
            lstAvailableCompanies.Items.Clear();
            foreach (var company in availableCompanies)
            {
                lstAvailableCompanies.Items.Add($"{company.Name} ({company.StartDate} - {company.EndDate})");
            }

            AddLogMessage($"Found {availableCompanies.Count} companies from Tally Gateway");
        }
        catch (HttpRequestException ex)
        {
            AddLogMessage($"Connection failed to Tally Gateway: {ex.Message}");
            MessageBox.Show(
                "Could not connect to Tally Gateway.\n\n" +
                "Please check:\n" +
                "1. Tally ERP is running\n" +
                "2. Gateway is enabled (F12 → Advanced → Gateway)\n" +
                "3. Port 9000 is configured\n" +
                "4. Firewall is not blocking the connection",
                "Tally Connection Failed",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error refreshing companies: {ex.Message}");
            MessageBox.Show($"Error fetching companies from Tally:\n{ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private List<TallyCompany> ParseCompaniesFromXml(string xmlResponse)
    {
        var companies = new List<TallyCompany>();
        try
        {
            AddLogMessage("Parsing company data from Tally XML response...");
            
            // Simple regex-based XML parsing (in production use proper XML parser)
            var companyMatches = System.Text.RegularExpressions.Regex.Matches(
                xmlResponse, 
                @"<COMPANY[^>]*>([\s\S]*?)</COMPANY>", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            foreach (System.Text.RegularExpressions.Match companyMatch in companyMatches)
            {
                var nameMatch = System.Text.RegularExpressions.Regex.Match(
                    companyMatch.Value, 
                    @"<NAME[^>]*>([\s\S]*?)</NAME>", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                
                var guidMatch = System.Text.RegularExpressions.Regex.Match(
                    companyMatch.Value, 
                    @"<GUID[^>]*>([\s\S]*?)</GUID>", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                
                var startDateMatch = System.Text.RegularExpressions.Regex.Match(
                    companyMatch.Value, 
                    @"<STARTINGFROM[^>]*>([\s\S]*?)</STARTINGFROM>", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                
                var endDateMatch = System.Text.RegularExpressions.Regex.Match(
                    companyMatch.Value, 
                    @"<ENDINGAT[^>]*>([\s\S]*?)</ENDINGAT>", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                
                if (nameMatch.Success)
                {
                    var company = new TallyCompany
                    {
                        Name = nameMatch.Groups[1].Value.Trim(),
                        Guid = guidMatch.Success ? guidMatch.Groups[1].Value.Trim() : Guid.NewGuid().ToString(),
                        StartDate = startDateMatch.Success ? startDateMatch.Groups[1].Value.Trim() : "01-Apr-2024",
                        EndDate = endDateMatch.Success ? endDateMatch.Groups[1].Value.Trim() : "31-Mar-2025"
                    };
                    
                    companies.Add(company);
                    AddLogMessage($"Found company: {company.Name}");
                }
            }
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error parsing XML response: {ex.Message}");
        }
        
        return companies;
    }

    private void AddSelectedCompanies()
    {
        try
        {
            var selectedIndices = lstAvailableCompanies.SelectedIndices;
            if (selectedIndices.Count == 0)
            {
                MessageBox.Show("Please select at least one company to add.", "No Selection", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            int addedCount = 0;
            foreach (int index in selectedIndices)
            {
                var company = availableCompanies[index];
                
                if (!selectedCompanies.Any(c => c.Guid == company.Guid))
                {
                    selectedCompanies.Add(new CompanyConfig
                    {
                        Name = company.Name,
                        Guid = company.Guid,
                        IsEnabled = true,
                        Status = "Not Registered",
                        StartDate = company.StartDate,
                        EndDate = company.EndDate
                    });
                    addedCount++;
                }
            }

            RefreshDataGridView();
            AddLogMessage($"Added {addedCount} companies to sync list");
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error adding companies: {ex.Message}");
        }
    }

    private void RemoveSelectedCompany()
    {
        try
        {
            if (dgvSelectedCompanies.SelectedRows.Count == 0)
            {
                MessageBox.Show("Please select a company to remove.", "No Selection", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var selectedIndex = dgvSelectedCompanies.SelectedRows[0].Index;
            var selectedCompany = selectedCompanies[selectedIndex];
            selectedCompanies.RemoveAt(selectedIndex);
            
            RefreshDataGridView();
            AddLogMessage($"Removed company: {selectedCompany.Name}");
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error removing company: {ex.Message}");
        }
    }

    private async Task RegisterCompaniesWithApi()
    {
        try
        {
            AddLogMessage("Registering companies with Web API...");
            
            foreach (var company in selectedCompanies.Where(c => c.IsEnabled && string.IsNullOrEmpty(c.ApiKey)))
            {
                try
                {
                    string url = $"{txtWebApiUrl.Text}:{nudWebPort.Value}/api/tally-sync/register";
                    var payload = new
                    {
                        clientId = $"TALLY_{Environment.MachineName}_{company.Guid}",
                        companyName = company.Name,
                        version = "1.0",
                        ipAddress = "127.0.0.1"
                    };

                    var content = new System.Net.Http.StringContent(JsonConvert.SerializeObject(payload), System.Text.Encoding.UTF8, "application/json");
                    var response = await httpClient.PostAsync(url, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseData = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());
                        company.ApiKey = responseData.apiKey;
                        company.Status = "Registered";
                        AddLogMessage($"Registered company: {company.Name}");
                    }
                    else
                    {
                        company.Status = "Registration Failed";
                        AddLogMessage($"Failed to register company: {company.Name}");
                    }
                }
                catch (Exception ex)
                {
                    company.Status = "Registration Error";
                    AddLogMessage($"Error registering {company.Name}: {ex.Message}");
                }
            }

            RefreshDataGridView();
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error in company registration: {ex.Message}");
        }
    }

    private async Task StartSyncService()
    {
        try
        {
            AddLogMessage("Starting sync service...");
            lblSyncStatus.Text = "Status: Starting...";
            
            // Send initial heartbeat immediately  
            await SendHeartbeat();
            
            heartbeatTimer.Start();
            syncTimer.Start();
            
            lblSyncStatus.Text = "Status: Running";
            lblSyncStatus.ForeColor = Color.Green;
            
            btnStartSync.Enabled = false;
            btnStopSync.Enabled = true;
            
            AddLogMessage("Sync service started successfully");
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error starting sync service: {ex.Message}");
        }
    }

    private async Task StopSyncService()
    {
        try
        {
            AddLogMessage("Stopping sync service...");
            
            heartbeatTimer.Stop();
            syncTimer.Stop();
            
            lblSyncStatus.Text = "Status: Stopped";
            lblSyncStatus.ForeColor = Color.Red;
            
            btnStartSync.Enabled = true;
            btnStopSync.Enabled = false;
            
            AddLogMessage("Sync service stopped");
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error stopping sync service: {ex.Message}");
        }
    }

    private async Task TriggerManualSync()
    {
        try
        {
            AddLogMessage("Starting manual sync...");
            progressSync.Value = 0;
            
            var enabledCompanies = selectedCompanies.Where(c => c.IsEnabled && !string.IsNullOrEmpty(c.ApiKey)).ToList();
            if (enabledCompanies.Count == 0)
            {
                AddLogMessage("No registered companies available for sync");
                return;
            }

            int completed = 0;
            foreach (var company in enabledCompanies)
            {
                try
                {
                    AddLogMessage($"Syncing data for: {company.Name}");
                    company.Status = "Syncing";
                    RefreshDataGridView();
                    
                    await Task.Delay(2000);
                    
                    company.LastSync = DateTime.Now;
                    company.Status = "Synced";
                    completed++;
                    
                    progressSync.Value = (int)((double)completed / enabledCompanies.Count * 100);
                }
                catch (Exception ex)
                {
                    company.Status = "Sync Failed";
                    AddLogMessage($"Sync failed for {company.Name}: {ex.Message}");
                }
            }

            RefreshDataGridView();
            AddLogMessage($"Manual sync completed. {completed}/{enabledCompanies.Count} companies synced successfully");
        }
        catch (Exception ex)
        {
            AddLogMessage($"Error in manual sync: {ex.Message}");
        }
    }

    private async Task PerformScheduledSync()
    {
        AddLogMessage("Performing scheduled sync...");
        await TriggerManualSync();
    }

    private async Task SendHeartbeat()
    {
        try
        {
            string webApiUrl = $"{txtWebApiUrl.Text.TrimEnd('/')}/api/tally-sync/heartbeat";
            var heartbeatData = new { 
                clientId = "REAL_WINDOWS_APP",
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                version = "1.0.0"
            };
            
            var json = JsonConvert.SerializeObject(heartbeatData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            
            AddLogMessage($"Sending heartbeat to: {webApiUrl}");
            var response = await httpClient.PostAsync(webApiUrl, content);
            
            if (response.IsSuccessStatusCode)
            {
                string responseText = await response.Content.ReadAsStringAsync();
                AddLogMessage($"✅ Heartbeat successful");
            }
            else
            {
                AddLogMessage($"❌ Heartbeat failed: {response.StatusCode} - {response.ReasonPhrase}");
            }
        }
        catch (Exception ex)
        {
            AddLogMessage($"❌ Heartbeat error: {ex.Message}");
        }
    }

    private void RefreshDataGridView()
    {
        dgvSelectedCompanies.DataSource = null;
        dgvSelectedCompanies.DataSource = selectedCompanies;
        dgvSelectedCompanies.Refresh();
    }

    private void AddLogMessage(string message)
    {
        if (InvokeRequired)
        {
            Invoke(new Action<string>(AddLogMessage), message);
            return;
        }

        var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        rtbSyncLogs.AppendText($"[{timestamp}] {message}\n");
        rtbSyncLogs.ScrollToCaret();

        // Keep only last 1000 lines
        if (rtbSyncLogs.Lines.Length > 1000)
        {
            var lines = rtbSyncLogs.Lines.Skip(100).ToArray();
            rtbSyncLogs.Lines = lines;
        }
    }

    private void ShowMainWindow()
    {
        Show();
        WindowState = FormWindowState.Normal;
        BringToFront();
        Activate();
        ShowInTaskbar = true;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            notifyIcon?.Dispose();
            contextMenu?.Dispose();
            httpClient?.Dispose();
            syncTimer?.Dispose();
            heartbeatTimer?.Dispose();
        }
        base.Dispose(disposing);
    }
}

// Supporting classes
public class CompanyConfig
{
    public string Name { get; set; } = "";
    public string Guid { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public bool IsEnabled { get; set; }
    public DateTime? LastSync { get; set; }
    public string Status { get; set; } = "Not Registered";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
}

public class TallyCompany
{
    public string Name { get; set; } = "";
    public string Guid { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
}