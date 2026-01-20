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
  console.log('Invoice type:', type);

  // Calculate total quantity with unit
  const getTotalQtyWithUnit = (): string => {
    if (items.length === 0) return '';
    const totalQty = items.reduce((sum: number, item: any) => sum + parseFloat(item.quantity || 0), 0);
    const unit = items[0]?.unitOfMeasurement || items[0]?.unit || 'MT';
    return `${formatIndianNumber(totalQty).replace('.00', '')} ${unit}`;
  };
  
  // Generate items rows HTML
  const generateItemsRows = (): string => {
    if (items.length === 0) {
      // Fallback for single item display
      const qty = parseFloat(invoice.quantity || 0);
      const rate = parseFloat(invoice.rate || 0);
      const unit = invoice.unit || 'Drum';
      const amount = qty * rate;
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">1</td>
          <td style="border: 1px solid #000; padding: 4px;"><strong>BITUMEN</strong><br>${invoice.productName || 'VG-30 NON-EMBOSSED(NE)'}<br>${invoice.hsnCode || 'NW-29921'}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${invoice.hsnCode || '27132000'}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;"><strong>${qty}</strong> ${unit}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatIndianNumber(rate)}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${unit}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatIndianNumber(amount)}</td>
        </tr>
      `;
    }
    
    return items.map((item: any, index: number) => {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const unit = item.unitOfMeasurement || item.unit || 'Drum';
      const amount = parseFloat(item.taxableAmount || item.amount || (qty * rate));
      const hsnCode = item.hsnSacCode || item.hsnCode || '27132000';
      const productName = item.productName || item.description || 'BITUMEN VG-30';
      const productCode = item.productCode || '';
      
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 4px;"><strong>BITUMEN</strong><br>${productName}<br>${productCode}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${hsnCode}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;"><strong>${qty}</strong> ${unit}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatIndianNumber(rate)}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${unit}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatIndianNumber(amount)}</td>
        </tr>
      `;
    }).join('');
  };

  // Generate HSN summary from items
  const generateHsnSummary = (): string => {
    if (items.length === 0) {
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${invoice.hsnCode || '27132000'}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(taxableAmount)}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">9%</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(cgstAmount)}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">9%</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(sgstAmount)}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(cgstAmount + sgstAmount)}</td>
        </tr>
      `;
    }
    
    // Group items by HSN code
    const hsnMap: { [key: string]: { taxable: number, cgst: number, sgst: number, cgstRate: number, sgstRate: number } } = {};
    
    items.forEach((item: any) => {
      const hsnCode = item.hsnSacCode || item.hsnCode || '27132000';
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const itemTaxable = parseFloat(item.taxableAmount || item.amount || (qty * rate));
      const cgstRate = parseFloat(item.cgstRate || 9);
      const sgstRate = parseFloat(item.sgstRate || 9);
      const itemCgst = parseFloat(item.cgstAmount || (itemTaxable * cgstRate / 100));
      const itemSgst = parseFloat(item.sgstAmount || (itemTaxable * sgstRate / 100));
      
      if (!hsnMap[hsnCode]) {
        hsnMap[hsnCode] = { taxable: 0, cgst: 0, sgst: 0, cgstRate, sgstRate };
      }
      hsnMap[hsnCode].taxable += itemTaxable;
      hsnMap[hsnCode].cgst += itemCgst;
      hsnMap[hsnCode].sgst += itemSgst;
    });
    
    return Object.entries(hsnMap).map(([hsn, data]) => `
      <tr>
        <td style="border: 1px solid #000; padding: 3px; text-align: center;">${hsn}</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(data.taxable)}</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: center;">${data.cgstRate}%</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(data.cgst)}</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: center;">${data.sgstRate}%</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(data.sgst)}</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(data.cgst + data.sgst)}</td>
      </tr>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${type === 'purchase' ? 'Purchase' : 'Sales'} Invoice - ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2; padding: 10px; background: #fff; }
        .invoice-container { border: 2px solid #000; max-width: 800px; margin: 0 auto; }
        .header-row { display: flex; border-bottom: 1px solid #000; justify-content: center; }
        .header-center { text-align: center; padding: 10px 20px; font-size: 20px; font-weight: bold; }
        .main-content { display: flex; border-bottom: 1px solid #000; }
        .company-section { width: 55%; padding: 8px; border-right: 1px solid #000; }
        .company-logo { display: flex; gap: 8px; align-items: flex-start; }
        .logo-img { width: 120px; height: auto; }
        .company-info { font-size: 8px; line-height: 1.3; }
        .company-name { font-size: 12px; font-weight: bold; color: #e54a2c; }
        .invoice-details { width: 45%; }
        .invoice-details table { width: 100%; border-collapse: collapse; font-size: 8px; }
        .invoice-details td { padding: 2px 4px; border: 1px solid #000; }
        .invoice-details td:first-child, .invoice-details td:nth-child(3) { width: 25%; }
        .party-row { display: flex; border-bottom: 1px solid #000; }
        .party-section { flex: 1; padding: 8px; font-size: 8px; }
        .party-section:first-child { border-right: 1px solid #000; }
        .section-title { font-weight: bold; color: #CC5500; margin-bottom: 3px; }
        .terms-delivery { padding: 5px 8px; border-bottom: 1px solid #000; font-size: 8px; }
        .items-section { border-bottom: 1px solid #000; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 8px; }
        .items-table th { border: 1px solid #000; padding: 4px; background: #f5f5f5; font-weight: bold; text-align: center; }
        .tax-rows td { border: 1px solid #000; padding: 4px; }
        .amount-words-section { padding: 5px 8px; border-bottom: 1px solid #000; font-size: 8px; }
        .hsn-section { border-bottom: 1px solid #000; }
        .hsn-table { width: 100%; border-collapse: collapse; font-size: 8px; }
        .hsn-table th, .hsn-table td { border: 1px solid #000; padding: 3px; }
        .hsn-table th { background: #f5f5f5; }
        .tax-words-section { padding: 5px 8px; border-bottom: 1px solid #000; font-size: 8px; }
        .footer-section { display: flex; border-bottom: 1px solid #000; }
        .declaration { flex: 1; padding: 8px; border-right: 1px solid #000; font-size: 7px; }
        .bank-details { width: 40%; padding: 8px; font-size: 8px; }
        .signature-row { display: flex; }
        .signature-left { flex: 1; padding: 10px; border-right: 1px solid #000; min-height: 60px; }
        .signature-right { width: 40%; padding: 10px; text-align: right; min-height: 60px; position: relative; }
        .auth-stamp { position: absolute; bottom: 10px; right: 10px; width: 60px; height: 60px; border-radius: 50%; opacity: 0.7; }
        .no-print { margin-top: 20px; text-align: center; }
        @media print { 
          body { padding: 0; } 
          .no-print { display: none; }
          @page { size: A4; margin: 5mm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Row -->
        <div class="header-row">
          <div class="header-center">${type === 'purchase' ? 'Purchase Invoice' : 'Sales Invoice'}</div>
        </div>

        <!-- Main Content - Company and Invoice Details -->
        <div class="main-content">
          <div class="company-section">
            <div class="company-logo">
              <img src="/logo.jpg" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
              <div class="company-info">
                <div class="company-name">${COMPANY_DETAILS.name}</div>
                <div>${COMPANY_DETAILS.dagNo}</div>
                <div>${COMPANY_DETAILS.addressLine1}</div>
                <div>${COMPANY_DETAILS.addressLine2}</div>
                <div>${COMPANY_DETAILS.city}</div>
                <div>${COMPANY_DETAILS.udyam}</div>
                <div>${COMPANY_DETAILS.importExport}</div>
                <div>${COMPANY_DETAILS.lei}</div>
                <div>GSTIN/UIN: <strong>${COMPANY_DETAILS.gstin}</strong></div>
                <div>State Name: <strong>${COMPANY_DETAILS.stateName}</strong>, Code: <strong>${COMPANY_DETAILS.stateCode}</strong></div>
                <div>Contact: <strong>${COMPANY_DETAILS.contact}</strong></div>
              </div>
            </div>
          </div>
          <div class="invoice-details">
            <table>
              <tr>
                <td>Invoice No.</td>
                <td><strong>${invoice.invoiceNumber}</strong></td>
                <td>Dated</td>
                <td><strong>${formatDate(invoice.invoiceDate)}</strong></td>
              </tr>
              <tr>
                <td>e-Way Bill No.</td>
                <td><strong>${invoice.ewayBillNumber || ''}</strong></td>
                <td>Mode/Terms of Payment</td>
                <td><strong>${invoice.paymentTerms || '30 DAYS'}</strong></td>
              </tr>
              <tr>
                <td>Delivery Note</td>
                <td><strong>${invoice.deliveryNoteNumber || ''}</strong></td>
                <td>Other References</td>
                <td><strong>${invoice.otherReferences || ''}</strong></td>
              </tr>
              <tr>
                <td>Reference No. & Date.</td>
                <td><strong>${invoice.referenceNumber || ''}</strong></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Buyer's Order No.</td>
                <td><strong>${invoice.buyerOrderNumber || ''}</strong></td>
                <td>Dated</td>
                <td><strong>${invoice.buyerOrderDate ? formatDate(invoice.buyerOrderDate) : ''}</strong></td>
              </tr>
              <tr>
                <td>Dispatch Doc No.</td>
                <td><strong>${invoice.dispatchDocNumber || invoice.invoiceNumber || ''}</strong></td>
                <td>Delivery Note Date</td>
                <td><strong>${invoice.deliveryNoteDate ? formatDate(invoice.deliveryNoteDate) : ''}</strong></td>
              </tr>
              <tr>
                <td>Dispatched through</td>
                <td><strong>${invoice.dispatchedThrough || invoice.transporterName || ''}</strong></td>
                <td>Destination</td>
                <td><strong>${invoice.destination || ''}</strong></td>
              </tr>
              <tr>
                <td>Vessel/Flight No.</td>
                <td><strong>${invoice.vesselFlightNo || invoice.vehicleNumber || ''}</strong></td>
                <td>Place of receipt by shipper</td>
                <td><strong>${invoice.placeOfReceipt || ''}</strong></td>
              </tr>
              <tr>
                <td>City/Port of Loading</td>
                <td><strong>${invoice.portOfLoading || 'GUWAHATI'}</strong></td>
                <td>City/Port of Discharge</td>
                <td><strong>${invoice.portOfDischarge || ''}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Consignee and Buyer / Supplier for Purchase -->
        <div class="party-row">
          <div class="party-section">
            <div class="section-title">${type === 'purchase' ? 'Buyer (Bill to)' : 'Consignee (Ship to)'}</div>
            <div><strong>${type === 'purchase' ? invoice.buyerName || invoice.customerName || '' : invoice.shipToName || invoice.customerName || ''}</strong></div>
            <div>${type === 'purchase' ? invoice.buyerAddress || invoice.customerAddress || '' : invoice.shipToAddress || invoice.shippingAddress || invoice.customerAddress || ''}</div>
            <div>GSTIN/UIN : <strong>${type === 'purchase' ? invoice.buyerGstin || invoice.customerGstin || '' : invoice.shipToGstin || invoice.customerGstin || ''}</strong></div>
            <div>State Name : <strong>${type === 'purchase' ? invoice.buyerState || invoice.placeOfSupply || 'Assam' : invoice.shipToState || invoice.placeOfSupply || 'Assam'}</strong>, Code : <strong>${type === 'purchase' ? invoice.buyerStateCode || invoice.placeOfSupplyStateCode || '18' : invoice.shipToStateCode || invoice.placeOfSupplyStateCode || '18'}</strong></div>
            ${type !== 'purchase' ? `<div>Place of Supply : <strong>${invoice.placeOfSupply || 'Assam'}</strong></div>` : ''}
          </div>
          <div class="party-section">
            <div class="section-title">${type === 'purchase' ? 'Supplier (Ship from)' : 'Buyer (Bill to)'}</div>
            <div><strong>${type === 'purchase' ? invoice.supplierName || invoice.vendorName || '' : invoice.customerName || ''}</strong></div>
            <div>${type === 'purchase' ? invoice.supplierAddress || invoice.vendorAddress || '' : invoice.customerAddress || invoice.billingAddress || ''}</div>
            <div>GSTIN/UIN : <strong>${type === 'purchase' ? invoice.supplierGstin || invoice.vendorGstin || '' : invoice.customerGstin || invoice.customerGSTIN || ''}</strong></div>
            <div>State Name : <strong>${type === 'purchase' ? invoice.supplierState || invoice.placeOfSupply || 'Assam' : invoice.customerState || invoice.placeOfSupply || 'Assam'}</strong>, Code : <strong>${type === 'purchase' ? invoice.supplierStateCode || invoice.placeOfSupplyStateCode || '18' : invoice.customerStateCode || invoice.placeOfSupplyStateCode || '18'}</strong></div>
            ${type === 'purchase' ? `<div>Place of Supply : <strong>${invoice.placeOfSupply || 'Assam'}</strong></div>` : ''}
          </div>
        </div>

        <!-- Terms of Delivery -->
        <div class="terms-delivery">
          <strong>Terms of Delivery:</strong> ${invoice.termsOfDelivery || 'AFTER 30 DAYS INTEREST WILL BE CHARGED @18%'}
        </div>

        <!-- Items Table -->
        <div class="items-section">
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 25px;">SI</th>
                <th style="width: 180px;">Description of Goods</th>
                <th style="width: 65px;">HSN/SAC</th>
                <th style="width: 70px;">Quantity</th>
                <th style="width: 65px;">Rate</th>
                <th style="width: 40px;">per</th>
                <th style="width: 85px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${generateItemsRows()}
              <!-- Empty rows for spacing -->
              <tr style="height: 20px;">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
              </tr>
              <!-- Tax rows -->
              <tr class="tax-rows">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: center;"><strong style="color: #CC5500;">OUTPUT CGST</strong></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">${formatIndianNumber(cgstAmount)}</td>
              </tr>
              <tr class="tax-rows">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: center;"><strong style="color: #CC5500;">OUTPUT SGST</strong></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">${formatIndianNumber(sgstAmount)}</td>
              </tr>
              <tr class="tax-rows">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: center;"><strong style="color: #CC5500;">ROUND OFF</strong></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">${roundOff.toFixed(2)}</td>
              </tr>
              <!-- Total row -->
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">Total</td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">${getTotalQtyWithUnit()}</td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; text-align: right;">₹ ${formatIndianNumber(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Amount in Words -->
        <div class="amount-words-section">
          <div><strong>Amount Chargeable (in words)</strong></div>
          <div><strong>${numberToWords(totalAmount)}</strong></div>
          <div style="text-align: right;">E. & O.E</div>
        </div>

        <!-- HSN Summary Table -->
        <div class="hsn-section">
          <table class="hsn-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 70px;">HSN/SAC</th>
                <th rowspan="2" style="width: 90px;">Taxable Value</th>
                <th colspan="2">CGST</th>
                <th colspan="2">SGST/UTGST</th>
                <th rowspan="2" style="width: 90px;">Total Tax Amount</th>
              </tr>
              <tr>
                <th style="width: 40px;">Rate</th>
                <th style="width: 70px;">Amount</th>
                <th style="width: 40px;">Rate</th>
                <th style="width: 70px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${generateHsnSummary()}
              <tr style="font-weight: bold;">
                <td style="border: 1px solid #000; padding: 3px; text-align: right;">Total</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(taxableAmount)}</td>
                <td style="border: 1px solid #000; padding: 3px;"></td>
                <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(cgstAmount)}</td>
                <td style="border: 1px solid #000; padding: 3px;"></td>
                <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(sgstAmount)}</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatIndianNumber(cgstAmount + sgstAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tax Amount in Words and PAN -->
        <div class="tax-words-section">
          <div><strong>Tax Amount (in words) :</strong> ${numberToWords(cgstAmount + sgstAmount)}</div>
          <div><strong>Company's PAN</strong> : <strong>${COMPANY_DETAILS.pan}</strong></div>
        </div>

        <!-- Declaration and Bank Details -->
        <div class="footer-section">
          <div class="declaration">
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 3px;">Declaration</div>
            <div>Terms & Conditions</div>
            <div>1.If the Payment is not done with in the due terms of invoice then an interest of 24% per annum.</div>
            <div>2. In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.</div>
            <div>3. Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.</div>
            <div>4.Detention of Rs 4000 per day will be charged,if vehicle not unloaded with in 48 hrs of Reporting.</div>
          </div>
          <div class="bank-details">
            <div style="font-weight: bold; margin-bottom: 5px;">Company's Bank Details</div>
            <table style="width: 100%; font-size: 8px;">
              <tr><td style="width: 40%;">A/c Holder's Name</td><td>: <strong>${COMPANY_DETAILS.bankAccountName}</strong></td></tr>
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
            <div style="position: absolute; bottom: 5px; right: 10px; font-weight: bold; color: #E67E22;">Authorised Signatory</div>
          </div>
        </div>
      </div>

      <div class="no-print">
        <button onclick="window.print()" style="padding: 12px 25px; background: #E67E22; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;
};

export const printTaxInvoice = async (invoice: any, type: 'sales' | 'purchase', showError?: (msg: string) => void): Promise<void> => {
  try {
    // First load the logo as base64
    let logoBase64 = '';
    try {
      const response = await fetch('/logo.jpg');
      const blob = await response.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Failed to load logo:', err);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (showError) {
        showError('Please allow popups for this site');
      }
      return;
    }

    let invoiceHtml = generateTaxInvoiceHtml(invoice, type);
    // Replace the logo src with base64
    if (logoBase64) {
      invoiceHtml = invoiceHtml.replace(/src="\/logo\.jpg"/g, `src="${logoBase64}"`);
    }
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } catch (err) {
    console.error('Print error:', err);
    if (showError) {
      showError('Failed to print invoice');
    }
  }
};

// Generate Sales Order HTML matching the screenshot format
export const generateSalesOrderHtml = (invoice: any): string => {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year.toString().slice(-2)}`;
  };

  const formatDeliveryTerms = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                   day === 2 || day === 22 ? 'nd' : 
                   day === 3 || day === 23 ? 'rd' : 'th';
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${day}${suffix} TO ${day + 3}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatIndianNumber = (num: number): string => {
    if (!num || isNaN(num)) return '0';
    const str = Math.round(num).toString();
    const lastThree = str.slice(-3);
    const otherNumbers = str.slice(0, -3);
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherNumbers ? ',' : '') + lastThree;
    return formatted;
  };

  // Get items from invoice - debug logging
  console.log('🖨️ Sales Order Print - Invoice data:', invoice);
  console.log('🖨️ Sales Order Print - Items:', invoice.items);
  
  const items = invoice.items || [];
  
  // Calculate totals from invoice or items
  let subtotal = parseFloat(invoice.subtotalAmount || 0);
  let gstAmount = parseFloat(invoice.cgstAmount || 0) + parseFloat(invoice.sgstAmount || 0) + parseFloat(invoice.igstAmount || 0);
  
  // If no subtotal from invoice, calculate from items
  if (subtotal === 0 && items.length > 0) {
    // Calculate subtotal only from non-freight items
    subtotal = items.reduce((sum: number, item: any) => {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const productName = item.productName || item.description || '';
      const isFreightItem = productName.toLowerCase().includes('freight');
      if (isFreightItem) return sum; // Skip freight items in subtotal
      return sum + (qty * rate);
    }, 0);
    
    // Calculate GST only from non-freight items
    gstAmount = items.reduce((sum: number, item: any) => {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const productName = item.productName || item.description || '';
      const isFreightItem = productName.toLowerCase().includes('freight');
      if (isFreightItem) return sum; // No GST on freight
      const itemAmount = qty * rate;
      const itemGstRate = parseFloat(item.cgstRate || item.sgstRate || 9) * 2; // CGST + SGST
      return sum + (itemAmount * itemGstRate / 100);
    }, 0);
  }
  
  const gstRate = 18;
  
  // Calculate freight amount from items (FREIGHT items) + separate freight charges
  const freightFromItems = items.reduce((sum: number, item: any) => {
    const productName = item.productName || item.description || '';
    const isFreightItem = productName.toLowerCase().includes('freight');
    if (isFreightItem) {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      return sum + (qty * rate);
    }
    return sum;
  }, 0);
  
  const freightAmount = freightFromItems + parseFloat(invoice.freightCharges || invoice.transportCharges || invoice.otherCharges || 0);
  const totalAmount = parseFloat(invoice.totalInvoiceAmount || 0) || (subtotal + gstAmount + freightAmount);

  // Generate items rows
  const generateItemsRows = (): string => {
    if (items.length === 0) {
      return `
        <tr>
          <td colspan="7" style="border: 1px dashed #E67E22; padding: 20px; text-align: center; color: #999;">
            No items found in this invoice
          </td>
        </tr>
      `;
    }
    
    let rows = '';
    items.forEach((item: any) => {
      const qty = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.ratePerUnit || item.rate || 0);
      const amount = parseFloat(item.taxableAmount || item.grossAmount || 0) || (qty * rate);
      const productName = item.productName || item.description || 'BITUMEN VG-30 PHONEIX EMBOSSED';
      const isFreightItem = productName.toLowerCase().includes('freight');
      
      // Use provided gstAmount or cgstAmount/sgstAmount, or calculate based on whether it's freight
      let itemGst = 0;
      const itemCgst = parseFloat(item.cgstAmount || 0);
      const itemSgst = parseFloat(item.sgstAmount || 0);
      if (isFreightItem) {
        // Freight items have 0% GST
        itemGst = 0;
      } else if (itemCgst || itemSgst) {
        // Use calculated CGST + SGST
        itemGst = itemCgst + itemSgst;
      } else {
        // Calculate as 18% of amount
        itemGst = amount * (gstRate / 100);
      }
      
      const itemTotal = parseFloat(item.totalAmount || 0) || (amount + itemGst);
      const unit = item.unitOfMeasurement || item.unit || 'MT';
      
      rows += `
        <tr>
          <td style="border: 1px dashed #E67E22; padding: 8px; font-weight: bold;">${productName}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: center;">${qty}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: center;">${unit}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: right;">${formatIndianNumber(rate)}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: right;">${formatIndianNumber(amount)}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: right;">${formatIndianNumber(itemGst)}</td>
          <td style="border: 1px dashed #E67E22; padding: 8px; text-align: right;">${formatIndianNumber(itemTotal)}</td>
        </tr>
      `;
    });
    
    return rows;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Order - ${invoice.invoiceNumber || invoice.orderNumber || ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; padding: 15px; background: #fff; }
        .container { max-width: 800px; margin: 0 auto; border: 2px solid #e54a2c; }
        .header { display: flex; align-items: center; padding: 15px; border-bottom: 2px solid #e54a2c; }
        .logo-section { display: flex; align-items: center; gap: 10px; }
        .logo-hindi { font-size: 36px; color: #e54a2c; font-weight: bold; font-family: serif; }
        .logo-text { font-size: 12px; color: #e54a2c; font-weight: bold; }
        .company-details { flex: 1; text-align: right; }
        .company-name { font-size: 22px; color: #e54a2c; font-weight: bold; margin-bottom: 5px; }
        .company-address { font-size: 10px; color: #333; line-height: 1.3; }
        .company-contact { font-size: 10px; color: #333; margin-top: 5px; }
        .title { text-align: center; padding: 10px; font-size: 20px; color: #e54a2c; font-weight: bold; border-bottom: 2px solid #e54a2c; }
        .info-row { display: flex; border-bottom: 2px solid #e54a2c; }
        .info-cell { flex: 1; padding: 8px; border-right: 2px solid #e54a2c; }
        .info-cell:last-child { border-right: none; }
        .info-label { font-size: 10px; color: #e54a2c; font-weight: bold; margin-bottom: 3px; }
        .info-value { font-size: 11px; font-weight: bold; }
        .party-section { display: flex; border-bottom: 2px solid #e54a2c; }
        .bill-to, .ship-to { flex: 1; padding: 10px; }
        .bill-to { border-right: 2px solid #e54a2c; }
        .party-title { font-size: 11px; color: #e54a2c; font-weight: bold; margin-bottom: 8px; }
        .party-detail { font-size: 10px; margin: 4px 0; }
        .party-label { color: #e54a2c; font-weight: bold; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-header { background: #FFF3E0; }
        .items-header th { border: 1px dashed #e54a2c; padding: 8px; color: #e54a2c; font-weight: bold; font-size: 10px; }
        .items-table td { border: 1px dashed #e54a2c; padding: 8px; font-weight: bold; }
        .bottom-section { display: flex; border-top: 2px solid #e54a2c; }
        .left-section { flex: 1; padding: 10px; border-right: 2px solid #e54a2c; }
        .right-section { width: 250px; }
        .totals-row { display: flex; border-bottom: 1px solid #e54a2c; }
        .totals-label { flex: 1; padding: 8px; font-weight: bold; text-align: right; color: #e54a2c; }
        .totals-value { width: 100px; padding: 8px; text-align: right; font-weight: bold; }
        .freight-note { padding: 8px; font-size: 10px; font-weight: bold; color: #e54a2c; border-bottom: 2px solid #e54a2c; }
        .terms-bank { display: flex; border-bottom: 2px solid #e54a2c; }
        .terms { flex: 1; padding: 10px; border-right: 2px solid #e54a2c; font-size: 9px; }
        .terms-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
        .bank-details { width: 250px; padding: 10px; }
        .bank-title { font-weight: bold; font-size: 12px; color: #e54a2c; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; }
        .bank-row { font-size: 10px; margin: 3px 0; }
        .signature-section { display: flex; }
        .signature-left { flex: 1; padding: 15px; border-right: 2px solid #e54a2c; min-height: 80px; }
        .signature-right { width: 250px; padding: 15px; text-align: center; position: relative; min-height: 80px; }
        .signature-company { font-weight: bold; font-size: 11px; margin-bottom: 10px; }
        .stamp-area { height: 60px; display: flex; align-items: center; justify-content: center; margin: 8px 0; }
        .auth-stamp { max-width: 70px; max-height: 70px; object-fit: contain; }
        .signature-line { margin-top: 5px; font-size: 10px; }
        .no-print { margin-top: 20px; text-align: center; }
        @media print { 
          body { padding: 0; } 
          .no-print { display: none; }
          @page { size: A4; margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Company Details -->
        <div class="header">
          <div class="logo-section">
            <img src="/logo.jpg" alt="SRI HM Bitumen Company" style="width: 140px; height: auto; border: 1px solid #e54a2c; padding: 5px;" />
          </div>
          <div class="company-details">
            <div class="company-name">M/S SRI HM BITUMEN CO</div>
            <div class="company-address">
              Dag No: 1071, Patta No: 264, Mikirpara, Chakardaigaon<br>
              Mouza - Ramcharani, Guwahati, Assam - 781035
            </div>
            <div class="company-contact">
              GST No: 18CGMPP6536N2ZG<br>
              Mobile No: +91 8453059698<br>
              Email ID: info.srihmbitumen@gmail.com
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="title">Sales Order</div>

        <!-- Order Info Row 1 -->
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">Sales Order No.</div>
            <div class="info-value">${invoice.invoiceNumber || invoice.orderNumber || ''}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Sales Order Date</div>
            <div class="info-value">${formatDate(invoice.invoiceDate || invoice.orderDate)}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Delivery Terms</div>
            <div class="info-value">${invoice.deliveryTerms || 'Within 15-20 Days'}</div>
          </div>
        </div>

        <!-- Order Info Row 2 -->
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">Payment Terms</div>
            <div class="info-value">${invoice.paymentTerms || 'ADVANCE'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Destination</div>
            <div class="info-value">${invoice.destination || invoice.placeOfSupply || ''}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Loading From</div>
            <div class="info-value">${invoice.loadingFrom || invoice.dispatchFrom || 'KANDLA'}</div>
          </div>
        </div>

        <!-- Bill To and Ship To -->
        <div class="party-section">
          <div class="bill-to">
            <div class="party-title">Bill To :</div>
            <div class="party-detail"><span class="party-label">Name :</span> <strong>${invoice.customerName || 'N/A'}</strong></div>
            <div class="party-detail"><span class="party-label">GST No :</span> <strong>${invoice.customerGstin || invoice.customerGSTIN || 'N/A'}</strong></div>
            <div class="party-detail"><span class="party-label">Address :</span> ${invoice.customerAddress || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">State :</span> ${invoice.customerState || invoice.placeOfSupply || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">Pin Code :</span> ${invoice.customerPincode || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">Mobile No :</span> ${invoice.customerMobile || invoice.customerPhone || invoice.partyMobileNumber || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">Email ID :</span> ${invoice.customerEmail || 'N/A'}</div>
          </div>
          <div class="ship-to">
            <div class="party-title">Ship To :</div>
            <div class="party-detail"><span class="party-label">Name :</span> <strong>${invoice.shipToName || invoice.customerName || 'Same as Bill To'}</strong></div>
            <div class="party-detail"><span class="party-label">GST No :</span> <strong>${invoice.shipToGstin || invoice.customerGstin || 'N/A'}</strong></div>
            <div class="party-detail"><span class="party-label">Address :</span> ${invoice.shipToAddress || invoice.shippingAddress || invoice.customerAddress || 'Same as Bill To'}</div>
            <div class="party-detail"><span class="party-label">State :</span> ${invoice.shipToState || invoice.placeOfSupply || 'ASSAM'}</div>
            <div class="party-detail"><span class="party-label">Pin Code :</span> ${invoice.shipToPincode || invoice.customerPincode || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">Mobile No :</span> ${invoice.shipToMobile || invoice.customerMobile || 'N/A'}</div>
            <div class="party-detail"><span class="party-label">Email ID :</span> ${invoice.shipToEmail || invoice.customerEmail || 'N/A'}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead class="items-header">
            <tr>
              <th style="width: 25%; font-weight: bold;"><strong>Item #</strong></th>
              <th style="width: 8%; font-weight: bold;"><strong>Qty</strong></th>
              <th style="width: 8%; font-weight: bold;"><strong>Unit</strong></th>
              <th style="width: 12%; font-weight: bold;"><strong>Ex Factory Rate</strong></th>
              <th style="width: 15%; font-weight: bold;"><strong>Amount(₹)</strong></th>
              <th style="width: 15%; font-weight: bold;"><strong>GST@${gstRate}%(₹)</strong></th>
              <th style="width: 17%; font-weight: bold;"><strong>Total Amount(₹)</strong></th>
            </tr>
          </thead>
          <tbody>
            ${generateItemsRows()}
          </tbody>
        </table>

        <!-- Bottom Section - Sales Person and Totals -->
        <div class="bottom-section">
          <div class="left-section">
            <div style="margin-bottom: 10px;">
              <span style="color: #E67E22; font-weight: bold;">Sales Person Name:</span>
            </div>
            <div style="margin-bottom: 15px; font-weight: bold;">${invoice.salesPersonName || invoice.salesPerson || ''}</div>
            <div style="margin-bottom: 10px;">
              <span style="color: #E67E22; font-weight: bold;">Description :</span>
            </div>
            <div style="font-weight: bold;">${invoice.description || invoice.remarks || ''}</div>
          </div>
          <div class="right-section">
            <div class="totals-row">
              <div class="totals-label">SubTotal</div>
              <div class="totals-value">${formatIndianNumber(subtotal + gstAmount)}</div>
            </div>
            <div class="totals-row">
              <div class="totals-label">Freight</div>
              <div class="totals-value">${formatIndianNumber(freightAmount)}</div>
            </div>
            <div class="totals-row" style="background: #FFF3E0;">
              <div class="totals-label" style="color: #E67E22;">Total</div>
              <div class="totals-value" style="color: #E67E22;">${formatIndianNumber(subtotal + gstAmount + freightAmount)}</div>
            </div>
          </div>
        </div>



        <!-- Terms and Bank Details -->
        <div class="terms-bank">
          <div class="terms">
            <div class="terms-title">Terms and Conditions :</div>
            <div>- Payment Should be made on or before 30th day of the Day of Billing.</div>
            <div>- Incase Of Late Payment, Credit Limit will be Reduce by 10%.</div>
            <div>- If the Payment is not done within the due terms of invoice then an interest of 24% per annum i.e 2% per month would be charged on due amount.</div>
            <div>- All Cheques/Demand Drafts for payment of bills must be crossed "A/C Payee Only" and Drawn in Favor of "Company's Name".</div>
            <div>- In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.</div>
            <div>- Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.</div>
            <div>- If the Payment Is Not Done within the 30 days of the due date then the rest of the pending order will be on hold.</div>
            <div>- Telephonic Conversations Can be recorded for training and other official purposes.</div>
            <div>- If Payment Received Before 30 Days Then a Special Discount will be given to you 200 / Per Ton.</div>
            <div>- Detention of Rs 4000 per day will be charged,if the vehicle is not unloaded within 48 hrs of Reporting.</div>
          </div>
          <div class="bank-details">
            <div class="bank-title">Bank Details</div>
            <div class="bank-row"><strong>Bank Name :</strong> State Bank of India</div>
            <div class="bank-row"><strong>Account No. :</strong> 43063628954</div>
            <div class="bank-row"><strong>Branch :</strong> Paltan, Bazar</div>
            <div class="bank-row"><strong>IFSC Code :</strong> SBIN0013247</div>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-left"></div>
          <div class="signature-right">
            <div class="signature-company">For M/S SRI HM BITUMEN CO</div>
            <div class="stamp-area">
              ${stampBase64 ? `<img src="${stampBase64}" alt="Authorized Signatory Stamp" class="auth-stamp" />` : '<div style="width: 70px; height: 70px; border: 1px dashed #ccc;"></div>'}
            </div>
            <div class="signature-line">Authorized Signatory</div>
          </div>
        </div>
      </div>

      <div class="no-print">
        <button onclick="window.print()" style="padding: 12px 25px; background: #E67E22; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;
};

// Print Sales Order
export const printSalesOrder = async (invoice: any, showError?: (msg: string) => void): Promise<void> => {
  try {
    // First load the logo as base64
    let logoBase64 = '';
    let stampBase64 = '';
    try {
      const response = await fetch('/logo.jpg');
      const blob = await response.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Failed to load logo:', err);
    }

    // Load stamp image
    try {
      const stampResponse = await fetch('/stamp.png');
      if (stampResponse.ok) {
        const stampBlob = await stampResponse.blob();
        stampBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(stampBlob);
        });
      }
    } catch (err) {
      console.error('Failed to load stamp:', err);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (showError) {
        showError('Please allow popups for this site');
      }
      return;
    }

    let orderHtml = generateSalesOrderHtml(invoice);
    // Replace the logo src with base64
    if (logoBase64) {
      orderHtml = orderHtml.replace(/src="\/logo\.jpg"/g, `src="${logoBase64}"`);
    }
    printWindow.document.write(orderHtml);
    printWindow.document.close();
  } catch (err) {
    console.error('Print error:', err);
    if (showError) {
      showError('Failed to print');
    }
  }
};
