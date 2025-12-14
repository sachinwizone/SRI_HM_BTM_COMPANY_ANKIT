import React from 'react';

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

// Logo as SVG component (based on the HM Bitumen logo from attachment)
const CompanyLogo = () => (
  <div className="flex items-center gap-1">
    <div className="relative" style={{ width: '50px', height: '50px' }}>
      {/* Stylized श्री symbol */}
      <svg viewBox="0 0 50 50" className="w-full h-full">
        <circle cx="25" cy="25" r="23" fill="none" stroke="#E67E22" strokeWidth="2" />
        <text x="25" y="32" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#E67E22" fontFamily="serif">श्री</text>
      </svg>
    </div>
    <div className="text-left">
      <div className="font-bold text-lg" style={{ color: '#E67E22' }}>
        <span style={{ color: '#D35400' }}>H</span><span style={{ color: '#E67E22' }}>M</span>
      </div>
      <div className="text-xs font-semibold" style={{ color: '#666' }}>BITUMEN</div>
      <div className="text-[8px]" style={{ color: '#888' }}>COMPANY</div>
    </div>
  </div>
);

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

interface InvoiceItem {
  id?: number;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
}

interface InvoiceData {
  // Invoice Details
  invoiceNo: string;
  invoiceDate: string;
  ewayBill?: string;
  ewayBillDate?: string;
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  
  // Delivery Note
  deliveryNoteNo?: string;
  deliveryNoteDate?: string;
  
  // Payment Terms
  paymentTerms: string;
  
  // Other References
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  referenceNo?: string;
  referenceDate?: string;
  otherReferences?: string;
  
  // Consignee (Ship to)
  consigneeName: string;
  consigneeAddress: string;
  consigneeGSTIN: string;
  consigneeState: string;
  consigneeStateCode: string;
  
  // Buyer (Bill to)
  buyerName: string;
  buyerAddress: string;
  buyerGSTIN: string;
  buyerState: string;
  buyerStateCode: string;
  buyerPlaceOfSupply?: string;
  
  // Transportation
  dispatchedThrough?: string;
  vesselFlightNo?: string;
  cityPortOfLoading?: string;
  cityPortOfDischarge?: string;
  destination?: string;
  billOfLadingNo?: string;
  billOfLadingDate?: string;
  lrRrNo?: string;
  lrRrDate?: string;
  termsOfDelivery?: string;
  vehicleNo?: string;
  transporter?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Additional Charges
  transitInsurance?: number;
  freight?: number;
  otherCharges?: number;
  
  // Totals (calculated)
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  totalAmount: number;
  
  // Remarks
  remarks?: string;
}

interface PrintableTaxInvoiceProps {
  invoiceData: InvoiceData;
  showQRCode?: boolean;
}

export const PrintableTaxInvoice: React.FC<PrintableTaxInvoiceProps> = ({ 
  invoiceData, 
  showQRCode = false 
}) => {
  // Calculate HSN-wise tax summary
  const hsnSummary = invoiceData.items.reduce((acc: any[], item) => {
    const existingHsn = acc.find(h => h.hsn === item.hsn);
    const taxRate = item.taxRate || 0;
    const cgstRate = taxRate / 2;
    const sgstRate = taxRate / 2;
    const cgstAmount = (item.amount * cgstRate) / 100;
    const sgstAmount = (item.amount * sgstRate) / 100;
    
    if (existingHsn) {
      existingHsn.taxableValue += item.amount;
      existingHsn.cgstAmount += cgstAmount;
      existingHsn.sgstAmount += sgstAmount;
      existingHsn.totalTax += cgstAmount + sgstAmount;
    } else {
      acc.push({
        hsn: item.hsn,
        taxableValue: item.amount,
        cgstRate: cgstRate,
        cgstAmount: cgstAmount,
        sgstRate: sgstRate,
        sgstAmount: sgstAmount,
        totalTax: cgstAmount + sgstAmount
      });
    }
    return acc;
  }, []);

  // Calculate total quantity
  const totalQuantity = invoiceData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', lineHeight: '1.3' }}>
      <div className="border-2 border-black p-2">
        
        {/* Header Row - Tax Invoice / e-Invoice */}
        <div className="flex justify-between border-b border-black pb-1 mb-1">
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">Tax Invoice</h1>
          </div>
          <div className="text-center border-l border-black pl-2" style={{ width: '100px' }}>
            <span className="font-bold">e-Invoice</span>
          </div>
        </div>

        {/* IRN, Ack No, Ack Date Row */}
        {(invoiceData.irn || invoiceData.ackNo) && (
          <div className="border-b border-black pb-1 mb-1 text-[9px]">
            <div className="flex flex-wrap gap-x-4">
              {invoiceData.irn && (
                <div><span className="font-semibold">IRN</span> : {invoiceData.irn}</div>
              )}
              {invoiceData.ackNo && (
                <div><span className="font-semibold">Ack No.</span> : {invoiceData.ackNo}</div>
              )}
              {invoiceData.ackDate && (
                <div><span className="font-semibold">Ack Date</span> : {formatDate(invoiceData.ackDate)}</div>
              )}
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="flex border-b border-black">
          {/* Left Side - Company Details */}
          <div className="flex-1 border-r border-black p-1">
            <div className="flex gap-2">
              {/* Logo */}
              <div className="flex-shrink-0">
                <CompanyLogo />
              </div>
              {/* Company Info */}
              <div className="text-[9px]">
                <div className="font-bold text-sm">{COMPANY_DETAILS.name}</div>
                <div>{COMPANY_DETAILS.dagNo}</div>
                <div>{COMPANY_DETAILS.addressLine1}</div>
                <div>{COMPANY_DETAILS.addressLine2}</div>
                <div>{COMPANY_DETAILS.city}</div>
                <div>{COMPANY_DETAILS.udyam}</div>
                <div>{COMPANY_DETAILS.importExport}</div>
                <div>{COMPANY_DETAILS.lei}</div>
                <div>GSTIN/UIN: {COMPANY_DETAILS.gstin}</div>
                <div>State Name : {COMPANY_DETAILS.stateName}, Code : {COMPANY_DETAILS.stateCode}</div>
                <div>Contact : {COMPANY_DETAILS.contact}</div>
              </div>
            </div>
          </div>

          {/* Right Side - Invoice Details Grid */}
          <div className="text-[9px]" style={{ width: '45%' }}>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-b border-r border-black p-1">Invoice No.</td>
                  <td className="border-b border-r border-black p-1">{invoiceData.invoiceNo}</td>
                  <td className="border-b border-black p-1">Dated</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.invoiceNo}</td>
                  <td className="border-b border-r border-black p-1">e-Way Bill No.</td>
                  <td className="border-b border-black p-1 font-semibold">{formatDate(invoiceData.invoiceDate)}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Delivery Note</td>
                  <td className="border-b border-r border-black p-1">{invoiceData.ewayBill || ''}</td>
                  <td className="border-b border-black p-1">Mode/Terms of Payment</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.deliveryNoteNo || ''}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.paymentTerms}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Reference No. & Date.</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">Other References</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.referenceNo ? `${invoiceData.referenceNo} dt. ${formatDate(invoiceData.referenceDate || '')}` : ''}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.otherReferences || 'FREIGHT PAID BY US'}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Buyer's Order No.</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">Dated</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.buyerOrderNo || ''}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.buyerOrderDate ? formatDate(invoiceData.buyerOrderDate) : ''}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Dispatch Doc No.</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">Delivery Note Date</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.invoiceNo}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.deliveryNoteDate ? formatDate(invoiceData.deliveryNoteDate) : formatDate(invoiceData.invoiceDate)}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Dispatched through</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">Destination</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.dispatchedThrough || invoiceData.transporter || ''}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.destination || ''}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">Vessel/Flight No.</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">Place of receipt by shipper:</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.vesselFlightNo || invoiceData.vehicleNo || ''}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold"></td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1">City/Port of Loading</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1">City/Port of Discharge</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black p-1 font-semibold">{invoiceData.cityPortOfLoading || 'GUWAHATI'}</td>
                  <td className="border-b border-r border-black p-1"></td>
                  <td className="border-b border-black p-1 font-semibold">{invoiceData.cityPortOfDischarge || ''}</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">Bill of Lading/LR-RR No.</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1"></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1 font-semibold">{invoiceData.billOfLadingNo || invoiceData.lrRrNo ? `${invoiceData.billOfLadingNo || invoiceData.lrRrNo} dt. ${formatDate(invoiceData.billOfLadingDate || invoiceData.lrRrDate || '')}` : ''}</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Consignee and Buyer Row */}
        <div className="flex border-b border-black">
          {/* Consignee (Ship to) */}
          <div className="flex-1 border-r border-black p-1 text-[9px]">
            <div className="font-semibold">Consignee (Ship to)</div>
            <div className="font-bold">{invoiceData.consigneeName}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{invoiceData.consigneeAddress}</div>
            <div>GSTIN/UIN : {invoiceData.consigneeGSTIN}</div>
            <div>PAN/IT No : {invoiceData.consigneeGSTIN.substring(2, 12)}</div>
            <div>State Name : {invoiceData.consigneeState}, Code : {invoiceData.consigneeStateCode}</div>
          </div>

          {/* Buyer (Bill to) */}
          <div className="p-1 text-[9px]" style={{ width: '45%' }}>
            <div className="font-semibold">Buyer (Bill to)</div>
            <div className="font-bold">{invoiceData.buyerName}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{invoiceData.buyerAddress}</div>
            <div>GSTIN/UIN : {invoiceData.buyerGSTIN}</div>
            <div>PAN/IT No : {invoiceData.buyerGSTIN.substring(2, 12)}</div>
            <div>State Name : {invoiceData.buyerState}, Code : {invoiceData.buyerStateCode}</div>
            <div>Place of Supply : {invoiceData.buyerPlaceOfSupply || invoiceData.buyerState}</div>
          </div>
        </div>

        {/* Terms of Delivery */}
        {invoiceData.termsOfDelivery && (
          <div className="border-b border-black p-1 text-[9px]">
            <span className="font-semibold">Terms of Delivery:</span> {invoiceData.termsOfDelivery}
          </div>
        )}

        {/* Items Table */}
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-center w-8">SI No</th>
              <th className="border border-black p-1 text-left">Description of Goods and Services</th>
              <th className="border border-black p-1 text-center w-16">HSN/SAC</th>
              <th className="border border-black p-1 text-right w-16">Quantity</th>
              <th className="border border-black p-1 text-right w-16">Rate</th>
              <th className="border border-black p-1 text-center w-8">per</th>
              <th className="border border-black p-1 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="border-l border-r border-black p-1 text-center">{index + 1}</td>
                <td className="border-r border-black p-1">
                  <div className="font-semibold">{item.description}</div>
                </td>
                <td className="border-r border-black p-1 text-center">{item.hsn}</td>
                <td className="border-r border-black p-1 text-right">{item.quantity.toFixed(3)} {item.unit}</td>
                <td className="border-r border-black p-1 text-right">{formatIndianNumber(item.rate)}</td>
                <td className="border-r border-black p-1 text-center">{item.unit}</td>
                <td className="border-r border-black p-1 text-right">{formatIndianNumber(item.amount)}</td>
              </tr>
            ))}

            {/* Transit Insurance Services */}
            {invoiceData.transitInsurance && invoiceData.transitInsurance > 0 && (
              <tr>
                <td className="border-l border-r border-black p-1 text-center"></td>
                <td className="border-r border-black p-1">
                  <div className="font-semibold text-center">Transit Insurance Services</div>
                </td>
                <td className="border-r border-black p-1 text-center">997135</td>
                <td className="border-r border-black p-1 text-right"></td>
                <td className="border-r border-black p-1 text-right"></td>
                <td className="border-r border-black p-1 text-center"></td>
                <td className="border-r border-black p-1 text-right">{formatIndianNumber(invoiceData.transitInsurance)}</td>
              </tr>
            )}

            {/* OUTPUT CGST */}
            <tr>
              <td className="border-l border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-center font-semibold">OUTPUT CGST</td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right">{formatIndianNumber(invoiceData.cgstAmount)}</td>
            </tr>

            {/* OUTPUT SGST */}
            <tr>
              <td className="border-l border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-center font-semibold">OUTPUT SGST</td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right">{formatIndianNumber(invoiceData.sgstAmount)}</td>
            </tr>

            {/* Less: ROUND OFF */}
            <tr>
              <td className="border-l border-r border-black p-1 text-center">Less :</td>
              <td className="border-r border-black p-1 text-center font-semibold">ROUND OFF</td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-right"></td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right">{invoiceData.roundOff >= 0 ? '' : '(-)'}{Math.abs(invoiceData.roundOff).toFixed(2)}</td>
            </tr>

            {/* Total Row */}
            <tr className="border-t-2 border-black font-bold">
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right">Total</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right">{totalQuantity.toFixed(3)} {invoiceData.items[0]?.unit || 'MT'}</td>
              <td className="border border-black p-1 text-right"></td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right">₹ {formatIndianNumber(invoiceData.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount Chargeable in Words */}
        <div className="border-l border-r border-b border-black p-1 text-[9px]">
          <div><span className="font-semibold">Amount Chargeable (in words)</span></div>
          <div className="font-bold">{numberToWords(invoiceData.totalAmount)}</div>
          <div className="text-right text-[8px]">E. & O.E</div>
        </div>

        {/* HSN/SAC Tax Summary Table */}
        <table className="w-full border-collapse text-[9px] border-l border-r border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-center">HSN/SAC</th>
              <th className="border border-black p-1 text-right">Taxable Value</th>
              <th className="border border-black p-1 text-center" colSpan={2}>CGST</th>
              <th className="border border-black p-1 text-center" colSpan={2}>SGST/UTGST</th>
              <th className="border border-black p-1 text-right">Total Tax Amount</th>
            </tr>
            <tr className="bg-gray-100 text-[8px]">
              <th className="border border-black p-1"></th>
              <th className="border border-black p-1"></th>
              <th className="border border-black p-1 text-center">Rate</th>
              <th className="border border-black p-1 text-right">Amount</th>
              <th className="border border-black p-1 text-center">Rate</th>
              <th className="border border-black p-1 text-right">Amount</th>
              <th className="border border-black p-1"></th>
            </tr>
          </thead>
          <tbody>
            {hsnSummary.map((hsn, index) => (
              <tr key={index}>
                <td className="border border-black p-1 text-center">{hsn.hsn}</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(hsn.taxableValue)}</td>
                <td className="border border-black p-1 text-center">{hsn.cgstRate}%</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(hsn.cgstAmount)}</td>
                <td className="border border-black p-1 text-center">{hsn.sgstRate}%</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(hsn.sgstAmount)}</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(hsn.totalTax)}</td>
              </tr>
            ))}
            {/* Transit Insurance HSN if applicable */}
            {invoiceData.transitInsurance && invoiceData.transitInsurance > 0 && (
              <tr>
                <td className="border border-black p-1 text-center">997135</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.transitInsurance)}</td>
                <td className="border border-black p-1 text-center">9%</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.transitInsurance * 0.09)}</td>
                <td className="border border-black p-1 text-center">9%</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.transitInsurance * 0.09)}</td>
                <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.transitInsurance * 0.18)}</td>
              </tr>
            )}
            {/* Total Row */}
            <tr className="font-bold">
              <td className="border border-black p-1 text-right">Total</td>
              <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.taxableAmount + (invoiceData.transitInsurance || 0))}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.cgstAmount)}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.sgstAmount)}</td>
              <td className="border border-black p-1 text-right">{formatIndianNumber(invoiceData.cgstAmount + invoiceData.sgstAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in Words */}
        <div className="border-l border-r border-b border-black p-1 text-[9px]">
          <div><span className="font-semibold">Tax Amount (in words) :</span> {numberToWords(invoiceData.cgstAmount + invoiceData.sgstAmount)}</div>
          <div><span className="font-semibold">Company's PAN</span> : {COMPANY_DETAILS.pan}</div>
        </div>

        {/* Declaration and Bank Details */}
        <div className="flex border-l border-r border-b border-black">
          {/* Declaration */}
          <div className="flex-1 p-1 text-[8px] border-r border-black">
            <div className="font-bold underline">Declaration</div>
            <div>Terms & Conditions&</div>
            <div className="mt-1">1.If the Payment is not done with in the due terms of invoice then an interest of 24% per annum.</div>
            <div>2. In case of Cheque Returned/Bounced , All the Penalties Will Be Bear by Buyer.</div>
            <div>3. Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.</div>
            <div>4.Detention of Rs 4000 per day will be charged,if vehicle not unloaded with in 48 hrs of Reporting.</div>
          </div>

          {/* Bank Details */}
          <div className="p-1 text-[9px]" style={{ width: '45%' }}>
            <div className="font-bold">Company's Bank Details</div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="pr-2">A/c Holder's Name</td>
                  <td>: <span className="font-bold">{COMPANY_DETAILS.bankAccountName}</span></td>
                </tr>
                <tr>
                  <td className="pr-2">Bank Name</td>
                  <td>: <span className="font-bold">{COMPANY_DETAILS.bankName}</span></td>
                </tr>
                <tr>
                  <td className="pr-2">A/c No.</td>
                  <td>: <span className="font-bold">{COMPANY_DETAILS.bankAccountNo}</span></td>
                </tr>
                <tr>
                  <td className="pr-2">Branch & IFS Code</td>
                  <td>: <span className="font-bold">{COMPANY_DETAILS.bankBranch} & {COMPANY_DETAILS.bankIfsc}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Section */}
        <div className="flex border-l border-r border-b border-black">
          {/* Customer's Seal and Signature */}
          <div className="flex-1 p-2 text-[9px] border-r border-black" style={{ minHeight: '80px' }}>
            <div className="font-semibold">Customer's Seal and Signature</div>
          </div>

          {/* Authorized Signatory */}
          <div className="p-2 text-[9px] text-right" style={{ width: '45%', minHeight: '80px' }}>
            <div className="font-bold">for {COMPANY_DETAILS.name}</div>
            <div className="mt-10"></div>
            <div className="font-semibold">Authorised Signatory</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[8px] py-1">
          This is a Computer Generated Invoice
        </div>

      </div>
    </div>
  );
};

export default PrintableTaxInvoice;
