# TallySync Pro - Download करने के निर्देश

## तुरंत चलाने के लिए (Immediate Use)

### Option 1: Single Executable File
```
File Location: windows-app/TallySync/bin/Release/net8.0-windows/win-x64/TallySync.exe
File Size: ~140KB
Requirements: .NET 8.0 Runtime (auto-install होगा)
```

### Option 2: Complete Package
```
Folder: windows-app/TallySync/bin/Release/net8.0-windows/win-x64/
Total Size: ~150MB
Requirements: कोई additional software नहीं चाहिए
```

## Download Steps

### Windows PC पर Download करने के लिए:

1. **Replit से Download करें:**
   ```
   1. Files panel में जाएं
   2. windows-app/TallySync/bin/Release/net8.0-windows/win-x64/ folder पर जाएं
   3. TallySync.exe पर right-click करें
   4. "Download" select करें
   ```

2. **Git से Download करें:**
   ```bash
   git clone <repository-url>
   cd windows-app/TallySync/bin/Release/net8.0-windows/win-x64/
   # TallySync.exe को copy करें
   ```

3. **Direct Copy करें:**
   ```
   पूरा win-x64 folder को zip करके download करें
   Windows PC में extract करें
   TallySync.exe पर double-click करें
   ```

## Installation Steps

### Step 1: Download
- TallySync.exe file download करें
- या पूरा win-x64 folder download करें

### Step 2: Windows PC पर Setup
```
1. Downloaded file को Desktop पर रखें
2. Right-click > Properties > Unblock (अगर दिखे)
3. Antivirus में exception add करें (optional)
4. Double-click करके चलाएं
```

### Step 3: First Time Setup
```
1. "Run as Administrator" select करें
2. Windows Defender popup में "Allow" दबाएं
3. Application खुल जाएगी
```

## Troubleshooting

### अगर .exe file नहीं चल रही:

**Solution 1: .NET Runtime Install करें**
```
1. https://dotnet.microsoft.com/download/dotnet/8.0 पर जाएं
2. "Download .NET Desktop Runtime 8.0" click करें
3. Windows x64 version download करें
4. Install करने के बाद TallySync.exe चलाएं
```

**Solution 2: Dependencies के साथ चलाएं**
```
1. Complete win-x64 folder download करें
2. सभी files एक साथ रखें
3. TallySync.exe चलाएं
```

**Solution 3: Compatibility Mode**
```
1. TallySync.exe पर right-click करें
2. Properties > Compatibility tab
3. "Run this program in compatibility mode" check करें
4. Windows 10 select करें
5. Apply > OK
```

## Configuration After Installation

### Step 1: Tally ERP Setup
```
1. Tally खोलें
2. F12 > Advanced Configuration
3. Configuration > Enable Gateway
4. Port 9000 set करें
5. Gateway enable करें
```

### Step 2: TallySync Configuration
```
1. Connection tab में:
   - Web API URL: https://your-app.replit.app
   - Port: 443
   - Test Connection

2. Companies tab में:
   - Refresh Companies
   - Companies select करें
   - Register with API

3. Sync Status tab में:
   - Start Sync दबाएं
```

## Quick Test

### Application Test करने के लिए:
```
1. TallySync.exe चलाएं
2. Connection tab में "Test Connection" दबाएं
3. अगर green tick दिखे तो setup complete है
4. अगर error आए तो troubleshooting guide follow करें
```

### System Requirements Check:
```
✓ Windows 10/11 (64-bit)
✓ 2GB RAM minimum
✓ Internet connection
✓ Tally ERP installed
✓ Administrator rights
```

## Alternative: Web Version

अगर Windows app में problem है, तो web version use करें:
```
1. Browser में जाएं: https://your-app.replit.app
2. Tally Sync section खोलें
3. Manual configuration करें
```

---

## Latest Build Info
```
Build Date: August 8, 2025
Version: 1.0.0.0
Target: .NET 8.0 Windows
Architecture: x64
File Size: 142KB (standalone)
Package Size: ~150MB (with dependencies)
```

Download link ready है - आप तुरंत use कर सकते हैं!