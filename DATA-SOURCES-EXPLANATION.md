# Data Sources in Tally Integration System

## Current State: Demo Mode + Database Ready

### 🔄 **Simulated Data (Active)**
- **Connection Status**: Real (based on Windows app heartbeat)
- **Companies**: Hardcoded demo companies ("Wizone IT Network", "Wizone IT Solutions")
- **Sync Records**: Hardcoded counts (100/100 records)
- **Purpose**: Demonstration while Windows app integration is being established

### ✅ **Real Database (Ready for Data)**
- **Location**: PostgreSQL database in production
- **Tables**: 
  - `clients` - Customer/Ledger data with Tally sync fields
  - `orders` - Sales voucher data with Tally integration
  - `payments` - Payment entries with sync tracking
  - `tasks`, `eway_bills`, etc. - All business entities ready

### 🎯 **Where to View Data**

#### 1. **Tally Integration Dashboard** 
- URL: `/tally-integration`
- Shows: Connection status, demo companies, sync controls
- Data Source: Simulated + Connection status (real)

#### 2. **Main Business Dashboard**
- URL: `/` (home page)  
- Shows: Real business metrics from database
- Data Source: Actual PostgreSQL database

#### 3. **Individual Pages**
- `/clients` - Real client records (currently empty)
- `/orders` - Real order records (currently empty)
- `/payments` - Real payment records (currently empty)

### 🔄 **How to Get Real Tally Data**

1. **Windows App Connection**: TallySync.exe must be running and connected
2. **Tally Gateway**: Port 9000 must be accessible on Tally machine
3. **Data Sync**: Windows app fetches real XML data from Tally and sends to cloud
4. **Database Population**: Cloud API receives data and saves to PostgreSQL

### 📊 **Current Demo vs Real Data**

| Component | Status | Data Source |
|-----------|--------|-------------|
| Connection Status | ✅ Real | Windows app heartbeat |
| Companies List | ❌ Demo | Hardcoded names |
| Sync Counts | ❌ Demo | Hardcoded (100/100) |
| Client Records | ✅ Ready | PostgreSQL (empty) |
| Order Records | ✅ Ready | PostgreSQL (empty) |
| Payment Records | ✅ Ready | PostgreSQL (empty) |

### 🚀 **To Get Real Data**
1. Run Windows app with Tally connection
2. Real companies will populate from XML
3. Sync will populate database tables
4. Dashboard will show actual business metrics