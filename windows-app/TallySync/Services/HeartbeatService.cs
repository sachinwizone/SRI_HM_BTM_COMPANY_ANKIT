using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text;
using Newtonsoft.Json;

namespace TallySync.Services;

public class HeartbeatService
{
    private readonly HttpClient httpClient;
    private readonly string webApiUrl;
    private System.Threading.Timer heartbeatTimer;
    private bool isRunning = false;

    public HeartbeatService(string apiUrl)
    {
        httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(10);
        webApiUrl = apiUrl.TrimEnd('/');
    }

    public void StartHeartbeat(string clientId = "REAL_WINDOWS_APP")
    {
        if (isRunning) return;
        
        isRunning = true;
        
        // Send heartbeat every 30 seconds
        heartbeatTimer = new System.Threading.Timer(async _ => await SendHeartbeat(clientId), 
                                  null, 
                                  TimeSpan.Zero, 
                                  TimeSpan.FromSeconds(30));
    }

    public void StopHeartbeat()
    {
        isRunning = false;
        heartbeatTimer?.Dispose();
    }

    private async Task SendHeartbeat(string clientId)
    {
        try
        {
            var heartbeatData = new { clientId = clientId };
            var json = JsonConvert.SerializeObject(heartbeatData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await httpClient.PostAsync($"{webApiUrl}/api/tally-sync/heartbeat", content);
            
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Heartbeat failed: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Heartbeat error: {ex.Message}");
        }
    }

    public void Dispose()
    {
        StopHeartbeat();
        httpClient?.Dispose();
    }
}