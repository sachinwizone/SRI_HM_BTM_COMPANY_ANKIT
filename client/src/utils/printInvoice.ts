// Company Details - SRI HM BITUMEN CO
const COMPANY_DETAILS = {
  name: 'M/S.SRI HM BITUMEN CO',
  dagNo: 'Dag No. 1071, Patta No. 264, C/O M/S. SRI',
  addressLine1: 'HM BITUMEN CO, Mikirpara, Chakardaigaon',
  addressLine2: 'Mouza-Ramcharani,, Guwahati, Kamrup',
  city: 'Metropolitan, Assam, 781035',
  udyam: 'UDYAM:AS-03-0045787',
  importExport: 'Import-Export Code:CGMPP6536N',
  lei: 'LEI CODE-3358002WWBK6HVV37D19',
  gstin: '18CGMPP6536N2ZG',
  stateName: 'Assam',
  stateCode: '18',
  contact: '8453059698',
  pan: 'CGMPP6536N',
  bankName: 'STATE BANK OF INDIA',
  bankAccountName: 'M/S SRI HM BITUMEN CO',
  bankAccountNo: '43063628954',
  bankBranch: 'PALTAN,BAZAR',
  bankIfsc: 'SBIN0013247'
};

// Format date to DD-MMM-YY format
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

// Format number with Indian number formatting
const formatIndianNumber = (num: number): string => {
  const str = num.toFixed(2);
  const [intPart, decPart] = str.split('.');
  const lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherNumbers ? ',' : '') + lastThree;
  return formatted + '.' + decPart;
};

// Number to Words conversion for Indian numbering system
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let words = 'INR ' + numToWords(rupees);
  if (paise > 0) {
    words += ' and ' + numToWords(paise) + ' paise';
  }
  words += ' Only';
  
  return words;
};

export const generateTaxInvoiceHtml = (invoice: any, type: 'sales' | 'purchase'): string => {
  const totalAmount = parseFloat(invoice.totalInvoiceAmount || 0);
  const taxableAmount = parseFloat(invoice.subtotalAmount || invoice.totalTaxableAmount || 0);
  const cgstAmount = parseFloat(invoice.cgstAmount || invoice.totalCgst || 0);
  const sgstAmount = parseFloat(invoice.sgstAmount || invoice.totalSgst || 0);
  const igstAmount = parseFloat(invoice.igstAmount || invoice.totalIgst || 0);
  const roundOff = parseFloat(invoice.roundOff || 0);

  // Get items from invoice.items array
  const items = invoice.items || [];
  
  // Debug log to check items
  console.log('Invoice items for printing:', items);
  console.log('Full invoice object:', invoice);
  
  // Generate items rows HTML
  const generateItemsRows = (): string => {
    if (items.length === 0) {
      // Fallback for single item display
      return `
        <tr>
          <td class="text-center border-r border-black">1</td>
          <td class="font-bold border-r border-black">${invoice.productName || 'BITUMEN BULK VG-30'}</td>
          <td class="text-center border-r border-black">${invoice.hsnCode || '27132000'}</td>
          <td class="text-center border-r border-black">${invoice.unit || 'MT'}</td>
          <td class="text-right border-r border-black">${invoice.rate ? formatIndianNumber(parseFloat(invoice.rate)) : ''}</td>
          <td class="text-center border-r border-black">${invoice.unit || 'MT'}</td>
          <td class="text-right">${formatIndianNumber(taxableAmount)}</td>
        </tr>
      `;
    }
    
    return items.map((item: any, index: number) => {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const unit = item.unitOfMeasurement || item.unit || 'MT';
      const amount = parseFloat(item.taxableAmount || item.amount || (qty * rate));
      const hsnCode = item.hsnSacCode || item.hsnCode || '27132000';
      const productName = item.productName || item.description || 'BITUMEN BULK VG-30';
      
      // Format quantity - show just the number without unit in qty column
      const qtyDisplay = qty > 0 ? qty.toString() : '';
      
      return `
        <tr>
          <td class="text-center border-r border-black">${index + 1}</td>
          <td class="font-bold border-r border-black">${productName}</td>
          <td class="text-center border-r border-black">${hsnCode}</td>
          <td class="text-center border-r border-black">${qtyDisplay}</td>
          <td class="text-right border-r border-black">${rate > 0 ? formatIndianNumber(rate) : ''}</td>
          <td class="text-center border-r border-black">${unit}</td>
          <td class="text-right">${formatIndianNumber(amount)}</td>
        </tr>
      `;
    }).join('');
  };

  // Generate HSN summary from items
  const generateHsnSummary = (): string => {
    if (items.length === 0) {
      return `
        <tr>
          <td class="text-center">${invoice.hsnCode || '27132000'}</td>
          <td class="text-right">${formatIndianNumber(taxableAmount)}</td>
          <td class="text-center">9%</td>
          <td class="text-right">${formatIndianNumber(cgstAmount)}</td>
          <td class="text-center">9%</td>
          <td class="text-right">${formatIndianNumber(sgstAmount)}</td>
          <td class="text-right">${formatIndianNumber(cgstAmount + sgstAmount)}</td>
        </tr>
      `;
    }
    
    // Group items by HSN code
    const hsnMap: { [key: string]: { taxable: number, cgst: number, sgst: number, cgstRate: number, sgstRate: number } } = {};
    
    items.forEach((item: any) => {
      const hsnCode = item.hsnSacCode || item.hsnCode || '27132000';
      const itemTaxable = parseFloat(item.taxableAmount || item.amount || 0);
      const itemCgst = parseFloat(item.cgstAmount || 0);
      const itemSgst = parseFloat(item.sgstAmount || 0);
      const cgstRate = parseFloat(item.cgstRate || 9);
      const sgstRate = parseFloat(item.sgstRate || 9);
      
      if (!hsnMap[hsnCode]) {
        hsnMap[hsnCode] = { taxable: 0, cgst: 0, sgst: 0, cgstRate, sgstRate };
      }
      hsnMap[hsnCode].taxable += itemTaxable;
      hsnMap[hsnCode].cgst += itemCgst;
      hsnMap[hsnCode].sgst += itemSgst;
    });
    
    return Object.entries(hsnMap).map(([hsn, data]) => `
      <tr>
        <td class="text-center">${hsn}</td>
        <td class="text-right">${formatIndianNumber(data.taxable)}</td>
        <td class="text-center">${data.cgstRate}%</td>
        <td class="text-right">${formatIndianNumber(data.cgst)}</td>
        <td class="text-center">${data.sgstRate}%</td>
        <td class="text-right">${formatIndianNumber(data.sgst)}</td>
        <td class="text-right">${formatIndianNumber(data.cgst + data.sgst)}</td>
      </tr>
    `).join('');
  };

  const irnRow = (invoice.irnNumber || invoice.irnAckNumber) ? `
    <div class="irn-row">
      ${invoice.irnNumber ? `<span><strong>IRN</strong> : ${invoice.irnNumber}</span>` : ''}
      ${invoice.irnAckNumber ? `<span style="margin-left: 20px;"><strong>Ack No.</strong> : ${invoice.irnAckNumber}</span>` : ''}
      ${invoice.irnAckDate ? `<span style="margin-left: 20px;"><strong>Ack Date</strong> : ${formatDate(invoice.irnAckDate)}</span>` : ''}
    </div>
  ` : '';

  const igstRow = igstAmount > 0 ? `
    <tr>
      <td class="text-center"></td>
      <td class="text-center font-bold">OUTPUT IGST</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="text-right">${formatIndianNumber(igstAmount)}</td>
    </tr>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tax Invoice - ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.3; margin: 10px; }
        .invoice-container { border: 2px solid #000; }
        .header-row { display: flex; border-bottom: 1px solid #000; }
        .header-left { flex: 1; text-align: center; padding: 5px; font-size: 14px; font-weight: bold; }
        .header-right { width: 100px; text-align: center; padding: 5px; border-left: 1px solid #000; font-weight: bold; }
        .irn-row { padding: 5px; border-bottom: 1px solid #000; font-size: 9px; }
        .main-content { display: flex; border-bottom: 1px solid #000; }
        .company-section { flex: 1; padding: 8px; border-right: 1px solid #000; }
        .invoice-details { width: 45%; }
        .invoice-details table { width: 100%; border-collapse: collapse; font-size: 9px; }
        .invoice-details td { padding: 2px 4px; border: 1px solid #000; }
        .company-logo { display: flex; gap: 10px; align-items: flex-start; }
        .logo-text { font-size: 20px; color: #E67E22; font-weight: bold; }
        .company-info { font-size: 9px; }
        .company-name { font-size: 12px; font-weight: bold; }
        .party-row { display: flex; border-bottom: 1px solid #000; }
        .party-section { flex: 1; padding: 8px; font-size: 9px; }
        .party-section.border-right { border-right: 1px solid #000; }
        .section-title { font-weight: bold; margin-bottom: 3px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { border: 1px solid #000; padding: 4px; }
        .items-table th { background: #f0f0f0; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .amount-words { padding: 8px; border-bottom: 1px solid #000; }
        .hsn-table { width: 100%; border-collapse: collapse; font-size: 9px; }
        .hsn-table th, .hsn-table td { border: 1px solid #000; padding: 3px; }
        .hsn-table th { background: #f0f0f0; }
        .footer-row { display: flex; border-bottom: 1px solid #000; }
        .declaration { flex: 1; padding: 8px; border-right: 1px solid #000; font-size: 8px; }
        .bank-details { width: 45%; padding: 8px; font-size: 9px; }
        .signature-row { display: flex; }
        .signature-left { flex: 1; padding: 15px; border-right: 1px solid #000; min-height: 80px; }
        .signature-right { width: 45%; padding: 15px; text-align: right; min-height: 80px; }
        .computer-gen { text-align: center; padding: 5px; font-size: 8px; }
        .no-print { margin-top: 20px; text-align: center; }
        @media print { 
          body { margin: 5mm; } 
          .no-print { display: none; }
          @page { size: A4; margin: 5mm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header-row">
          <div class="header-left">Tax Invoice</div>
          <div class="header-right">e-Invoice</div>
        </div>

        <!-- IRN Row -->
        ${irnRow}

        <!-- Main Content -->
        <div class="main-content">
          <div class="company-section">
            <div class="company-logo">
              <div>
                <div class="logo-text">श्री HM</div>
                <div style="font-size: 8px;">BITUMEN COMPANY</div>
              </div>
              <div class="company-info">
                <div class="company-name">${COMPANY_DETAILS.name}</div>
                <div>${COMPANY_DETAILS.dagNo}</div>
                <div>${COMPANY_DETAILS.addressLine1}</div>
                <div>${COMPANY_DETAILS.addressLine2}</div>
                <div>${COMPANY_DETAILS.city}</div>
                <div>${COMPANY_DETAILS.udyam}</div>
                <div>${COMPANY_DETAILS.importExport}</div>
                <div>${COMPANY_DETAILS.lei}</div>
                <div>GSTIN/UIN: ${COMPANY_DETAILS.gstin}</div>
                <div>State Name : ${COMPANY_DETAILS.stateName}, Code : ${COMPANY_DETAILS.stateCode}</div>
                <div>Contact : ${COMPANY_DETAILS.contact}</div>
              </div>
            </div>
          </div>
          <div class="invoice-details">
            <table>
              <tr>
                <td>Invoice No.</td>
                <td class="font-bold">${invoice.invoiceNumber}</td>
                <td>Dated</td>
                <td class="font-bold">${formatDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td>e-Way Bill No.</td>
                <td class="font-bold">${invoice.ewayBillNumber || ''}</td>
                <td>Mode/Terms of Payment</td>
                <td class="font-bold">${invoice.paymentTerms || '30 DAYS'}</td>
              </tr>
              <tr>
                <td>Delivery Note</td>
                <td class="font-bold">${invoice.deliveryNoteNumber || invoice.invoiceNumber}</td>
                <td>Delivery Note Date</td>
                <td class="font-bold">${formatDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td>Buyer's Order No.</td>
                <td class="font-bold">${invoice.buyerOrderNumber || ''}</td>
                <td>Dated</td>
                <td class="font-bold">${invoice.buyerOrderDate ? formatDate(invoice.buyerOrderDate) : ''}</td>
              </tr>
              <tr>
                <td>Dispatched through</td>
                <td class="font-bold">${invoice.transporterName || ''}</td>
                <td>Destination</td>
                <td class="font-bold">${invoice.destination || ''}</td>
              </tr>
              <tr>
                <td>Vehicle No.</td>
                <td class="font-bold">${invoice.vehicleNumber || ''}</td>
                <td>LR/RR No.</td>
                <td class="font-bold">${invoice.lrRrNumber || ''}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Consignee and Buyer -->
        <div class="party-row">
          <div class="party-section border-right">
            <div class="section-title">Consignee (Ship to)</div>
            <div class="font-bold">${type === 'purchase' ? (invoice.supplierName || 'N/A') : (invoice.customerName || 'N/A')}</div>
            <div>${type === 'purchase' ? (invoice.supplierAddress || '') : (invoice.shippingAddress || invoice.customerAddress || '')}</div>
            <div>GSTIN/UIN : ${type === 'purchase' ? (invoice.supplierGstin || '') : (invoice.customerGstin || '')}</div>
            <div>State Name : ${invoice.placeOfSupply || 'Assam'}, Code : ${invoice.placeOfSupplyStateCode || '18'}</div>
          </div>
          <div class="party-section" style="width: 45%;">
            <div class="section-title">Buyer (Bill to)</div>
            <div class="font-bold">${type === 'purchase' ? (invoice.supplierName || 'N/A') : (invoice.customerName || 'N/A')}</div>
            <div>${type === 'purchase' ? (invoice.supplierAddress || '') : (invoice.billingAddress || invoice.customerAddress || '')}</div>
            <div>GSTIN/UIN : ${type === 'purchase' ? (invoice.supplierGstin || '') : (invoice.customerGstin || '')}</div>
            <div>State Name : ${invoice.placeOfSupply || 'Assam'}, Code : ${invoice.placeOfSupplyStateCode || '18'}</div>
          </div>
        </div>

        <!-- Terms of Delivery -->
        <div style="padding: 5px; border-bottom: 1px solid #000; font-size: 9px;">
          <strong>Terms of Delivery:</strong> AFTER 30 DAYS INTEREST WILL BE CHARGED @18%
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 30px;">SI No</th>
              <th>Description of Goods and Services</th>
              <th class="text-center" style="width: 60px;">HSN/SAC</th>
              <th class="text-right" style="width: 70px;">Quantity</th>
              <th class="text-right" style="width: 70px;">Rate</th>
              <th class="text-center" style="width: 30px;">per</th>
              <th class="text-right" style="width: 90px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${generateItemsRows()}
            <tr>
              <td class="text-center"></td>
              <td class="text-center font-bold">OUTPUT CGST</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="text-right">${formatIndianNumber(cgstAmount)}</td>
            </tr>
            <tr>
              <td class="text-center"></td>
              <td class="text-center font-bold">OUTPUT SGST</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="text-right">${formatIndianNumber(sgstAmount)}</td>
            </tr>
            ${igstRow}
            <tr>
              <td class="text-center">Less :</td>
              <td class="text-center font-bold">ROUND OFF</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="text-right">${roundOff >= 0 ? '' : '(-)'}${Math.abs(roundOff).toFixed(2)}</td>
            </tr>
            <tr class="font-bold" style="border-top: 2px solid #000;">
              <td></td>
              <td class="text-right">Total</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="text-right">₹ ${formatIndianNumber(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Amount in Words -->
        <div class="amount-words">
          <div><strong>Amount Chargeable (in words)</strong></div>
          <div class="font-bold">${numberToWords(totalAmount)}</div>
          <div style="text-align: right; font-size: 8px;">E. & O.E</div>
        </div>

        <!-- HSN Summary Table -->
        <table class="hsn-table">
          <thead>
            <tr>
              <th class="text-center">HSN/SAC</th>
              <th class="text-right">Taxable Value</th>
              <th class="text-center" colspan="2">CGST</th>
              <th class="text-center" colspan="2">SGST/UTGST</th>
              <th class="text-right">Total Tax Amount</th>
            </tr>
            <tr style="font-size: 8px;">
              <th></th>
              <th></th>
              <th class="text-center">Rate</th>
              <th class="text-right">Amount</th>
              <th class="text-center">Rate</th>
              <th class="text-right">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${generateHsnSummary()}
            <tr class="font-bold">
              <td class="text-right">Total</td>
              <td class="text-right">${formatIndianNumber(taxableAmount)}</td>
              <td></td>
              <td class="text-right">${formatIndianNumber(cgstAmount)}</td>
              <td></td>
              <td class="text-right">${formatIndianNumber(sgstAmount)}</td>
              <td class="text-right">${formatIndianNumber(cgstAmount + sgstAmount)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tax Amount in Words and PAN -->
        <div style="padding: 5px; border-bottom: 1px solid #000; font-size: 9px;">
          <div><strong>Tax Amount (in words) :</strong> ${numberToWords(cgstAmount + sgstAmount)}</div>
          <div><strong>Company's PAN</strong> : ${COMPANY_DETAILS.pan}</div>
        </div>

        <!-- Declaration and Bank Details -->
        <div class="footer-row">
          <div class="declaration">
            <div style="font-weight: bold; text-decoration: underline;">Declaration</div>
            <div>Terms & Conditions&</div>
            <div style="margin-top: 3px;">1.If the Payment is not done with in the due terms of invoice then an interest of 24% per annum.</div>
            <div>2. In case of Cheque Returned/Bounced , All the Penalties Will Be Bear by Buyer.</div>
            <div>3. Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.</div>
            <div>4.Detention of Rs 4000 per day will be charged,if vehicle not unloaded with in 48 hrs of Reporting.</div>
          </div>
          <div class="bank-details">
            <div style="font-weight: bold;">Company's Bank Details</div>
            <table style="width: 100%; font-size: 9px;">
              <tr><td>A/c Holder's Name</td><td>: <strong>${COMPANY_DETAILS.bankAccountName}</strong></td></tr>
              <tr><td>Bank Name</td><td>: <strong>${COMPANY_DETAILS.bankName}</strong></td></tr>
              <tr><td>A/c No.</td><td>: <strong>${COMPANY_DETAILS.bankAccountNo}</strong></td></tr>
              <tr><td>Branch & IFS Code</td><td>: <strong>${COMPANY_DETAILS.bankBranch} & ${COMPANY_DETAILS.bankIfsc}</strong></td></tr>
            </table>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-row">
          <div class="signature-left">
            <div style="font-weight: bold;">Customer's Seal and Signature</div>
          </div>
          <div class="signature-right">
            <div style="font-weight: bold;">for ${COMPANY_DETAILS.name}</div>
            <div style="margin-top: 40px; font-weight: bold;">Authorised Signatory</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="computer-gen">
          This is a Computer Generated Invoice
        </div>
      </div>

      <div class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;
};

export const printTaxInvoice = (invoice: any, type: 'sales' | 'purchase', showError?: (msg: string) => void): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    if (showError) {
      showError('Please allow popups for this site');
    }
    return;
  }

  const invoiceHtml = generateTaxInvoiceHtml(invoice, type);
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
};
