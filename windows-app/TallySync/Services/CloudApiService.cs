using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using TallySync.Models;

namespace TallySync.Services
{
    public class CloudApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _clientId;
        
        public CloudApiService()
        {
            _httpClient = new HttpClient();
            _baseUrl = "https://your-app.replit.dev/api/tally-sync";
            _clientId = "REAL_WINDOWS_APP";
            
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "TallySync-Windows-App/1.0");
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }
        
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.PostAsync(
                    $"{_baseUrl}/test-web-connection",
                    new StringContent("{}", Encoding.UTF8, "application/json")
                );
                
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        
        public async Task<bool> SendHeartbeatAsync()
        {
            try
            {
                var heartbeatData = new
                {
                    clientId = _clientId,
                    timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    version = "1.0.0",
                    machineName = Environment.MachineName
                };
                
                var json = JsonConvert.SerializeObject(heartbeatData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync($"{_baseUrl}/heartbeat", content);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        
        public async Task<SyncResult> SyncCompaniesAsync(List<TallyCompany> companies)
        {
            try
            {
                var syncData = new
                {
                    companies = companies,
                    syncType = "companies",
                    timestamp = DateTime.UtcNow,
                    clientId = _clientId
                };
                
                var json = JsonConvert.SerializeObject(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync($"{_baseUrl}/sync-real-data", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<SyncResult>(responseJson);
                    return result ?? new SyncResult { Success = true };
                }
                
                return new SyncResult
                {
                    Success = false,
                    Message = $"HTTP {response.StatusCode}: {response.ReasonPhrase}"
                };
            }
            catch (Exception ex)
            {
                return new SyncResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        public async Task<SyncResult> SyncLedgersAsync(List<TallyLedger> ledgers)
        {
            try
            {
                var syncData = new
                {
                    ledgers = ledgers,
                    syncType = "ledgers",
                    timestamp = DateTime.UtcNow,
                    clientId = _clientId
                };
                
                var json = JsonConvert.SerializeObject(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync($"{_baseUrl}/sync/ledgers", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<SyncResult>(responseJson);
                    return result ?? new SyncResult { Success = true };
                }
                
                return new SyncResult
                {
                    Success = false,
                    Message = $"HTTP {response.StatusCode}: {response.ReasonPhrase}"
                };
            }
            catch (Exception ex)
            {
                return new SyncResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        public async Task<SyncResult> SyncVouchersAsync(List<TallyVoucher> vouchers)
        {
            try
            {
                var syncData = new
                {
                    vouchers = vouchers,
                    syncType = "vouchers",
                    timestamp = DateTime.UtcNow,
                    clientId = _clientId
                };
                
                var json = JsonConvert.SerializeObject(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync($"{_baseUrl}/sync/vouchers", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<SyncResult>(responseJson);
                    return result ?? new SyncResult { Success = true };
                }
                
                return new SyncResult
                {
                    Success = false,
                    Message = $"HTTP {response.StatusCode}: {response.ReasonPhrase}"
                };
            }
            catch (Exception ex)
            {
                return new SyncResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
    
    public class SyncResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int ProcessedCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}