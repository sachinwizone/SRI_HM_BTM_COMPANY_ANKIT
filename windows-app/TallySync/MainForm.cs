using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing;

namespace TallySync
{
    public partial class MainForm : Form
    {
        private readonly HttpClient httpClient;
        // Update this URL to match your Replit deployment
        private readonly string baseUrl = "https://YOUR_REPL_NAME.YOUR_USERNAME.repl.co/api/tally";
        // For local testing, use: private readonly string baseUrl = "http://localhost:5000/api/tally";
        
        public MainForm()
        {
            InitializeComponent();
            httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30); // Increase timeout for network requests
        }

        private async void btnConnect_Click(object sender, EventArgs e)
        {
            try
            {
                btnConnect.Enabled = false;
                lblStatus.Text = "Testing backend connection...";
                lblStatus.ForeColor = Color.Blue;
                Application.DoEvents(); // Update UI immediately

                // First test basic connectivity with proper error handling
                HttpResponseMessage testResponse;
                try
                {
                    testResponse = await httpClient.GetAsync($"{baseUrl}/companies");
                }
                catch (HttpRequestException ex)
                {
                    lblStatus.Text = $"Network error: Cannot reach backend. Check URL: {baseUrl}";
                    lblStatus.ForeColor = Color.Red;
                    return;
                }
                catch (TaskCanceledException)
                {
                    lblStatus.Text = "Connection timeout. Backend may be slow or unreachable.";
                    lblStatus.ForeColor = Color.Red;
                    return;
                }

                lblStatus.Text = "Processing response...";
                Application.DoEvents();
                
                if (testResponse.IsSuccessStatusCode)
                {
                    var content = await testResponse.Content.ReadAsStringAsync();
                    
                    // Check if response is HTML (error page) instead of JSON
                    if (content.TrimStart().StartsWith("<"))
                    {
                        lblStatus.Text = "Error: Backend returned HTML instead of JSON data";
                        lblStatus.ForeColor = Color.Red;
                        return;
                    }
                    
                    if (string.IsNullOrEmpty(content) || content.Trim() == "[]")
                    {
                        lblStatus.Text = "Connected successfully! No companies found.";
                        lblStatus.ForeColor = Color.Green;
                        listCompanies.Items.Clear();
                        listCompanies.Items.Add("No companies registered yet");
                    }
                    else
                    {
                        try
                        {
                            var companies = JsonSerializer.Deserialize<JsonElement[]>(content);
                            
                            lblStatus.Text = $"Connected successfully! Found {companies.Length} companies.";
                            lblStatus.ForeColor = Color.Green;
                            
                            // Display companies in list
                            listCompanies.Items.Clear();
                            foreach (var company in companies)
                            {
                                var name = company.GetProperty("name").GetString();
                                var id = company.GetProperty("id").GetString();
                                var externalId = company.TryGetProperty("externalId", out var extId) ? extId.GetString() : "N/A";
                                listCompanies.Items.Add($"{name} (ID: {externalId})");
                            }
                        }
                        catch (JsonException)
                        {
                            lblStatus.Text = "Error: Invalid JSON response from backend";
                            lblStatus.ForeColor = Color.Red;
                            return;
                        }
                    }
                    
                    btnSyncData.Enabled = true;
                }
                else
                {
                    var errorContent = await testResponse.Content.ReadAsStringAsync();
                    lblStatus.Text = $"Backend error: {testResponse.StatusCode} - {errorContent.Substring(0, Math.Min(100, errorContent.Length))}";
                    lblStatus.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = $"Unexpected error: {ex.Message}";
                lblStatus.ForeColor = Color.Red;
            }
            finally
            {
                btnConnect.Enabled = true;
            }
        }

        private async void btnSyncData_Click(object sender, EventArgs e)
        {
            try
            {
                btnSyncData.Enabled = false;
                lblStatus.Text = "Preparing sync data...";
                lblStatus.ForeColor = Color.Blue;
                Application.DoEvents();

                // Create sample Tally data to sync with timestamp for uniqueness
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var syncData = new
                {
                    apiKey = "test-api-key-123", // This must match a valid API key in your backend
                    companies = new[]
                    {
                        new
                        {
                            name = $"TallySync Desktop - {timestamp}",
                            externalId = $"DESKTOP_{timestamp}",
                            apiKey = $"desktop-sync-{timestamp}"
                        }
                    }
                };

                lblStatus.Text = "Sending data to backend...";
                Application.DoEvents();
                
                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{baseUrl}/sync/companies", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        // Parse the response to get details
                        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
                        var success = result.GetProperty("success").GetBoolean();
                        
                        if (success)
                        {
                            lblStatus.Text = "Sample company data synced successfully!";
                            lblStatus.ForeColor = Color.Green;
                            
                            // Refresh companies list after a short delay
                            await Task.Delay(1000);
                            btnConnect_Click(sender, e);
                        }
                        else
                        {
                            lblStatus.Text = "Sync completed with errors. Check backend logs.";
                            lblStatus.ForeColor = Color.Orange;
                        }
                    }
                    catch (JsonException)
                    {
                        lblStatus.Text = $"Sync response received but JSON parsing failed: {responseContent.Substring(0, Math.Min(100, responseContent.Length))}";
                        lblStatus.ForeColor = Color.Orange;
                    }
                }
                else
                {
                    lblStatus.Text = $"Sync failed: {response.StatusCode} - {responseContent.Substring(0, Math.Min(200, responseContent.Length))}";
                    lblStatus.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = $"Sync error: {ex.Message}";
                lblStatus.ForeColor = Color.Red;
            }
            finally
            {
                btnSyncData.Enabled = true;
            }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            httpClient?.Dispose();
        }
    }
}