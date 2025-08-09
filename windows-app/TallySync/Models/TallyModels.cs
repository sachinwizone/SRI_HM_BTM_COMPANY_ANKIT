using System;

namespace TallySync.Models
{
    public class TallyCompany
    {
        public string Name { get; set; } = string.Empty;
        public string Guid { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string DatabasePath { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class TallyLedger
    {
        public string Name { get; set; } = string.Empty;
        public string Guid { get; set; } = string.Empty;
        public string Parent { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GstNumber { get; set; } = string.Empty;
        public string PanNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime LastModified { get; set; } = DateTime.Now;
    }

    public class TallyVoucher
    {
        public string VoucherNumber { get; set; } = string.Empty;
        public string Guid { get; set; } = string.Empty;
        public string VoucherType { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Narration { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string PartyName { get; set; } = string.Empty;
        public bool IsCancelled { get; set; } = false;
        public DateTime LastModified { get; set; } = DateTime.Now;
    }

    public class SyncResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ProcessedCount { get; set; }
        public int ErrorCount { get; set; }
        public DateTime SyncTime { get; set; } = DateTime.Now;
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    public class ConnectionStatus
    {
        public bool IsTallyConnected { get; set; }
        public bool IsCloudConnected { get; set; }
        public string TallyVersion { get; set; } = string.Empty;
        public string LastHeartbeat { get; set; } = string.Empty;
        public string LastSync { get; set; } = string.Empty;
        public int ActiveConnections { get; set; }
        public string Status { get; set; } = "Disconnected";
    }

    public class TallyConnectionRequest
    {
        public string ClientId { get; set; } = "REAL_WINDOWS_APP";
        public string MachineName { get; set; } = Environment.MachineName;
        public string Version { get; set; } = "1.0.0";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string TallyGatewayUrl { get; set; } = "http://localhost:9000";
        public bool IsReal { get; set; } = true;
    }
}