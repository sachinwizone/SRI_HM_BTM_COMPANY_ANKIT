# Credit Flow Application - Production Setup

## 🚀 Running the Application Permanently

Your Credit Flow application is now configured to run permanently in production mode. Here are your options:

### Option 1: Quick Start (Recommended)
Double-click on `run-permanent.bat` to start the application with auto-restart capability.

### Option 2: Manual Command
Run the following command in PowerShell:
```powershell
$env:NODE_ENV="production"; $env:PORT="3000"; $env:DATABASE_URL="postgresql://postgres:ss123456@103.122.85.61:9095/postgres"; npx tsx server/index.ts
```

### Option 3: Using NPM Scripts
```bash
npm run build          # Build the client
npm start              # Start with built files
```

## 📋 Application Details

- **URL**: http://localhost:3000
- **Login**: admin / admin123
- **Environment**: Production
- **Database**: PostgreSQL (103.122.85.61:9095)
- **Auto-restart**: Enabled (with batch script)

## 🔧 Features Enabled

✅ **Authentication System**: Admin login working  
✅ **Navigation**: All modules accessible  
✅ **Database**: PostgreSQL with 41 tables  
✅ **File Management**: Local storage with proper MIME types  
✅ **Tour Advance**: Fixed foreign key constraints  
✅ **Client Management**: Document upload/download working  
✅ **Production Ready**: Built and optimized for performance  

## 🛠️ Management Commands

### Check Application Status
```powershell
netstat -ano | findstr :3000
```

### Stop Application
Press `Ctrl+C` in the terminal or close the command window.

### View Logs
Logs are displayed in the console. For persistent logging, redirect output:
```bash
npx tsx server/index.ts > app.log 2>&1
```

## 🔒 Security Notes

- Application runs on localhost (127.0.0.1) by default
- For external access, configure firewall and network settings
- Database credentials are configured for the PostgreSQL server
- File uploads are stored locally in the `uploads/` directory

## 📁 Directory Structure

```
Credit-Flow/
├── server/           # Backend application
├── client/           # Frontend source
├── dist/            # Built client files
├── uploads/         # File storage
├── logs/            # Application logs
└── run-permanent.bat # Production startup script
```

## 🆘 Troubleshooting

1. **Port 3000 in use**: Change PORT environment variable
2. **Database connection**: Verify PostgreSQL server is running
3. **Build errors**: Run `npm run build` first
4. **File uploads**: Ensure `uploads/` directory exists

## 📞 Support

For issues or questions, check the application logs or restart using the batch script.