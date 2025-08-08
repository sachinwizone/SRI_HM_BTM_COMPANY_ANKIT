# TallySync Pro - Professional Business Integration

## Overview
TallySync Pro is a comprehensive Windows desktop application that provides seamless integration between Tally ERP software and cloud-based business management systems. It features a modern, professional interface with animated controls and real-time synchronization capabilities.

## Features

### Professional UI Design
- **Tabbed Interface**: Connection, Companies, and Sync Status tabs for organized workflow
- **Animated Buttons**: Modern hover effects and smooth transitions
- **System Tray Integration**: Minimizes to system tray for background operation
- **Real-time Status Updates**: Live connection status and sync progress monitoring

### Core Capabilities
- **Dynamic Web Port Configuration**: Configurable cloud API endpoint and port settings
- **Multi-Company Management**: Support for multiple Tally companies with individual API keys
- **Automated Sync Service**: Scheduled and manual synchronization options
- **Real-time Logging**: Comprehensive activity logs with timestamps
- **Connection Testing**: Built-in connectivity testing for both Tally and Web API

### Technical Features
- **Heartbeat Monitoring**: Continuous connection health checks
- **Error Handling**: Robust error management with detailed logging
- **Configuration Persistence**: Settings saved locally and restored on startup
- **Background Processing**: Non-blocking operations with progress indicators

## Installation & Setup

### Requirements
- Windows 10/11 (64-bit)
- .NET 8.0 Runtime (included in self-contained deployment)
- Tally ERP software installed and running
- Internet connection for cloud API access

### Quick Start
1. Download `TallySync.exe` from the release package
2. Run the executable (no installation required)
3. Configure your cloud API URL and port in the Connection tab
4. Test connections to both Tally and Web API
5. Add companies from Tally and register them with the API
6. Start the sync service for automated data synchronization

## Configuration Guide

### Connection Setup
1. **Web API Configuration**:
   - Enter your cloud application URL (e.g., `https://your-app.replit.app`)
   - Set the appropriate port (default: 443 for HTTPS)
   - Click "Test Connection" to verify connectivity

2. **Tally Gateway Configuration**:
   - Default URL: `http://localhost:9000`
   - Ensure Tally is running with Gateway enabled
   - Click "Test Tally" to verify connection

### Company Management
1. **Available Companies**:
   - Click "Refresh Companies" to load from Tally
   - Select companies you want to sync
   - Click "Add Selected →" to move to sync list

2. **Selected Companies**:
   - Enable/disable individual companies for sync
   - Click "Register with API" to obtain API keys
   - Monitor sync status and last sync times

### Sync Operations
1. **Automatic Sync**:
   - Click "▶ Start Sync" to begin scheduled synchronization
   - Default interval: 30 minutes (configurable)
   - Runs in background with system tray notifications

2. **Manual Sync**:
   - Click "🔄 Manual Sync" for immediate synchronization
   - Progress bar shows completion status
   - Detailed logs show sync results

## Compilation Instructions

### Development Environment
```bash
# Prerequisites
- .NET 8.0 SDK
- Windows targeting enabled

# Clone and navigate to project
cd windows-app/TallySync

# Restore packages
dotnet restore

# Build debug version
dotnet build

# Build release version
dotnet build -c Release

# Publish self-contained executable
dotnet publish -c Release -r win-x64 --self-contained true
```

### Output Files
- **Debug Build**: `bin/Debug/net8.0-windows/TallySync.exe`
- **Release Build**: `bin/Release/net8.0-windows/win-x64/TallySync.exe`
- **Published Package**: Complete deployment package with all dependencies

## API Integration

### Authentication
- Uses API key-based authentication
- Format: `api_key_${clientId}`
- Automatic client registration with cloud API

### Endpoints
- **Health Check**: `/api/tally-sync/health`
- **Registration**: `/api/tally-sync/register`
- **Heartbeat**: `/api/tally-sync/heartbeat`
- **Data Sync**: Various endpoints for different data types

## Troubleshooting

### Common Issues
1. **Connection Failures**:
   - Verify internet connectivity
   - Check firewall settings
   - Ensure Tally Gateway is running on port 9000

2. **Registration Errors**:
   - Verify Web API URL and port
   - Check API endpoint availability
   - Review error logs for specific issues

3. **Sync Problems**:
   - Ensure companies are properly registered
   - Check that API keys are valid
   - Monitor sync logs for detailed error information

### Log Analysis
- All activities are logged with timestamps
- Error messages include stack traces for debugging
- Logs can be cleared manually or automatically rotated

## System Requirements

### Minimum Requirements
- Windows 10 (Version 1809 or later)
- 2 GB RAM
- 500 MB disk space
- .NET 8.0 Runtime

### Recommended Requirements
- Windows 11
- 4 GB RAM
- 1 GB disk space
- High-speed internet connection

## Security Considerations

### Data Protection
- API keys stored securely in local configuration
- HTTPS communication with cloud services
- No sensitive data cached locally beyond configuration

### Network Security
- All API communication uses secure HTTPS
- Local Tally communication over HTTP localhost only
- Configurable timeout settings for connection management

## Support & Maintenance

### Version Information
- **Version**: 1.0.0.0
- **Target Framework**: .NET 8.0 Windows
- **Architecture**: x64
- **Deployment**: Self-contained

### Dependencies
- Newtonsoft.Json: JSON serialization
- Microsoft.Extensions.* : Configuration and dependency injection
- System.Windows.Forms: Windows GUI framework

## License
This software is proprietary and licensed for business use. See license agreement for terms and conditions.