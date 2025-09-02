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
  transportCharges?: {
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  };
}

export function generateBitumenQuotationPDF(quotationData: QuotationData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const tableWidth = pageWidth - 2 * margin;
  
  // Helper function to add text with proper encoding
  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    if (options?.align === 'center') {
      doc.text(text, x, y, { align: 'center' });
    } else if (options?.align === 'right') {
      doc.text(text, x, y, { align: 'right' });
    } else {
      doc.text(text, x, y);
    }
  };

  // Helper function for white text on colored backgrounds
  const addWhiteText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    doc.setTextColor(255, 255, 255);
    addText(text, x, y, options);
  };
  
  let currentY = margin + 5;
  
  // Company Header Section - KEEP EXACTLY THE SAME AS SAMPLE
  const headerHeight = 35;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY, tableWidth, headerHeight);

  // Company Logo - Create orange HM logo matching sample
  doc.setFillColor(255, 140, 0);
  doc.circle(margin + 15, currentY + 17, 12, 'F');
  
  // HM text in white on logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 11, currentY + 20);
  
  // Add "BITUMEN COMPANY" below logo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  addText('BITUMEN COMPANY', margin + 2, currentY + 30);

  // Company name in RED/ORANGE - EXACTLY AS IN SAMPLE
  doc.setTextColor(216, 69, 11);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', margin + 35, currentY + 12);
  
  // Company details in black - EXACTLY AS IN SAMPLE
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon', margin + 35, currentY + 18);
  addText('Mouza - Ramcharani, Guwahati, Assam - 781035', margin + 35, currentY + 22);
  addText('GST No : 18CGMPP6536N2ZG', margin + 35, currentY + 26);
  addText('Mobile No : +91 8453059698', margin + 35, currentY + 30);
  addText('Email ID : info.srihmbitumen@gmail.com', margin + 35, currentY + 34);
  
  currentY += headerHeight + 5;
  
  // Sales Order Title - centered and styled like sample
  doc.setTextColor(216, 69, 11);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('Sales Order', pageWidth/2, currentY, { align: 'center' });
  currentY += 10;

  // Row 1: Sales Order No, Date, Delivery Terms with orange headers - exact match
  const boxHeight = 15;
  const thirdWidth = tableWidth / 3;
  
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2*thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, tableWidth, boxHeight);
  doc.line(margin + thirdWidth, currentY, margin + thirdWidth, currentY + boxHeight);
  doc.line(margin + 2*thirdWidth, currentY, margin + 2*thirdWidth, currentY + boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Sales Order No.', margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Sales Order Date', margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Delivery Terms', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  currentY += boxHeight;
  
  // Values row - USE REAL DATA HERE
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
  doc.rect(margin, currentY, tableWidth, boxHeight);
  doc.line(margin + thirdWidth, currentY, margin + thirdWidth, currentY + boxHeight);
  doc.line(margin + 2*thirdWidth, currentY, margin + 2*thirdWidth, currentY + boxHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.quotationNumber, margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addText(quotationData.quotationDate.toLocaleDateString('en-GB'), margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addText(quotationData.deliveryTerms || 'Standard delivery terms', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  currentY += boxHeight;
  
  // Row 2: Payment Terms, Destination, Loading From with orange headers
  const tallBoxHeight = 25;
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2*thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.rect(margin, currentY, tableWidth, tallBoxHeight);
  doc.line(margin + thirdWidth, currentY, margin + thirdWidth, currentY + tallBoxHeight);
  doc.line(margin + 2*thirdWidth, currentY, margin + 2*thirdWidth, currentY + tallBoxHeight);
  
  addWhiteText('Payment Terms', margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Destination', margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Loading From', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  
  // Values in white sections - USE REAL DATA HERE
  doc.setFillColor(255, 255, 255);
  const valueY = currentY + boxHeight;
  const valueHeight = tallBoxHeight - boxHeight;
  doc.rect(margin, valueY, thirdWidth, valueHeight, 'F');
  doc.rect(margin + thirdWidth, valueY, thirdWidth, valueHeight, 'F');
  doc.rect(margin + 2*thirdWidth, valueY, thirdWidth, valueHeight, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.paymentTerms || '30 Days Credit. Interest will be charged', margin + 2, currentY + 17);
  addText('Day 1st Of Billing @18% P.A', margin + 2, currentY + 23);
  addText(quotationData.destination || 'Kandla', margin + thirdWidth + 2, currentY + 20);
  addText(quotationData.loadingFrom || 'Kandla', margin + 2*thirdWidth + 2, currentY + 20);
  currentY += tallBoxHeight + 2;
  
  // Bill To and Ship To sections side by side
  const halfWidth = tableWidth / 2;
  const clientSectionHeight = 50;
  
  // Bill To header
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.rect(margin, currentY, halfWidth, boxHeight);
  addWhiteText('Bill To :', margin + 2, currentY + 9);
  
  // Ship To header
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight);
  addWhiteText('Ship To :', margin + halfWidth + 2, currentY + 9);
  currentY += boxHeight;
  
  // Bill To and Ship To content - USE REAL CLIENT DATA HERE
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY, halfWidth, clientSectionHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, clientSectionHeight, 'F');
  doc.rect(margin, currentY, tableWidth, clientSectionHeight);
  doc.line(margin + halfWidth, currentY, margin + halfWidth, currentY + clientSectionHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let clientY = currentY + 6;
  addText(`Name : ${quotationData.client.name}`, margin + 2, clientY);
  addText(`Name : ${quotationData.client.name}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`GST No : ${quotationData.client.gstNumber || 'N/A'}`, margin + 2, clientY);
  addText(`GST No : ${quotationData.client.gstNumber || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Address : ${quotationData.client.address || 'N/A'}`, margin + 2, clientY);
  addText(`Address : ${quotationData.client.address || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`State : ${quotationData.client.state || 'N/A'}`, margin + 2, clientY);
  addText(`State : ${quotationData.client.state || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Pin Code : ${quotationData.client.pinCode || 'N/A'}`, margin + 2, clientY);
  addText(`Pin Code : ${quotationData.client.pinCode || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Mobile No : ${quotationData.client.mobileNumber || '0000000000'}`, margin + 2, clientY);
  addText(`Mobile No : ${quotationData.client.mobileNumber || '0000000000'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Email ID : ${quotationData.client.email || 'notavailable@email.com'}`, margin + 2, clientY);
  addText(`Email ID : ${quotationData.client.email || 'notavailable@email.com'}`, margin + halfWidth + 2, clientY);
  
  currentY += clientSectionHeight + 3;
  
  // Items table with exact layout from sample
  const headerHeightTable = 12;
  const colWidths = [80, 20, 20, 25, 30, 30, 35]; // Matching sample proportions
  let colPositions = [margin];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }
  
  // Table headers with orange background - EXACT AS SAMPLE
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, tableWidth, headerHeightTable, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, tableWidth, headerHeightTable);
  
  // Draw column separators
  colPositions.forEach(pos => {
    doc.line(pos, currentY, pos, currentY + headerHeightTable);
  });
  doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + headerHeightTable);
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addWhiteText('Item #', colPositions[0] + 2, currentY + 8);
  addWhiteText('Qty', colPositions[1] + 2, currentY + 8);
  addWhiteText('Unit', colPositions[2] + 2, currentY + 8);
  addWhiteText('Ex Factory Rate', colPositions[3] + 2, currentY + 5);
  addWhiteText('Amount (₹)', colPositions[4] + 2, currentY + 5);
  addWhiteText('GST@18% (₹)', colPositions[5] + 2, currentY + 5);
  addWhiteText('Total Amount(₹)', colPositions[6] + 2, currentY + 5);
  
  currentY += headerHeightTable;
  
  // Table data rows - USE REAL ITEM DATA HERE
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  const rowHeight = 12;
  
  // Dynamic items from quotation data
  quotationData.items.forEach((item, index) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
    
    // Draw borders for this row
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, currentY, tableWidth, rowHeight);
    colPositions.forEach(pos => {
      doc.line(pos, currentY, pos, currentY + rowHeight);
    });
    doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + rowHeight);
    
    // Split long descriptions into multiple lines
    const description = item.description;
    if (description.length > 25) {
      const words = description.split(' ');
      const midPoint = Math.ceil(words.length / 2);
      addText(words.slice(0, midPoint).join(' '), colPositions[0] + 2, currentY + 5);
      addText(words.slice(midPoint).join(' '), colPositions[0] + 2, currentY + 9);
    } else {
      addText(description, colPositions[0] + 2, currentY + 7);
    }
    
    addText(item.quantity.toString(), colPositions[1] + 2, currentY + 7);
    addText(item.unit, colPositions[2] + 2, currentY + 7);
    addText(item.rate.toFixed(0), colPositions[3] + 2, currentY + 7);
    addText(item.amount.toFixed(0), colPositions[4] + 2, currentY + 7);
    addText((item.gstAmount || item.amount * 0.18).toFixed(0), colPositions[5] + 2, currentY + 7);
    addText(item.totalAmount.toFixed(0), colPositions[6] + 2, currentY + 7);
    
    currentY += rowHeight;
  });

  // Transport charges section if available
  if (quotationData.transportCharges) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
    
    // Draw borders for transport row
    doc.rect(margin, currentY, tableWidth, rowHeight);
    colPositions.forEach(pos => {
      doc.line(pos, currentY, pos, currentY + rowHeight);
    });
    doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + rowHeight);
    
    addText('Transport Charges', colPositions[0] + 2, currentY + 7);
    addText(quotationData.transportCharges.quantity.toString(), colPositions[1] + 2, currentY + 7);
    addText(quotationData.transportCharges.unit, colPositions[2] + 2, currentY + 7);
    addText(quotationData.transportCharges.rate.toFixed(0), colPositions[3] + 2, currentY + 7);
    addText(quotationData.transportCharges.amount.toFixed(0), colPositions[4] + 2, currentY + 7);
    // Leave GST and total blank for transport
    
    currentY += rowHeight + 2;
  }

  // Sales Person Name and Totals section - side by side layout
  const leftSectionWidth = tableWidth * 0.6;
  const rightSectionWidth = tableWidth * 0.4;
  const rightSectionX = margin + leftSectionWidth;
  
  // Sales Person Name section - left side
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  addWhiteText('Sales Person Name:', margin + 2, currentY + 9);
  
  // SubTotal header - right side
  doc.setFillColor(216, 69, 11);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addWhiteText('SubTotal', rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Sales Person value - USE REAL DATA
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, boxHeight);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.salesPersonName || 'System Administrator', margin + 2, currentY + 9);
  
  // SubTotal value - USE REAL DATA
  doc.setFillColor(255, 255, 255);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addText(quotationData.subtotal.toFixed(0), rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Description header
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, boxHeight);
  addWhiteText('Description :', margin + 2, currentY + 9);
  
  // Freight header
  doc.setFillColor(216, 69, 11);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addWhiteText('Freight', rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Description content - left side - KEEP SAME AS SAMPLE
  const descriptionHeight = 25;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftSectionWidth, descriptionHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, descriptionHeight);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  addText('Note- Above Payment terms Not included in Transportation. Transportation payment', margin + 2, currentY + 8);
  addText('should be made on before unloading.', margin + 2, currentY + 15);
  
  // Freight value - USE REAL DATA
  doc.setFillColor(255, 255, 255);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addText((quotationData.freight || 0).toFixed(0), rightSectionX + 2, currentY + 9);
  currentY += Math.max(descriptionHeight, boxHeight);
  
  // Total header and value
  doc.setFillColor(216, 69, 11);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Total', rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.total.toFixed(0), rightSectionX + 2, currentY + 9);
  currentY += boxHeight + 5;

  // Terms and Bank Details section with orange headers - KEEP SAME AS SAMPLE
  const leftTermsWidth = tableWidth * 0.65;
  const rightBankWidth = tableWidth * 0.35;
  const rightBankX = margin + leftTermsWidth;
  
  // Terms and Conditions header
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, leftTermsWidth, boxHeight, 'F');
  doc.rect(margin, currentY, leftTermsWidth, boxHeight);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  addWhiteText('Terms and Conditions', margin + 2, currentY + 9);
  
  // Bank Details header
  doc.setFillColor(216, 69, 11);
  doc.rect(rightBankX, currentY, rightBankWidth, boxHeight, 'F');
  doc.rect(rightBankX, currentY, rightBankWidth, boxHeight);
  addWhiteText('Bank Details', rightBankX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Terms and Conditions content - KEEP SAME AS SAMPLE
  const termsHeight = 50;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftTermsWidth, termsHeight, 'F');
  doc.rect(margin, currentY, leftTermsWidth, termsHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  addText('- Payment Should be made within One of the Day of Billing.', margin + 2, currentY + 8);
  addText('- Incase Of Late Payment, Credit Limit will be Reduced by 10%.', margin + 2, currentY + 14);
  addText('- After the Payment of Interest to Late. Interest of 24% per annum i.e 2% per month', margin + 2, currentY + 20);
  addText('  would be charged on due amount.', margin + 2, currentY + 26);
  addText('- All Goverment Tax, Duty payment of bills must be charged "A/C Payee Only" and Drawn in Favour of', margin + 2, currentY + 32);
  addText('  "M/s SRI HM BITUMEN CO" Only.', margin + 2, currentY + 38);
  addText('- Subject to Guwahati Jurisdiction Only.', margin + 2, currentY + 44);
  
  // Bank Details content - KEEP SAME AS SAMPLE
  doc.setFillColor(255, 255, 255);
  doc.rect(rightBankX, currentY, rightBankWidth, termsHeight, 'F');
  doc.rect(rightBankX, currentY, rightBankWidth, termsHeight);
  
  addText('Bank Name : State Bank of India', rightBankX + 2, currentY + 8);
  addText('Account No. : 40464693538', rightBankX + 2, currentY + 14);
  addText('Branch : Paltan Bazar', rightBankX + 2, currentY + 20);
  addText('IFSC Code : SBIN0040464', rightBankX + 2, currentY + 26);
  
  // Save and download
  const fileName = `Sales_Order_${quotationData.quotationNumber.replace(/[\/\\]/g, '_')}.pdf`;
  doc.save(fileName);
}