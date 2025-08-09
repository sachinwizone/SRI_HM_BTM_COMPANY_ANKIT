using System.Net.Http;
using System.Text;
using System.Xml.Linq;
using TallySync.Models;

namespace TallySync.Services;

public class RealTallyConnector
{
    private readonly HttpClient httpClient;
    private readonly string tallyGatewayUrl;

    public RealTallyConnector(string gatewayUrl = "http://localhost:9000")
    {
        httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(30);
        tallyGatewayUrl = gatewayUrl;
    }

    // Real Company List XML Request - No Fake Data
    public async Task<List<TallyCompany>> GetRealCompaniesAsync()
    {
        string xmlRequest = @"
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Companies</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>";

        try
        {
            var response = await SendXmlToTallyGateway(xmlRequest);
            return ParseRealCompaniesXml(response);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get real companies from Tally: {ex.Message}");
        }
    }

    // Real Ledger Data XML Request - Authentic Data Only
    public async Task<List<TallyLedger>> GetRealLedgersAsync(string companyName)
    {
        string xmlRequest = $@"
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Ledger</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
          <SVCOMPANY>{companyName}</SVCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>";

        try
        {
            var response = await SendXmlToTallyGateway(xmlRequest);
            return ParseRealLedgersXml(response);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get real ledgers from Tally: {ex.Message}");
        }
    }

    // Send Real XML Request to Tally Gateway (Port 9000)
    private async Task<string> SendXmlToTallyGateway(string xmlRequest)
    {
        var content = new StringContent(xmlRequest, Encoding.UTF8, "application/xml");
        
        using var response = await httpClient.PostAsync(tallyGatewayUrl, content);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Tally Gateway returned: {response.StatusCode}");
        }
        
        return await response.Content.ReadAsStringAsync();
    }

    // Parse Real Company XML Response - No Hardcoded Data
    private List<TallyCompany> ParseRealCompaniesXml(string xmlResponse)
    {
        var companies = new List<TallyCompany>();

        if (string.IsNullOrWhiteSpace(xmlResponse))
            return companies;

        try
        {
            var doc = XDocument.Parse(xmlResponse);
            var companyNodes = doc.Descendants("COMPANY");

            foreach (var node in companyNodes)
            {
                var company = new TallyCompany
                {
                    Name = GetElementValue(node, "NAME"),
                    GUID = GetElementValue(node, "GUID"),
                    Address = GetElementValue(node, "ADDRESS"),
                    Phone = GetElementValue(node, "PHONENUMBER"),
                    Email = GetElementValue(node, "EMAIL"),
                    GSTNumber = GetElementValue(node, "GSTIN"),
                    StartDate = ParseDate(GetElementValue(node, "STARTDATE")),
                    EndDate = ParseDate(GetElementValue(node, "ENDDATE"))
                };

                // Only add if we have real data - no fake entries
                if (!string.IsNullOrWhiteSpace(company.Name))
                {
                    companies.Add(company);
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to parse company XML: {ex.Message}");
        }

        return companies;
    }

    // Parse Real Ledger XML Response - Authentic Data Only  
    private List<TallyLedger> ParseRealLedgersXml(string xmlResponse)
    {
        var ledgers = new List<TallyLedger>();

        if (string.IsNullOrWhiteSpace(xmlResponse))
            return ledgers;

        try
        {
            var doc = XDocument.Parse(xmlResponse);
            var ledgerNodes = doc.Descendants("LEDGER");

            foreach (var node in ledgerNodes)
            {
                var ledger = new TallyLedger
                {
                    GUID = GetElementValue(node, "GUID"),
                    Name = GetElementValue(node, "NAME"),
                    Parent = GetElementValue(node, "PARENT"),
                    Group = GetElementValue(node, "GROUP"),
                    OpeningBalance = ParseDecimal(GetElementValue(node, "OPENINGBALANCE")),
                    ClosingBalance = ParseDecimal(GetElementValue(node, "CLOSINGBALANCE")),
                    LastModified = ParseDate(GetElementValue(node, "ALTERDATE"))
                };

                // Only add real ledgers with actual names
                if (!string.IsNullOrWhiteSpace(ledger.Name))
                {
                    ledgers.Add(ledger);
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to parse ledger XML: {ex.Message}");
        }

        return ledgers;
    }

    // Test Real Tally Connection - No Mock Response
    public async Task<bool> TestRealTallyConnectionAsync()
    {
        try
        {
            // Real connectivity test - ping Tally Gateway
            var testRequest = @"
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Companies</REPORTNAME>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>";

            var response = await SendXmlToTallyGateway(testRequest);
            return !string.IsNullOrWhiteSpace(response) && response.Contains("ENVELOPE");
        }
        catch
        {
            return false;
        }
    }

    // Helper Methods for XML Parsing
    private string GetElementValue(XElement parent, string elementName)
    {
        return parent.Element(elementName)?.Value?.Trim() ?? "";
    }

    private decimal ParseDecimal(string value)
    {
        if (decimal.TryParse(value, out decimal result))
            return result;
        return 0;
    }

    private DateTime ParseDate(string value)
    {
        if (DateTime.TryParse(value, out DateTime result))
            return result;
        return DateTime.MinValue;
    }

    public void Dispose()
    {
        httpClient?.Dispose();
    }
}

// Real Tally Company Model - No Fake Data
public class TallyCompany
{
    public string Name { get; set; } = "";
    public string GUID { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string GSTNumber { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}