// Mock Tally Gateway Server for Testing Real Integration
const express = require('express');
const app = express();

app.use(express.text({ type: 'application/xml' }));
app.use(express.text({ type: 'text/xml' }));

// Mock Tally Gateway on port 9000
app.post('/', (req, res) => {
    console.log('Received Tally XML Request:', req.body);
    
    // Simulate real Tally company response based on your screenshot
    const mockTallyResponse = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Companies</ID>
    </HEADER>
    <BODY>
        <DATA>
            <TALLYMESSAGE>
                <COMPANY>
                    <NAME>Wizone IT Network India Pvt Ltd</NAME>
                    <GUID>{12345678-1234-1234-1234-123456789012}</GUID>
                    <STARTINGFROM>01-Apr-2024</STARTINGFROM>
                    <ENDINGAT>31-Mar-2025</ENDINGAT>
                    <COMPANYNUMBER>1</COMPANYNUMBER>
                </COMPANY>
                <COMPANY>
                    <NAME>Wizone IT Solutions</NAME>
                    <GUID>{87654321-4321-4321-4321-210987654321}</GUID>
                    <STARTINGFROM>01-Apr-2024</STARTINGFROM>
                    <ENDINGAT>31-Mar-2025</ENDINGAT>
                    <COMPANYNUMBER>2</COMPANYNUMBER>
                </COMPANY>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>`;

    res.set('Content-Type', 'application/xml');
    res.send(mockTallyResponse);
});

app.listen(9000, () => {
    console.log('🎯 Mock Tally Gateway running on port 9000');
    console.log('📊 Simulating your real companies:');
    console.log('   - Wizone IT Network India Pvt Ltd');
    console.log('   - Wizone IT Solutions');
});