# TallySync - Tally ERP Integration for Business Management System

## Overview

TallySync is a Windows desktop application that provides real-time and scheduled data synchronization between Tally ERP accounting software and your Business Management System. This bridge application eliminates the need for static IP addresses or complex network configurations.

## Features

- **Real-time Data Sync**: Live synchronization of ledgers, vouchers, and stock items
- **Scheduled Sync**: Automated synchronization at configurable intervals
- **System Tray Integration**: Runs quietly in the background
- **Connection Monitoring**: Automatic retry and reconnection capabilities
- **Comprehensive Logging**: Detailed logs for troubleshooting
- **Configuration Management**: Easy setup and configuration management

## System Requirements

- Windows 10 or later
- .NET 8.0 Runtime
- Tally ERP 9 with Gateway enabled (Port 9000)
- Internet connection for web API access

## Installation & Setup

### Step 1: Download and Install .NET 8.0 Runtime

1. Go to [Microsoft .NET Download Page](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Download ".NET 8.0 Runtime" for Windows x64
3. Run the installer and follow installation steps

### Step 2: Prepare Tally ERP

1. Open Tally ERP 9
2. Go to **Gateway of Tally** → **Configure** → **Advanced Configuration**
3. Enable **"Load on Startup"**
4. Set Port to **9000** (default)
5. Restart Tally ERP

### Step 3: Build and Install TallySync

1. Extract the TallySync application files
2. Run `build-script.bat` as Administrator
3. The compiled application will be in `bin\Release\net8.0-windows\` folder

### Step 4: Configure TallySync

1. Run `TallySync.exe`
2. Click **"Configuration"** button
3. Fill in the required details:
   - **Tally Server URL**: `http://localhost:9000` (default)
   - **Company Name**: Your Tally company name
   - **Web API URL**: Your business management system URL
   - **API Key**: Provided by your system administrator
   - **Sync Mode**: Choose Real-time or Scheduled
   - **Sync Interval**: For scheduled sync (in minutes)

### Step 5: Test Connection

1. Click **"Test Connections"** to verify:
   - Tally ERP connection
   - Web API connection
2. If successful, click **"Start Sync"**

## Usage

### Starting the Application

1. Double-click `TallySync.exe`
2. The application will start and appear in the system tray
3. Right-click the system tray icon for options

### Monitoring Sync Status

- **Green Icon**: All connections active, sync running
- **Yellow Icon**: Warning or connection issues
- **Red Icon**: Error or sync stopped

### Manual Sync

- Right-click system tray icon
- Select **"Sync Now"** for immediate synchronization

### Viewing Logs

- Right-click system tray icon
- Select **"View Logs"** to see detailed sync activity

## Data Synchronization

### What Gets Synced

1. **Ledgers → Clients**: Customer/vendor information
2. **Vouchers → Payments/Orders**: Transaction records
3. **Stock Items → Products**: Inventory data (if applicable)

### Sync Process

1. **Connection Test**: Verifies Tally and Web API connectivity
2. **Data Extraction**: Retrieves modified data from Tally
3. **Data Transformation**: Converts Tally format to web format
4. **Data Upload**: Sends transformed data to web API
5. **Status Update**: Records sync completion time

### Conflict Resolution

- Existing records are updated based on Tally GUID
- New records are created with fresh IDs
- Sync timestamps track last modification

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Tally"
- Ensure Tally ERP is running
- Check Gateway is enabled on port 9000
- Verify Tally company is opened

#### 2. "Web API connection failed"
- Check internet connection
- Verify Web API URL is correct
- Confirm API key is valid

#### 3. "Sync errors"
- Check logs for detailed error messages
- Verify data format compatibility
- Contact system administrator

#### 4. "Application not starting"
- Ensure .NET 8.0 Runtime is installed
- Run as Administrator
- Check Windows Event Viewer for errors

### Log Files Location

Logs are stored in: `%AppData%\TallySync\Logs\`

### Configuration Files

Configuration is stored in: `%AppData%\TallySync\config.json`

## API Endpoints

The web application provides these Tally sync endpoints:

- `POST /api/tally-sync/sync/clients` - Sync client data
- `POST /api/tally-sync/sync/payments` - Sync payment data  
- `POST /api/tally-sync/sync/orders` - Sync order data
- `GET /api/tally-sync/sync/status` - Get sync status
- `GET /api/tally-sync/health` - Health check

## Security Considerations

- API keys are stored encrypted locally
- All communication uses HTTPS when possible
- Tally connection is local only (localhost)
- No sensitive financial data is cached locally

## Support

For technical support or issues:

1. Check the troubleshooting section
2. Review log files for error details
3. Contact your system administrator
4. Provide detailed error messages and log excerpts

## Version History

- **v1.0.0**: Initial release with basic sync functionality
- Real-time and scheduled sync modes
- System tray integration
- Configuration management
- Comprehensive logging

## License

This software is proprietary and licensed for use with the Business Management System only.