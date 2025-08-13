# Tally Integration Setup Guide

## Architecture Overview

आपका system अब **Tally as Client** architecture implement करता है:

```
Tally Software → XML Request → Your Web Server → SQL Database
              ← XML Response ←
```

## Tally Configuration

### 1. Tally में TDL File Setup करें:

Create a file `TallySync.tdl` in your Tally folder:

```tdl
[#TDL Version]
1.0

[Collection: TallySync]
Type        : Remote
Host        : "YOUR_REPLIT_URL"
Port        : 443
URL         : "/tally"
Protocol    : "HTTPS"

[System: Formula]
TallySync Host : ##TallySyncHost

[#Menu: Gateway of Tally]
Add: Item: "TallySync Integration": Call: TallySync

[Function: TallySync]
00 : HTTP Post URL: @@TallySyncHost + "/tally"
01 : HTTP Post Data: "<ENVELOPE><HEADER><TYPE>Data</TYPE><ID>SyncData</ID></HEADER><BODY><TALLYMESSAGE>" + ##SVCurrentCompany + "</TALLYMESSAGE></BODY></ENVELOPE>"
```

### 2. Tally से Data Export करने के लिए:

```xml
<!-- Company Data Export Request -->
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>GetCompanyData</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE>1-Apr-2024</SVFROMDATE>
                <SVTODATE>31-Mar-2025</SVTODATE>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE>
                <COMPANY>
                    <NAME>@@CompanyName</NAME>
                </COMPANY>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>
```

## Server Endpoints

### 1. Main Tally Endpoint
- **URL**: `https://your-repl-url.repl.co/tally`
- **Method**: POST
- **Content-Type**: `application/xml`
- **Purpose**: Tally software भेजेगा XML requests यहाँ

### 2. Alternative XML Endpoint
- **URL**: `https://your-repl-url.repl.co/api/tally/xml`
- **Method**: POST
- **Content-Type**: `application/xml`
- **Purpose**: Backup endpoint for XML data

### 3. Health Check
- **URL**: `https://your-repl-url.repl.co/tally`
- **Method**: GET
- **Purpose**: Tally connectivity test

## Supported XML Operations

### 1. Company Information
```xml
<ENVELOPE>
    <HEADER>
        <TYPE>Data</TYPE>
        <ID>GetCompanyInfo</ID>
    </HEADER>
</ENVELOPE>
```

### 2. Data Import
```xml
<ENVELOPE>
    <HEADER>
        <TYPE>Import</TYPE>
        <ID>ImportData</ID>
    </HEADER>
    <BODY>
        <TALLYMESSAGE>
            <LEDGER NAME="Cash">
                <OPENINGBALANCE>10000</OPENINGBALANCE>
                <PARENT>Cash-in-Hand</PARENT>
            </LEDGER>
        </TALLYMESSAGE>
    </BODY>
</ENVELOPE>
```

### 3. Data Export
```xml
<ENVELOPE>
    <HEADER>
        <TYPE>Export</TYPE>
        <ID>ExportData</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>
```

## Database Tables

Data automatically store होगा इन tables में:

1. **tally_companies** - Company information
2. **tally_ledgers** - Chart of accounts
3. **tally_stock_items** - Inventory items
4. **tally_vouchers** - Transactions
5. **tally_sync_logs** - Sync operation logs

## Testing Steps

### 1. Test Server Connectivity:
```bash
curl -X GET https://your-repl-url.repl.co/tally
```

### 2. Test XML Request:
```bash
curl -X POST https://your-repl-url.repl.co/tally \
  -H "Content-Type: application/xml" \
  -d '<ENVELOPE><HEADER><TYPE>Data</TYPE><ID>GetCompanyInfo</ID></HEADER></ENVELOPE>'
```

### 3. Check Logs:
Web interface में Tally Integration page पर जाकर sync logs check करें।

## Configuration in Tally

1. **Gateway of Tally** में जाएं
2. **TallySync Integration** option select करें  
3. **Host**: `your-repl-url.repl.co`
4. **Port**: `443`
5. **URL**: `/tally`
6. **Protocol**: `HTTPS`

## Key Features

✅ **XML Request/Response Handling**
✅ **Company Data Sync**
✅ **Ledger Management**
✅ **Stock Item Tracking**
✅ **Voucher Processing**
✅ **Real-time Sync Logs**
✅ **Error Handling**
✅ **TDL Support**

Ab aapka Tally software directly आपके web server se communicate कर सकेगा!