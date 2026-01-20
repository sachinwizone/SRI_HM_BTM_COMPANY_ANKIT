import React from "react";
import { jsPDF } from "jspdf";

interface SalesOrderData {
  orderNumber: string;
  orderDate: Date;
  deliveryTerms?: string;
  paymentTerms?: string;
  destination?: string;
  loadingFrom?: string;
  client: {
    name: string;
    gstNumber?: string;
    address?: string;
    state?: string;
    pinCode?: string;
    mobileNumber?: string;
    email?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    gstRate?: number;
    gstAmount?: number;
    totalAmount: number;
  }>;
  transportCharges?: {
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  };
  transportationDetails?: {
    vehicleType?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverContact?: string;
    transportMode?: string;
    estimatedDelivery?: string;
    route?: string;
    trackingNumber?: string;
  };
  salesPersonName?: string;
  description?: string;
  note?: string;
  subtotal: number;
  freight: number;
  total: number;
  companyDetails: {
    name: string;
    address: string;
    gstNumber: string;
    mobile: string;
    email: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      branch: string;
      ifscCode: string;
    };
  };
}

export const generateBitumenSalesOrderPDF = (salesOrderData: SalesOrderData) => {
  const doc = new jsPDF();
  
  // Page setup
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let currentY = 10;

  // Colors - Clean professional colors
  const orangeColor: [number, number, number] = [230, 126, 34]; // Orange like logo
  const blackColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [80, 80, 80];
  const borderColor: [number, number, number] = [0, 0, 0];

  // Format currency in Indian format
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Draw page border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');

  currentY = 15;

  // ===================== HEADER SECTION =====================
  // Draw "Shri" symbol and HM text (logo simulation)
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Shri', margin + 5, currentY + 5);
  doc.setFontSize(20);
  doc.text('HM', margin + 5, currentY + 14);
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('BITUMEN COMPANY', margin + 3, currentY + 20);

  // Company Name and Details (right side)
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(salesOrderData.companyDetails.name, margin + 45, currentY + 8);

  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const addressLine = salesOrderData.companyDetails.address.replace(/\n/g, ', ');
  doc.text(addressLine, margin + 45, currentY + 14);
  doc.text(`GSTIN/UIN: ${salesOrderData.companyDetails.gstNumber}`, margin + 45, currentY + 19);
  doc.text(`Mobile: ${salesOrderData.companyDetails.mobile} | Email: ${salesOrderData.companyDetails.email}`, margin + 45, currentY + 24);

  currentY += 32;

  // ===================== SALES ORDER TITLE =====================
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 8;
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES ORDER', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  // ===================== ORDER INFO TABLE =====================
  const infoTableWidth = pageWidth - 2 * margin;
  // Wider columns for Order No and Date to avoid overlap
  const col1Width = infoTableWidth * 0.30; // Order No column - 30%
  const col2Width = infoTableWidth * 0.20; // Date column - 20%
  const col3Width = infoTableWidth * 0.25; // Delivery column - 25%
  const col4Width = infoTableWidth * 0.25; // Payment column - 25%

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);

  // Row 1
  doc.rect(margin, currentY, col1Width, 8, 'S');
  doc.rect(margin + col1Width, currentY, col2Width, 8, 'S');
  doc.rect(margin + col1Width + col2Width, currentY, col3Width, 8, 'S');
  doc.rect(margin + col1Width + col2Width + col3Width, currentY, col4Width, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.text('Order No:', margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.orderNumber, margin + 22, currentY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin + col1Width + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.orderDate.toLocaleDateString('en-GB'), margin + col1Width + 14, currentY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery:', margin + col1Width + col2Width + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  const deliveryText = (salesOrderData.deliveryTerms || 'Within 10-12 Days').substring(0, 16);
  doc.text(deliveryText, margin + col1Width + col2Width + 22, currentY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Payment:', margin + col1Width + col2Width + col3Width + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  const paymentText = (salesOrderData.paymentTerms || '30 Days Credit').substring(0, 16);
  doc.text(paymentText, margin + col1Width + col2Width + col3Width + 22, currentY + 5);

  currentY += 8;

  // Row 2
  doc.rect(margin, currentY, col1Width + col2Width, 8, 'S');
  doc.rect(margin + col1Width + col2Width, currentY, col3Width + col4Width, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.text('Loading From:', margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.loadingFrom || 'Kandla', margin + 30, currentY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Destination:', margin + col1Width + col2Width + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.destination || 'TBD', margin + col1Width + col2Width + 28, currentY + 5);

  currentY += 12;

  // ===================== BILL TO / SHIP TO =====================
  const sectionWidth = (pageWidth - 2 * margin) / 2;
  
  // Bill To Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Bill To :', margin + 2, currentY + 5);
  doc.text('Ship To :', margin + sectionWidth + 2, currentY + 5);
  
  currentY += 2;
  doc.rect(margin, currentY, sectionWidth, 50, 'S');
  doc.rect(margin + sectionWidth, currentY, sectionWidth, 50, 'S');

  currentY += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const clientInfo = [
    { label: 'Name :', value: salesOrderData.client.name || '' },
    { label: 'GST No :', value: salesOrderData.client.gstNumber || '' },
    { label: 'Address :', value: (salesOrderData.client.address || '').substring(0, 40) },
    { label: 'State :', value: salesOrderData.client.state || '' },
    { label: 'Pin Code :', value: salesOrderData.client.pinCode || '' },
    { label: 'Mobile No :', value: salesOrderData.client.mobileNumber || '' },
    { label: 'Email ID :', value: salesOrderData.client.email || '' }
  ];

  clientInfo.forEach((info, index) => {
    const y = currentY + (index * 5);
    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.text(info.label, margin + 2, y);
    
    // Highlight name with background color and larger font
    if (index === 0) { // Name field
      doc.setFillColor(248, 249, 250); // Light background
      doc.rect(margin + 22, y - 2, sectionWidth - 24, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(44, 62, 80); // Darker text color
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
    }
    doc.text(info.value.substring(0, 35), margin + 22, y);
    
    // Ship To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(info.label, margin + sectionWidth + 2, y);
    
    // Highlight name with background color and larger font
    if (index === 0) { // Name field
      doc.setFillColor(248, 249, 250); // Light background
      doc.rect(margin + sectionWidth + 22, y - 2, sectionWidth - 24, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(44, 62, 80); // Darker text color
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
    }
    doc.text(info.value.substring(0, 35), margin + sectionWidth + 22, y);
  });

  currentY += 47;

  // ===================== ITEMS TABLE =====================
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = [25, 15, 15, 25, 25, 25, 25]; // Item #, Qty, Unit, Ex Factory Rate, Amount(₹), GST@18%(₹), Total Amount(₹)
  const headers = ['Item #', 'Qty', 'Unit', 'Ex Factory Rate', 'Amount(₹)', 'GST@18%(₹)', 'Total Amount(₹)'];
  
  // Table Header
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  
  let colX = margin;
  headers.forEach((header, i) => {
    doc.rect(colX, currentY, colWidths[i], 8, 'S');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(header, colX + colWidths[i] / 2, currentY + 5, { align: 'center' });
    colX += colWidths[i];
  });

  currentY += 8;
  const tableStartY = currentY;

  // Table Content
  doc.setFont('helvetica', 'bold'); // Make all content bold
  doc.setFontSize(9);

  let subtotal = 0;
  let totalTax = 0;

  salesOrderData.items.forEach((item, index) => {
    const qty = parseFloat(item.quantity.toString()) || 0;
    const rate = parseFloat(item.rate.toString()) || 0;
    const amount = qty * rate;
    const taxRate = item.gstRate || 18;
    const taxAmount = amount * (taxRate / 100);
    
    subtotal += amount;
    totalTax += taxAmount;

    // Draw cells
    colX = margin;
    colWidths.forEach((width) => {
      doc.rect(colX, currentY, width, 10, 'S');
      colX += width;
    });

    // Cell content
    colX = margin;
    const rowData = [
      (index + 1).toString(),
      qty.toString(),
      item.unit || 'MT',
      formatCurrency(rate),
      formatCurrency(amount),
      formatCurrency(taxAmount),
      formatCurrency(amount + taxAmount)
    ];

    rowData.forEach((data, i) => {
      doc.text(data, colX + colWidths[i] / 2, currentY + 6, { align: 'center' });
      colX += colWidths[i];
    });

    currentY += 10;
  });

  // Empty rows if needed (minimum 3 rows)
  const minRows = 3;
  const currentRows = salesOrderData.items.length;
  for (let i = currentRows; i < minRows; i++) {
    colX = margin;
    colWidths.forEach((width) => {
      doc.rect(colX, currentY, width, 10, 'S');
      colX += width;
    });
    currentY += 10;
  }

  currentY += 5;

  // ===================== SUMMARY SECTION =====================
  const summaryWidth = 90;
  const summaryX = pageWidth - margin - summaryWidth;
  const labelX = summaryX + 3;
  const valueX = summaryX + summaryWidth - 3;

  // Sales Person on left
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Person:', margin, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.salesPersonName || 'Sales Representative', margin + 30, currentY + 5);

  // Summary rows
  doc.setLineWidth(0.3);
  
  // Sub-Total
  doc.rect(summaryX, currentY, summaryWidth, 8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Sub-Total', labelX, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(subtotal), valueX, currentY + 5, { align: 'right' });
  currentY += 8;

  // Freight
  const freightAmount = salesOrderData.freight || 0;
  doc.rect(summaryX, currentY, summaryWidth, 8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Freight', labelX, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(freightAmount), valueX, currentY + 5, { align: 'right' });
  currentY += 8;

  // Tax Total
  doc.rect(summaryX, currentY, summaryWidth, 8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Total (GST @ 18%)', labelX, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(totalTax), valueX, currentY + 5, { align: 'right' });
  currentY += 8;

  // Grand Total - Enhanced with highlighting
  const grandTotal = subtotal + freightAmount + totalTax;
  doc.setFillColor(230, 126, 34); // Orange background
  doc.rect(summaryX, currentY, summaryWidth, 12, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(summaryX, currentY, summaryWidth, 12, 'S');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('💰 GRAND TOTAL', labelX, currentY + 8);
  doc.text('Rs. ' + formatCurrency(grandTotal), valueX, currentY + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0); // Reset to black

  currentY += 20;

  // ===================== BANK DETAILS & SIGNATORY =====================
  // Bank Details Box with highlighting
  doc.setFillColor(232, 245, 232); // Light green background
  doc.rect(margin, currentY, 120, 25, 'F');
  doc.setDrawColor(39, 174, 96); // Green border
  doc.setLineWidth(1.5);
  doc.rect(margin, currentY, 120, 25, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(39, 174, 96); // Green text
  doc.text('🏦 BANK DETAILS', margin + 3, currentY + 5);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0); // Black text

  const bankDetails = salesOrderData.companyDetails.bankDetails;
  doc.text(`Bank: ${bankDetails.bankName}`, margin + 3, currentY);
  doc.text(`A/c: ${bankDetails.accountNumber}`, margin + 3, currentY + 4);
  doc.text(`Branch: ${bankDetails.branch}`, margin + 3, currentY + 8);
  doc.text(`IFSC: ${bankDetails.ifscCode}`, margin + 3, currentY + 12);

  // Authorized Signatory on right with stamp
  const sigX = pageWidth - margin - 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('For ' + salesOrderData.companyDetails.name, sigX, currentY);
  
  // Draw circular stamp representation (simple circular border for stamp)
  doc.setDrawColor(30, 60, 114); // Blue stamp color
  doc.setLineWidth(1.2);
  const stampY = currentY + 8;
  const stampRadius = 8;
  
  // Draw stamp circle with text
  doc.circle(sigX + 25, stampY + 5, stampRadius);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('SRI HM', sigX + 20, stampY + 3);
  doc.text('BITUMEN', sigX + 19, stampY + 6);
  
  doc.setFont('helvetica', 'normal');
  currentY += 18;
  doc.setDrawColor(0, 0, 0);
  doc.line(sigX, currentY, sigX + 50, currentY);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text('Authorized Signatory', sigX + 8, currentY + 5);

  currentY += 12;

  // ===================== TERMS & CONDITIONS =====================
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', margin, currentY);
  
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  const terms = [
    '1. Payment should be made within the agreed credit period.',
    '2. Late payment will attract interest @ 18% per annum.',
    '3. All disputes are subject to Guwahati jurisdiction.',
    '4. Goods once sold will not be taken back. E. & O.E.'
  ];

  terms.forEach((term) => {
    doc.text(term, margin, currentY);
    currentY += 3.5;
  });

  // ===================== FOOTER =====================
  currentY += 3;
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('This is a computer generated Sales Order. | Subject to Guwahati Jurisdiction', pageWidth / 2, currentY, { align: 'center' });

  return doc;
};

// React component for displaying sales order
interface SalesOrderTemplateProps {
  salesOrderData: SalesOrderData;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const SalesOrderTemplate: React.FC<SalesOrderTemplateProps> = ({
  salesOrderData,
  onDownload,
  onPrint
}) => {
  const handleDownload = () => {
    const doc = generateBitumenSalesOrderPDF(salesOrderData);
    doc.save(`sales-order-${salesOrderData.orderNumber}.pdf`);
    onDownload?.();
  };

  const handlePrint = () => {
    const doc = generateBitumenSalesOrderPDF(salesOrderData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    onPrint?.();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download PDF
      </button>
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Print
      </button>
    </div>
  );
};