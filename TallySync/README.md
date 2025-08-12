# TallySync - Tally to Cloud Integration

A robust Windows application for seamless Tally synchronization, offering advanced business data management and connectivity solutions for enterprise-level financial workflows.

## Features

- **Real-time Synchronization**: Automatic sync of Tally data with cloud APIs
- **Robust Error Handling**: Retry mechanisms with exponential backoff
- **Configurable Intervals**: Customizable sync frequency (default: 15 minutes)
- **Comprehensive Logging**: Detailed logs for monitoring and troubleshooting
- **Windows Service**: Can run as a background service
- **GUI Application**: User-friendly interface for monitoring and control
- **Command Line Support**: CLI commands for testing and automation

## System Requirements

- Windows 10/11 or Windows Server 2016+
- .NET 8.0 Runtime (included in self-contained builds)
- Tally ERP 9 with XML/HTTP server enabled
- Internet connection for cloud synchronization

## Tally Configuration

Before using TallySync, configure Tally ERP 9:

1. **Enable Web Server**:
   - Go to Gateway of Tally → F11 (Features) → Company Features
   - Set "Enable Web Server" = Yes
   - Set "Accept Local Connections" = Yes

2. **Enable ODBC/XML Server**:
   - In the same Features menu
   - Set "Enable ODBC/XML Server on Port" = 9000 (or your preferred port)

3. **Firewall Settings**:
   - Allow Tally through Windows Firewall
   - Ensure port 9000 (or configured port) is accessible

## Installation

### Option 1: Install as Windows Service (Recommended)

1. **Download and Extract**: Extract the TallySync release package
2. **Run PowerShell as Administrator**
3. **Navigate to the TallySync directory**
4. **Run the installer**:
   ```powershell
   .\install-service.ps1
   ```

### Option 2: Run as Desktop Application

1. **Build the application**:
   ```bash
   dotnet build -c Release
   ```
2. **Run the executable**:
   ```bash
   .\bin\Release\net8.0-windows\TallySync.exe
   ```

## Configuration

### appsettings.json

Edit the `appsettings.json` file to configure your setup:

```json
{
  "Tally": {
    "Host": "localhost",
    "Port": 9000,
    "Company": "",
    "PollMinutes": 15
  },
  "Cloud": {
    "BaseUrl": "https://your-replit-app.replit.dev",
    "ApiKey": "YOUR_API_KEY_HERE",
    "TimeoutSec": 60
  },
  "Sync": {
    "IntervalMinutes": 15,
    "BatchSize": 100,
    "DateRange": {
      "FromDate": "2024-01-01",
      "ToDate": "2024-12-31"
    }
  }
}
```

### Required Configuration Steps

1. **Set Cloud API URL**: Replace `your-replit-app.replit.dev` with your actual Replit app URL
2. **Set API Key**: Get your API key from the Replit web application and update the config
3. **Adjust Tally Settings**: Modify host/port if Tally runs on different settings
4. **Set Date Range**: Configure the date range for data synchronization

## Usage

### GUI Application

1. **Start the Application**: Double-click `TallySync.exe`
2. **Test Connection**: Click "Test Connection" to verify Tally and cloud connectivity
3. **Start Sync**: Click "Start Sync" to begin automatic synchronization
4. **Monitor Logs**: View real-time logs in the application window

### Command Line Interface

```bash
# Test Tally connection
TallySync.exe --test-connection

# Send sample data to cloud
TallySync.exe --push-sample

# Show help
TallySync.exe --help
```

### Windows Service Management

```powershell
# Start service
Start-Service -Name "TallySyncService"

# Stop service
Stop-Service -Name "TallySyncService"

# Restart service
Restart-Service -Name "TallySyncService"

# Check service status
Get-Service -Name "TallySyncService"
```

## Data Synchronization

TallySync synchronizes the following data types:

- **Companies**: Company master data
- **Ledgers**: Chart of accounts and ledger balances
- **Stock Items**: Inventory items and stock levels
- **Vouchers**: All transaction vouchers (Sales, Purchase, Payment, Receipt, etc.)

### Sync Process

1. **Data Extraction**: Fetches data from Tally using XML requests
2. **Data Transformation**: Converts Tally XML to JSON format
3. **Batch Processing**: Sends data in configurable batches (default: 100 records)
4. **Error Handling**: Retries failed requests with exponential backoff
5. **State Tracking**: Maintains sync state and prevents duplicate transfers

## Monitoring and Troubleshooting

### Log Files

- **Application Logs**: `%ProgramData%\Wizone\TallyConnector\logs\app.log`
- **Windows Event Log**: Check Windows Event Viewer under "Applications"

### Common Issues

1. **Tally Connection Failed**:
   - Verify Tally is running and XML server is enabled
   - Check firewall settings
   - Confirm port configuration

2. **Cloud API Connection Failed**:
   - Verify internet connectivity
   - Check API key configuration
   - Ensure Replit app is running

3. **Service Won't Start**:
   - Check Windows Event Log for detailed errors
   - Verify configuration file syntax
   - Ensure proper permissions on data directories

### Testing Commands

```bash
# Test Tally connectivity
TallySync.exe --test-connection

# Test cloud API with sample data
TallySync.exe --push-sample
```

## Uninstallation

To remove TallySync:

```powershell
# Run as Administrator
.\uninstall-service.ps1

# To also remove data and logs
.\uninstall-service.ps1 -RemoveData
```

## Security Considerations

- **API Keys**: Store securely and rotate regularly
- **Network**: Use HTTPS for all cloud communications
- **Access**: Run service with minimal required privileges
- **Firewall**: Restrict Tally port access to localhost only

## Support

For technical support and troubleshooting:

1. Check the log files for detailed error messages
2. Verify all configuration settings
3. Test connections using the CLI commands
4. Review the Windows Event Log for system-level errors

## Version History

- **v1.0**: Initial release with basic sync functionality
- **v1.1**: Added GUI interface and improved error handling
- **v1.2**: Enhanced logging and state management
- **v1.3**: Added command-line testing tools

## License

This software is provided as-is for integration with Tally ERP 9 and cloud-based business management systems.