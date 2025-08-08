using System.ComponentModel.DataAnnotations;

namespace TallySync.Models;

public class TallyConfig
{
    public string TallyServerUrl { get; set; } = "http://localhost:9000";
    public string CompanyName { get; set; } = "";
    public string WebApiUrl { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public SyncMode SyncMode { get; set; } = SyncMode.Scheduled;
    public int SyncIntervalMinutes { get; set; } = 15;
    public DateTime LastSyncTime { get; set; } = DateTime.MinValue;
    public bool AutoStartWithWindows { get; set; } = true;
    public bool MinimizeToTray { get; set; } = true;
}

public enum SyncMode
{
    Realtime,
    Scheduled
}

public class TallyLedger
{
    public string GUID { get; set; } = "";
    public string Name { get; set; } = "";
    public string Parent { get; set; } = "";
    public string Alias { get; set; } = "";
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public string Group { get; set; } = "";
    public DateTime LastModified { get; set; }
}

public class TallyVoucher
{
    public string GUID { get; set; } = "";
    public string VoucherTypeName { get; set; } = "";
    public string VoucherNumber { get; set; } = "";
    public DateTime Date { get; set; }
    public string Reference { get; set; } = "";
    public string Narration { get; set; } = "";
    public decimal Amount { get; set; }
    public string PartyLedgerName { get; set; } = "";
    public DateTime LastModified { get; set; }
    public List<TallyVoucherEntry> Entries { get; set; } = new();
}

public class TallyVoucherEntry
{
    public string LedgerName { get; set; } = "";
    public decimal Amount { get; set; }
    public bool IsDeemedPositive { get; set; }
}

public class TallyStockItem
{
    public string GUID { get; set; } = "";
    public string Name { get; set; } = "";
    public string Alias { get; set; } = "";
    public string Parent { get; set; } = "";
    public string Category { get; set; } = "";
    public string BaseUnits { get; set; } = "";
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal OpeningValue { get; set; }
    public decimal ClosingValue { get; set; }
    public DateTime LastModified { get; set; }
}

public class TallySyncResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public int RecordsProcessed { get; set; }
    public int RecordsSuccess { get; set; }
    public int RecordsError { get; set; }
    public DateTime SyncTime { get; set; } = DateTime.Now;
    public TimeSpan Duration { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class WebApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();
}