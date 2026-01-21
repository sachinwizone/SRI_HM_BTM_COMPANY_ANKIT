import jsPDF from 'jspdf';

interface QuotationData {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  client: {
    id: string;
    name: string;
    gstNumber?: string;
    address?: string;
    state?: string;
    pinCode?: string;
    mobileNumber?: string;
    email?: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    gstAmount?: number;
    totalAmount: number;
    isFreight?: boolean;
    gstRate?: number;
  }>;
  subtotal: number;
  gstAmount: number;
  total: number;
  validityPeriod: number;
  termsAndConditions?: string;
  salesPersonName?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  destination?: string;
  loadingFrom?: string;
  freight?: number;
  freightCharged?: number;
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
}

export const generateBitumenQuotationPDF = async (quotationData: QuotationData) => {
  try {
    const doc = new jsPDF();
    
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
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let currentY = 10;

    // Colors - Clean professional colors
    const orangeColor: [number, number, number] = [230, 126, 34];
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
    // Draw "Shri" symbol and HM text
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
    doc.text('M/S SRI HM BITUMEN CO', margin + 45, currentY + 8);

    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const addressLine = 'Dag No: 1071, Patta No: 264, Guwahati, Assam 781035';
    doc.text(addressLine, margin + 45, currentY + 14);
    doc.text('GSTIN/UIN: 18CGMPP6536N2ZG', margin + 45, currentY + 19);
    doc.text('Mobile: +91 8453059698 | Email: info.srihmbitumen@gmail.com', margin + 45, currentY + 24);

    currentY += 32;

    // ===================== QUOTATION TITLE =====================
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += 8;
    doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 5;
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 5;

    // ===================== QUOTATION INFO TABLE =====================
    const infoTableWidth = pageWidth - 2 * margin;
    const col1Width = infoTableWidth * 0.30;
    const col2Width = infoTableWidth * 0.20;
    const col3Width = infoTableWidth * 0.25;
    const col4Width = infoTableWidth * 0.25;

    const quotationDate = quotationData.quotationDate ? new Date(quotationData.quotationDate).toLocaleDateString('en-GB') : 'N/A';
    const validityDate = quotationData.quotationDate ? new Date(new Date(quotationData.quotationDate).getTime() + quotationData.validityPeriod * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') : 'N/A';

    // Headers with orange background
    doc.setFillColor(230, 126, 34);
    doc.rect(margin, currentY, col1Width, 8, 'F');
    doc.rect(margin + col1Width, currentY, col2Width, 8, 'F');
    doc.rect(margin + col1Width + col2Width, currentY, col3Width, 8, 'F');
    doc.rect(margin + col1Width + col2Width + col3Width, currentY, col4Width, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation No', margin + 2, currentY + 6);
    doc.text('Quotation Date', margin + col1Width + 2, currentY + 6);
    doc.text('Delivery Terms', margin + col1Width + col2Width + 2, currentY + 6);
    doc.text('Validity', margin + col1Width + col2Width + col3Width + 2, currentY + 6);

    currentY += 8;

    // Values
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.rect(margin, currentY, col1Width, 8);
    doc.rect(margin + col1Width, currentY, col2Width, 8);
    doc.rect(margin + col1Width + col2Width, currentY, col3Width, 8);
    doc.rect(margin + col1Width + col2Width + col3Width, currentY, col4Width, 8);

    doc.text(quotationData.quotationNumber || 'N/A', margin + 2, currentY + 6);
    doc.text(quotationDate, margin + col1Width + 2, currentY + 6);
    doc.text(quotationData.deliveryTerms || 'Within 15-20 Days', margin + col1Width + col2Width + 2, currentY + 6);
    doc.text(validityDate, margin + col1Width + col2Width + col3Width + 2, currentY + 6);

    currentY += 10;

    // ===================== BILL TO / SHIP TO SECTION =====================
    const partyWidth = (infoTableWidth - 2) / 2;
    
    // Headers
    doc.setFillColor(230, 126, 34);
    doc.rect(margin, currentY, partyWidth, 8, 'F');
    doc.rect(margin + partyWidth + 2, currentY, partyWidth, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To :', margin + 2, currentY + 6);
    doc.text('Ship To :', margin + partyWidth + 4, currentY + 6);

    currentY += 8;

    // Content boxes
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, partyWidth, 35, 'F');
    doc.rect(margin + partyWidth + 2, currentY, partyWidth, 35, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const clientDetails = [
      `Name: ${quotationData.client.name || 'N/A'}`,
      `GST: ${quotationData.client.gstNumber || 'N/A'}`,
      `Address: ${quotationData.client.address || 'N/A'}`,
      `State: ${quotationData.client.state || 'N/A'}`,
      `Pin: ${quotationData.client.pinCode || 'N/A'}`
    ];

    let detailY = currentY + 3;
    clientDetails.forEach(detail => {
      doc.text(detail, margin + 2, detailY);
      doc.text(detail, margin + partyWidth + 4, detailY);
      detailY += 6;
    });

    currentY += 37;

    // ===================== ITEMS TABLE =====================
    const tableHeaders = ['Item #', 'Description', 'Qty', 'Unit', 'Ex Factory Rate(₹)', 'Amount(₹)', 'GST@18%(₹)', 'Total Amount(₹)'];
    const colWidths = [12, 45, 12, 12, 18, 18, 18, 18];
    
    let colX = margin;
    const colPositions = [colX];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colX += colWidths[i];
      colPositions.push(colX);
    }

    // Table headers
    doc.setFillColor(230, 126, 34);
    doc.rect(margin, currentY, infoTableWidth, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    tableHeaders.forEach((header, i) => {
      doc.text(header, colPositions[i] + 1, currentY + 6);
    });

    currentY += 8;

    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    quotationData.items?.forEach((item, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, currentY, infoTableWidth, 8, 'F');
      }

      // Draw borders
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, currentY, infoTableWidth, 8);

      // Add text
      doc.setTextColor(0, 0, 0);
      doc.text((index + 1).toString(), colPositions[0] + 1, currentY + 6);
      doc.text(item.description || 'N/A', colPositions[1] + 1, currentY + 6);
      doc.text(item.quantity.toString(), colPositions[2] + 1, currentY + 6);
      doc.text(item.unit || 'N/A', colPositions[3] + 1, currentY + 6);
      doc.text(formatCurrency(item.rate), colPositions[4] + 1, currentY + 6);
      doc.text(formatCurrency(item.amount), colPositions[5] + 1, currentY + 6);
      
      const gstAmount = item.gstRate === 0 ? 0 : (item.gstAmount || 0);
      doc.text(formatCurrency(gstAmount), colPositions[6] + 1, currentY + 6);
      doc.text(formatCurrency(item.totalAmount), colPositions[7] + 1, currentY + 6);

      currentY += 8;
    });

    currentY += 5;

    // ===================== BANK DETAILS =====================
    doc.setFillColor(39, 174, 96);
    doc.rect(margin, currentY, 80, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('🏦 BANK DETAILS', margin + 2, currentY + 6);

    currentY += 8;
    
    doc.setFillColor(240, 250, 240);
    doc.rect(margin, currentY, 80, 20, 'F');
    doc.rect(margin, currentY, 80, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    doc.text('Bank: State Bank of India', margin + 2, currentY + 4);
    doc.text('A/c: 40464693538', margin + 2, currentY + 9);
    doc.text('Branch: Paltan Bazar', margin + 2, currentY + 14);
    doc.text('IFSC: SBIN0040464', margin + 2, currentY + 19);

    // ===================== TOTALS (RIGHT SIDE) =====================
    const summaryX = margin + 100;
    const summaryWidth = pageWidth - 2 * margin - 100;
    let summaryY = currentY;

    const nonFreightItems = quotationData.items?.filter(item => !item.isFreight) || [];
    const freightItems = quotationData.items?.filter(item => item.isFreight) || [];
    
    const productSubtotal = nonFreightItems.reduce((sum, item) => sum + item.amount, 0);
    const taxTotal = nonFreightItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
    const freightTotal = freightItems.reduce((sum, item) => sum + item.amount, 0);
    const grandTotal = (quotationData.total || 0);

    const summaryItems = [
      { label: 'Sub-Total', value: productSubtotal },
      { label: 'Tax (18% GST)', value: taxTotal },
      { label: 'Freight (Non-GST)', value: freightTotal },
      { label: 'Grand Total', value: grandTotal, isBold: true }
    ];

    summaryItems.forEach((item) => {
      if (item.isBold) {
        doc.setFillColor(230, 126, 34);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFillColor(245, 245, 245);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      doc.rect(summaryX, summaryY, summaryWidth, 7, 'F');
      doc.rect(summaryX, summaryY, summaryWidth, 7);
      doc.setFontSize(9);
      doc.text(item.label, summaryX + 2, summaryY + 5);
      // Format: ₹ 12,34,567.89
      const formattedAmount = `₹ ${formatCurrency(item.value)}`;
      doc.text(formattedAmount, summaryX + summaryWidth - 3, summaryY + 5, { align: 'right' });

      summaryY += 7;
    });

    currentY = Math.max(currentY + 25, summaryY + 3);

    // ===================== SIGNATURE SECTION =====================
    currentY += 5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Sales Person: ${quotationData.salesPersonName || 'System Administrator'}`, margin, currentY);

    // Authorized Signatory on right with stamp
    const sigX = pageWidth - margin - 55;
    doc.text('For M/S SRI HM BITUMEN CO', sigX, currentY);
    
    currentY += 8;
    
    // Stamp image - load and embed if available
    const stampY = currentY;
    if (stampBase64) {
      try {
        doc.addImage(stampBase64, 'PNG', sigX - 5, stampY, 35, 35);
      } catch (err) {
        console.error('Failed to add stamp image:', err);
      }
    }

    currentY += 38;
    doc.setLineWidth(0.3);
    doc.line(sigX, currentY, sigX + 50, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Authorized Signatory', sigX + 8, currentY + 5);

    // Save PDF
    const fileName = `Quotation_${(quotationData.quotationNumber || 'UNKNOWN').replace(/[\/\\]/g, '_')}.pdf`;
    doc.save(fileName);

    return doc;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
