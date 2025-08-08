# TallySync Pro - सेटअप गाइड (हिंदी)

## समस्या निवारण और इंस्टॉलेशन

### मुख्य समस्याएं और समाधान

#### 1. **Application चलाने की समस्या**
यदि `TallySync.exe` नहीं चल रहा है:

**समाधान A: .NET Runtime इंस्टॉल करें**
```
1. Microsoft .NET 8.0 Runtime डाउनलोड करें
2. इस लिंक पर जाएं: https://dotnet.microsoft.com/download/dotnet/8.0
3. "Download .NET Desktop Runtime 8.0" पर क्लिक करें
4. Windows x64 version डाउनलोड करें
5. इंस्टॉल करने के बाद TallySync.exe चलाएं
```

**समाधान B: सभी फ़ाइलों के साथ चलाएं**
```
1. पूरा windows-app/TallySync/bin/Release/net8.0-windows/win-x64/ फ़ोल्डर कॉपी करें
2. इस फ़ोल्डर को अपने Windows PC में कॉपी करें
3. TallySync.exe पर डबल-क्लिक करें
```

#### 2. **Antivirus/Windows Defender की समस्या**
```
1. Windows Defender को temporarily disable करें
2. या फिर TallySync.exe को exceptions में add करें
3. Right-click > Properties > Unblock (अगर available हो)
```

#### 3. **Administrator Rights की समस्या**
```
1. TallySync.exe पर right-click करें
2. "Run as Administrator" select करें
```

### स्टेप-बाई-स्टेप सेटअप

#### चरण 1: तैयारी
1. **Tally ERP खोलें**
   - Gateway को port 9000 पर enable करें
   - F12 > Advanced Features > Enable Gateway

2. **Internet Connection check करें**
   - आपका cloud API URL accessible होना चाहिए
   - Example: https://your-app.replit.app

#### चरण 2: TallySync चलाना
1. **Download करें**
   - TallySync.exe या पूरा release फ़ोल्डर
   
2. **Run करें**
   - Administrator के रूप में चलाएं
   - Windows Defender allow करें

#### चरण 3: Configuration
1. **Connection Tab में:**
   - Web API URL डालें: `https://your-app.replit.app`
   - Port: `443`
   - "Test Connection" दबाएं
   
2. **Tally Gateway:**
   - URL: `http://localhost:9000`
   - "Test Tally" दबाएं

#### चरण 4: Company Setup
1. **Companies Tab में:**
   - "Refresh Companies" दबाएं
   - Available companies select करें
   - "Add Selected" दबाएं
   - "Register with API" दबाएं

#### चरण 5: Sync Start करना
1. **Sync Status Tab में:**
   - "▶ Start Sync" दबाएं
   - Automatic sync चालू हो जाएगा
   - Manual sync के लिए "🔄 Manual Sync" दबाएं

### तकनीकी विवरण

#### System Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **RAM**: कम से कम 2 GB
- **Disk Space**: 500 MB
- **.NET Version**: 8.0 Runtime (automatic install हो जाता है)

#### Error Codes और समाधान

**Error: "Application failed to start"**
```
समाधान:
1. .NET 8.0 Runtime install करें
2. Visual C++ Redistributable install करें
3. Administrator rights से चलाएं
```

**Error: "Connection failed"**
```
समाधान:
1. Internet connection check करें
2. Firewall settings check करें
3. URL और port number verify करें
```

**Error: "Tally not found"**
```
समाधान:
1. Tally ERP खुला होना चाहिए
2. Gateway enabled होना चाहिए (port 9000)
3. Company loaded होनी चाहिए
```

### Alternative: Browser में चलाना
अगर Windows app काम नहीं कर रहा, तो browser में भी चला सकते हैं:

1. **Web Browser खोलें**
2. **URL जाएं**: `https://your-app.replit.app`
3. **Tally Sync Page**: `/tally-sync` पर जाएं
4. **Manual configuration** करें

### Support Contact
समस्या के लिए technical logs के साथ संपर्क करें:
- Error messages screenshot लें
- Application logs copy करें
- System configuration details भेजें

---

## Quick Fix Commands (अगर development environment में हैं)

```bash
# Re-compile करने के लिए:
cd windows-app
dotnet clean TallySync
dotnet build TallySync -c Release

# Self-contained build के लिए:
dotnet publish TallySync -c Release -r win-x64 --self-contained true

# Single file executable के लिए:
dotnet publish TallySync -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

### Latest Build Location
```
windows-app/TallySync/bin/Release/net8.0-windows/win-x64/TallySync.exe
```

यह file directly Windows पर चल सकती है, बिना किसी additional installation के।