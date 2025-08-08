using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace TallySync.Models
{
    public class AppSettings
    {
        public string WebApiUrl { get; set; } = "https://your-app.replit.app";
        public int WebApiPort { get; set; } = 443;
        public string TallyGatewayUrl { get; set; } = "http://localhost:9000";
        public List<CompanyConfig> Companies { get; set; } = new List<CompanyConfig>();
        public bool AutoStart { get; set; } = false;
        public int SyncInterval { get; set; } = 30; // minutes
        public bool MinimizeToTray { get; set; } = true;
        public DateTime LastSyncTime { get; set; } = DateTime.MinValue;
    }

    public class CompanyConfig : INotifyPropertyChanged
    {
        private string _name = "";
        private string _guid = "";
        private string _apiKey = "";
        private bool _isEnabled;
        private DateTime? _lastSync;
        private string _status = "Not Registered";

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(nameof(Name)); }
        }

        public string Guid
        {
            get => _guid;
            set { _guid = value; OnPropertyChanged(nameof(Guid)); }
        }

        public string ApiKey
        {
            get => _apiKey;
            set { _apiKey = value; OnPropertyChanged(nameof(ApiKey)); }
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set { _isEnabled = value; OnPropertyChanged(nameof(IsEnabled)); }
        }

        public DateTime? LastSync
        {
            get => _lastSync;
            set { _lastSync = value; OnPropertyChanged(nameof(LastSync)); }
        }

        public string Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(nameof(Status)); }
        }

        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class TallyCompany
    {
        public string Name { get; set; } = "";
        public string Guid { get; set; } = "";
        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";
    }

    public class SyncResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public int RecordsProcessed { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime SyncTime { get; set; } = DateTime.Now;
    }


}