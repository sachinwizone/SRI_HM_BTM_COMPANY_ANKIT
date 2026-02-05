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

export const generateBitumenSalesOrderPDF = async (salesOrderData: SalesOrderData) => {
  const doc = new jsPDF();
  
  // Load company logo as base64
  let logoBase64 = '';
  try {
    const logoResponse = await fetch('/logo.jpg');
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
    }
  } catch (err) {
    console.error('Failed to load logo:', err);
  }
  
  // Load stamp image as base64
  let stampBase64 = '';
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
  
  // Page setup - optimized for single page
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 6; // Further reduced from 8
  let currentY = 6; // Further reduced from 8

  // Colors - Match the company logo colors
  const orangeColor: [number, number, number] = [230, 126, 34]; // #E67E22
  const darkOrangeColor: [number, number, number] = [211, 84, 0]; // #D35400
  const blackColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [102, 102, 102]; // #666
  const lightGrayColor: [number, number, number] = [136, 136, 136]; // #888
  const borderColor: [number, number, number] = [0, 0, 0];

  // Format currency in Indian format
  const formatCurrency = (amount: number): string => {
    // First ensure we have exactly 2 decimal places without rounding issues
    const fixed = parseFloat(amount).toFixed(2);
    // Then format with Indian locale
    return parseFloat(fixed).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Draw page border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');

  currentY = 8; // Further reduced from 12

  // ===================== HEADER SECTION =====================
  // Add company logo on the left - smaller size
  const logoSize = 16; // Further reduced from 20
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin + 5, currentY, logoSize, logoSize);
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
      // Fallback to text if logo fails
      doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Shri', margin + 5, currentY + 5);
      doc.setFontSize(20);
      doc.text('HM', margin + 5, currentY + 14);
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text('BITUMEN COMPANY', margin + 3, currentY + 20);
    }
  } else {
    // Fallback text logo if image not loaded
    doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Shri', margin + 5, currentY + 5);
    doc.setFontSize(20);
    doc.text('HM', margin + 5, currentY + 14);
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('BITUMEN COMPANY', margin + 3, currentY + 20);
  }

  // Company Name and Details (right side) - Match logo colors
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setFontSize(12); // Further reduced from 14
  doc.setFont('helvetica', 'bold');
  doc.text(salesOrderData.companyDetails.name, margin + 30, currentY + 4); // Adjusted positioning

  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFontSize(6); // Further reduced from 7
  doc.setFont('helvetica', 'normal');
  
  const addressLine = salesOrderData.companyDetails.address.replace(/\n/g, ', ');
  doc.text(addressLine, margin + 30, currentY + 8); // Adjusted positioning
  doc.text(`GSTIN/UIN: ${salesOrderData.companyDetails.gstNumber}`, margin + 30, currentY + 11);
  doc.text(`Mobile: ${salesOrderData.companyDetails.mobile} | Email: ${salesOrderData.companyDetails.email}`, margin + 30, currentY + 14);

  currentY += 18; // Further reduced from 26

  // ===================== SALES ORDER TITLE =====================
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 3; // Further reduced from 6
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  doc.setFontSize(10); // Further reduced from 12
  doc.setFont('helvetica', 'bold');
  doc.text('SALES ORDER', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 2; // Further reduced from 4
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 2; // Further reduced from 4

  // ===================== ORDER INFO TABLE =====================
  const infoTableWidth = pageWidth - 2 * margin;
  // Wider columns for Order No and Date to avoid overlap
  const col1Width = infoTableWidth * 0.30; // Order No column - 30%
  const col2Width = infoTableWidth * 0.20; // Date column - 20%
  const col3Width = infoTableWidth * 0.25; // Delivery column - 25%
  const col4Width = infoTableWidth * 0.25; // Payment column - 25%

  doc.setFontSize(7); // Further reduced font size
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);

  // Row 1 - reduced height
  doc.rect(margin, currentY, col1Width, 5, 'S'); // Further reduced from 7
  doc.rect(margin + col1Width, currentY, col2Width, 5, 'S');
  doc.rect(margin + col1Width + col2Width, currentY, col3Width, 5, 'S');
  doc.rect(margin + col1Width + col2Width + col3Width, currentY, col4Width, 5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.text('Order No:', margin + 2, currentY + 3.5); // Adjusted for smaller box
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.orderNumber, margin + 22, currentY + 3.5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin + col1Width + 2, currentY + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.orderDate.toLocaleDateString('en-GB'), margin + col1Width + 14, currentY + 3.5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery:', margin + col1Width + col2Width + 2, currentY + 3.5);
  doc.setFont('helvetica', 'normal');
  const deliveryText = (salesOrderData.deliveryTerms || '').substring(0, 20);
  doc.text(deliveryText, margin + col1Width + col2Width + 22, currentY + 3.5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Payment:', margin + col1Width + col2Width + col3Width + 2, currentY + 3.5);
  doc.setFont('helvetica', 'normal');
  const paymentText = (salesOrderData.paymentTerms || '30 Days Credit').substring(0, 16);
  doc.text(paymentText, margin + col1Width + col2Width + col3Width + 22, currentY + 3.5);

  currentY += 5; // Further reduced from 6

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
  doc.setFontSize(8); // Further reduced from 9
  doc.text('Bill To :', margin + 2, currentY + 3); // Further reduced spacing
  doc.text('Ship To :', margin + sectionWidth + 2, currentY + 3);
  
  doc.rect(margin, currentY, sectionWidth, 30, 'S'); // Further reduced from 42
  doc.rect(margin + sectionWidth, currentY, sectionWidth, 30, 'S'); // Further reduced from 42

  currentY += 4; // Further reduced from 6
  doc.setFontSize(6); // Further reduced from 7
  doc.setFont('helvetica', 'normal');
  
  // Helper function to split long text
  const splitText = (text: string, maxLength: number): string[] => {
    if (text.length <= maxLength) return [text];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  const clientInfo = [
    { label: 'Name :', value: salesOrderData.client.name || '', isName: true },
    { label: 'GST No :', value: salesOrderData.client.gstNumber || '', isName: false },
    { label: 'Address :', value: salesOrderData.client.address || '', isName: false },
    { label: 'State :', value: salesOrderData.client.state || '', isName: false },
    { label: 'Pin Code :', value: salesOrderData.client.pinCode || '', isName: false },
    { label: 'Mobile No :', value: salesOrderData.client.mobileNumber || '', isName: false },
    { label: 'Email ID :', value: salesOrderData.client.email || '', isName: false }
  ];

  let yOffset = 0;
  clientInfo.forEach((info, index) => {
    const y = currentY + yOffset;
    
    // Determine max characters per line for this field
    const maxChars = info.label === 'Address :' ? 28 : 35;
    const textLines = splitText(info.value, maxChars);
    
    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.text(info.label, margin + 2, y);
    
    // Handle text display for Bill To
    textLines.forEach((line, lineIndex) => {
      const lineY = y + (lineIndex * 2.5); // Further reduced from 3
      
      if (info.isName && lineIndex === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin + 22, lineY - 2, sectionWidth - 24, 2.5, 'F'); // Further reduced height
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7); // Further reduced from 8
        doc.setTextColor(44, 62, 80);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6); // Further reduced from 7
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, margin + 22, lineY);
    });
    
    // Ship To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6); // Further reduced from 7
    doc.setTextColor(0, 0, 0);
    doc.text(info.label, margin + sectionWidth + 2, y);
    
    // Handle text display for Ship To
    textLines.forEach((line, lineIndex) => {
      const lineY = y + (lineIndex * 2.5); // Further reduced from 3
      
      if (info.isName && lineIndex === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin + sectionWidth + 22, lineY - 2, sectionWidth - 24, 2.5, 'F'); // Further reduced height
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7); // Further reduced from 8
        doc.setTextColor(44, 62, 80);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6); // Further reduced from 7
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, margin + sectionWidth + 22, lineY);
    });
    
    // Adjust yOffset based on number of lines (minimum 3 for consistent spacing)
    yOffset += Math.max(textLines.length * 2.5, 3); // Further reduced from 4
  });

  currentY += 32; // Further reduced from 44

  // ===================== ITEMS TABLE =====================
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = [25, 15, 15, 25, 25, 25, 25]; // Item #, Qty, Unit, Ex Factory Rate, Amount(₹), GST@18%(₹), Total Amount(₹)
  const headers = ['Item #', 'Qty', 'Unit', 'Ex Factory Rate', 'Amount(₹)', 'GST@18%(₹)', 'Total Amount(₹)'];
  
  // Table Header
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  
  let colX = margin;
  headers.forEach((header, i) => {
    doc.rect(colX, currentY, colWidths[i], 5, 'S'); // Further reduced from 6
    doc.setFontSize(7); // Further reduced from 8
    doc.setFont('helvetica', 'bold');
    doc.text(header, colX + colWidths[i] / 2, currentY + 3.5, { align: 'center' }); // Adjusted position
    colX += colWidths[i];
  });

  currentY += 5; // Further reduced from 6
  const tableStartY = currentY;

  // Table Content
  doc.setFont('helvetica', 'bold'); // Make all content bold
  doc.setFontSize(7); // Further reduced from 8

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
      doc.rect(colX, currentY, width, 6, 'S'); // Further reduced from 8
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
      doc.text(data, colX + colWidths[i] / 2, currentY + 4, { align: 'center' }); // Adjusted position
      colX += colWidths[i];
    });

    currentY += 6; // Further reduced from 8
  });

  // Empty rows if needed (minimum 3 rows)
  const minRows = 3;
  const currentRows = salesOrderData.items.length;
  for (let i = currentRows; i < minRows; i++) {
    colX = margin;
    colWidths.forEach((width) => {
      doc.rect(colX, currentY, width, 6, 'S'); // Further reduced from 8
      colX += width;
    });
    currentY += 6; // Further reduced from 8
  }

  currentY += 2; // Further reduced from 3

  // ===================== SUMMARY SECTION =====================
  const summaryWidth = 90;
  const summaryX = pageWidth - margin - summaryWidth;
  const labelX = summaryX + 3;
  const valueX = summaryX + summaryWidth - 3;

  // Sales Person on left
  doc.setFontSize(7); // Further reduced from 8
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Person:', margin, currentY + 3); // Further adjusted position
  doc.setFont('helvetica', 'normal');
  doc.text(salesOrderData.salesPersonName || 'Sales Representative', margin + 30, currentY + 3);

  // Summary rows
  doc.setLineWidth(0.3);
  
  // Sub-Total
  doc.rect(summaryX, currentY, summaryWidth, 5, 'S'); // Further reduced from 6
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6); // Further reduced from 7
  doc.text('Sub-Total', labelX, currentY + 3.5); // Further adjusted position
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(subtotal), valueX, currentY + 3.5, { align: 'right' }); // Further adjusted position
  currentY += 5; // Further reduced from 6

  // Freight
  const freightAmount = salesOrderData.freight || 0;
  doc.rect(summaryX, currentY, summaryWidth, 5, 'S'); // Further reduced from 6
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6); // Further reduced font size
  doc.text('Freight', labelX, currentY + 3.5); // Further adjusted position
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(freightAmount), valueX, currentY + 3.5, { align: 'right' }); // Further adjusted position
  currentY += 5; // Further reduced from 6

  // Tax Total
  doc.rect(summaryX, currentY, summaryWidth, 5, 'S'); // Further reduced from 6
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6); // Further reduced font size
  doc.text('Tax Total (GST @ 18%)', labelX, currentY + 3.5); // Further adjusted position
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + formatCurrency(totalTax), valueX, currentY + 3.5, { align: 'right' }); // Further adjusted position
  currentY += 5; // Further reduced from 6

  // Grand Total - Enhanced with highlighting
  const grandTotal = subtotal + freightAmount + totalTax;
  doc.setFillColor(230, 126, 34); // Orange background
  doc.rect(summaryX, currentY, summaryWidth, 8, 'F'); // Further reduced from 10
  doc.setDrawColor(0, 0, 0);
  doc.rect(summaryX, currentY, summaryWidth, 8, 'S'); // Further reduced from 10
  doc.setFontSize(8); // Further reduced from 9
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('GRAND TOTAL', labelX, currentY + 5); // Further adjusted position, removed emoji
  doc.text('Rs. ' + formatCurrency(grandTotal), valueX, currentY + 5, { align: 'right' }); // Further adjusted position
  doc.setTextColor(0, 0, 0); // Reset to black

  currentY += 10; // Further reduced from 14

  // ===================== BANK DETAILS & SIGNATORY =====================
  // Bank Details Box with highlighting
  doc.setFillColor(232, 245, 232); // Light green background
  doc.rect(margin, currentY, 120, 15, 'F'); // Further reduced from 20
  doc.setDrawColor(39, 174, 96); // Green border
  doc.setLineWidth(1.5);
  doc.rect(margin, currentY, 120, 15, 'S'); // Match fill height
  
  doc.setFontSize(7); // Further reduced from 8
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(39, 174, 96); // Green text
  doc.text('BANK DETAILS', margin + 3, currentY + 3); // Further adjusted position
  
  currentY += 4; // Further reduced from 6
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6); // Further reduced from 7
  doc.setTextColor(0, 0, 0); // Black text

  const bankDetails = salesOrderData.companyDetails.bankDetails;
  doc.text(`Bank: ${bankDetails.bankName}`, margin + 3, currentY);
  doc.text(`A/c: ${bankDetails.accountNumber}`, margin + 3, currentY + 2.5); // Further reduced spacing
  doc.text(`Branch: ${bankDetails.branch}`, margin + 3, currentY + 5); // Further reduced spacing
  doc.text(`IFSC: ${bankDetails.ifscCode}`, margin + 3, currentY + 7.5); // Further reduced spacing

  // Authorized Signatory on right with stamp
  const sigX = pageWidth - margin - 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6); // Further reduced from 7
  doc.text('For ' + salesOrderData.companyDetails.name, sigX, currentY);
  
  // Space for stamp image - load and embed if available
  const stampY = currentY + 2; // Further reduced spacing
  if (stampBase64) {
    try {
      doc.addImage(stampBase64, 'PNG', sigX - 5, stampY, 20, 20); // Further reduced from 25x25
    } catch (err) {
      console.error('Failed to add stamp image:', err);
    }
  }
  
  currentY += 12; // Further reduced from 16
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(sigX, currentY, sigX + 50, currentY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6); // Further reduced from 7
  doc.text('Authorized Signatory', sigX + 8, currentY + 3); // Further adjusted position

  currentY += 5; // Further reduced from 8

  // ===================== CUSTOMER SEAL AND SIGN SECTION =====================
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 4; // Add spacing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('CUSTOMER SEAL AND SIGN', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 20; // Add space for customer to sign/seal

  // ===================== TERMS & CONDITIONS =====================
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 2; // Further reduced from 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6); // Further reduced from 7
  doc.text('Terms & Conditions:', margin, currentY);
  
  currentY += 2; // Further reduced from 3
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5); // Further reduced from 6

  const terms = [
    '1. Payment should be made within the agreed credit period.',
    '2. Late payment will attract interest @ 18% per annum.',
    '3. All disputes are subject to Guwahati jurisdiction.',
    '4. Goods once sold will not be taken back. E. & O.E.'
  ];

  terms.forEach((term) => {
    doc.text(term, margin, currentY);
    currentY += 2; // Further reduced from 2.5
  });

  // ===================== FOOTER =====================
  currentY += 1; // Further reduced from 2
  doc.setFontSize(5); // Further reduced from 6
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
  const handleDownload = async () => {
    const doc = await generateBitumenSalesOrderPDF(salesOrderData);
    doc.save(`sales-order-${salesOrderData.orderNumber}.pdf`);
    onDownload?.();
  };

  const handlePrint = async () => {
    const doc = await generateBitumenSalesOrderPDF(salesOrderData);
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