using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using TallySync.Models;

namespace TallySync.Services
{
    public class TallySyncManager
    {
        private readonly RealTallyConnector _tallyConnector;
        private readonly CloudApiService _cloudService;
        private Timer _heartbeatTimer;
        private Timer _syncTimer;
        private bool _isRunning;
        private bool _autoSyncEnabled = true;

        public event EventHandler<string> LogMessageReceived;
        public event EventHandler<ConnectionStatus> ConnectionStatusChanged;
        public event EventHandler<SyncResult> SyncCompleted;

        public TallySyncManager()
        {
            _tallyConnector = new RealTallyConnector();
            _cloudService = new CloudApiService();
            InitializeTimers();
        }

        private void InitializeTimers()
        {
            // Heartbeat every 15 seconds
            _heartbeatTimer = new Timer(SendHeartbeatCallback, null, Timeout.Infinite, 15000);
            
            // Auto sync every 5 minutes
            _syncTimer = new Timer(AutoSyncCallback, null, Timeout.Infinite, 300000);
        }

        public async Task StartAsync()
        {
            if (_isRunning) return;

            _isRunning = true;
            LogMessage("🚀 TallySync Manager started");

            // Test connections
            await TestConnectionsAsync();

            // Start heartbeat
            _heartbeatTimer.Change(0, 15000);

            // Start auto sync if enabled
            if (_autoSyncEnabled)
            {
                _syncTimer.Change(60000, 300000); // First sync after 1 minute, then every 5 minutes
                LogMessage("✅ Auto sync enabled (every 5 minutes)");
            }
        }

        public async Task StopAsync()
        {
            if (!_isRunning) return;

            _isRunning = false;
            _heartbeatTimer.Change(Timeout.Infinite, Timeout.Infinite);
            _syncTimer.Change(Timeout.Infinite, Timeout.Infinite);

            LogMessage("⏹️ TallySync Manager stopped");
        }

        private async Task TestConnectionsAsync()
        {
            var status = new ConnectionStatus();

            try
            {
                // Test cloud connection
                status.IsCloudConnected = await _cloudService.TestConnectionAsync();
                LogMessage(status.IsCloudConnected ? "✅ Cloud server connected" : "❌ Cloud server disconnected");

                // Test Tally connection
                status.IsTallyConnected = await _tallyConnector.TestRealConnectionAsync();
                LogMessage(status.IsTallyConnected ? "✅ Tally ERP connected" : "⚠️ Tally ERP not found - waiting for Tally to start");

                status.Status = GetOverallStatus(status);
                ConnectionStatusChanged?.Invoke(this, status);

                if (status.IsCloudConnected && status.IsTallyConnected)
                {
                    await PerformInitialSyncAsync();
                }
            }
            catch (Exception ex)
            {
                LogMessage($"❌ Connection test failed: {ex.Message}");
                status.Status = "Error";
                ConnectionStatusChanged?.Invoke(this, status);
            }
        }

        private async void SendHeartbeatCallback(object state)
        {
            if (!_isRunning) return;

            try
            {
                var success = await _cloudService.SendHeartbeatAsync();
                if (success)
                {
                    LogMessage($"💓 Heartbeat sent at {DateTime.Now:HH:mm:ss}");
                }
                else
                {
                    LogMessage("⚠️ Heartbeat failed - checking connection");
                    await TestConnectionsAsync();
                }
            }
            catch (Exception ex)
            {
                LogMessage($"❌ Heartbeat error: {ex.Message}");
            }
        }

        private async void AutoSyncCallback(object state)
        {
            if (!_isRunning || !_autoSyncEnabled) return;

            LogMessage("🔄 Starting scheduled auto sync...");
            await PerformFullSyncAsync();
        }

        public async Task<SyncResult> PerformFullSyncAsync()
        {
            var result = new SyncResult();
            
            try
            {
                LogMessage("🔄 Starting full data synchronization...");

                // Step 1: Sync companies
                var companies = await _tallyConnector.GetRealCompaniesAsync();
                if (companies?.Count > 0)
                {
                    LogMessage($"📊 Found {companies.Count} companies in Tally");
                    
                    var companyResult = await _cloudService.SyncCompaniesAsync(companies);
                    if (companyResult.Success)
                    {
                        LogMessage($"✅ Successfully synced {companies.Count} companies");
                        result.ProcessedCount += companies.Count;
                    }
                    else
                    {
                        result.Errors.Add($"Company sync failed: {companyResult.Message}");
                    }
                }

                // Step 2: Sync ledgers for each company
                foreach (var company in companies ?? new List<TallyCompany>())
                {
                    try
                    {
                        var ledgers = await _tallyConnector.GetRealLedgersAsync(company.Name);
                        if (ledgers?.Count > 0)
                        {
                            var ledgerResult = await _cloudService.SyncLedgersAsync(ledgers);
                            if (ledgerResult.Success)
                            {
                                LogMessage($"✅ Synced {ledgers.Count} ledgers for {company.Name}");
                                result.ProcessedCount += ledgers.Count;
                            }
                            else
                            {
                                result.Errors.Add($"Ledger sync failed for {company.Name}: {ledgerResult.Message}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errors.Add($"Error syncing {company.Name}: {ex.Message}");
                        LogMessage($"❌ Error syncing {company.Name}: {ex.Message}");
                    }
                }

                result.Success = result.Errors.Count == 0;
                result.Message = result.Success ? 
                    $"Sync completed successfully. Processed {result.ProcessedCount} records." :
                    $"Sync completed with {result.Errors.Count} errors. Processed {result.ProcessedCount} records.";

                LogMessage(result.Success ? "🎉 Full sync completed successfully" : $"⚠️ Sync completed with {result.Errors.Count} errors");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Sync failed: {ex.Message}";
                result.Errors.Add(ex.Message);
                LogMessage($"❌ Sync failed: {ex.Message}");
            }

            SyncCompleted?.Invoke(this, result);
            return result;
        }

        private async Task PerformInitialSyncAsync()
        {
            LogMessage("🔄 Performing initial data sync...");
            await PerformFullSyncAsync();
        }

        private string GetOverallStatus(ConnectionStatus status)
        {
            if (status.IsCloudConnected && status.IsTallyConnected)
                return "Connected";
            else if (status.IsCloudConnected && !status.IsTallyConnected)
                return "Waiting for Tally";
            else if (!status.IsCloudConnected)
                return "Cloud Disconnected";
            else
                return "Disconnected";
        }

        public void SetAutoSync(bool enabled)
        {
            _autoSyncEnabled = enabled;
            if (enabled && _isRunning)
            {
                _syncTimer.Change(60000, 300000);
                LogMessage("✅ Auto sync enabled");
            }
            else
            {
                _syncTimer.Change(Timeout.Infinite, Timeout.Infinite);
                LogMessage("⏸️ Auto sync disabled");
            }
        }

        private void LogMessage(string message)
        {
            LogMessageReceived?.Invoke(this, message);
        }

        public void Dispose()
        {
            _heartbeatTimer?.Dispose();
            _syncTimer?.Dispose();
            _tallyConnector?.Dispose();
            _cloudService?.Dispose();
        }
    }
}