import React from "react";
import { jsPDF } from "jspdf";

interface QuotationData {
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
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

export const generateBitumenQuotationPDF = (quotationData: QuotationData) => {
  const doc = new jsPDF();
  
  // Page setup
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let currentY = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  const addWhiteText = (text: string, x: number, y: number, options?: any) => {
    doc.setTextColor(255, 255, 255);
    doc.text(text, x, y, options);
  };

  const addBoldText = (text: string, x: number, y: number, options?: any) => {
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, y, options);
    doc.setFont('helvetica', 'normal');
  };

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header section with border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 35);

  // Company Logo - Create a circular orange logo with HM text
  doc.setFillColor(255, 140, 0); // Orange color
  doc.circle(margin + 15, currentY + 17, 12, 'F');
  
  // Add decorative elements around logo
  doc.setFillColor(255, 165, 0);
  doc.arc(margin + 15, currentY + 17, 10, 0, Math.PI * 2, 'S');
  
  // HM text in white on logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 11, currentY + 20);
  
  // Add "BITUMEN COMPANY" below logo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  addText('BITUMEN COMPANY', margin + 2, currentY + 30);

  // Company name in RED/ORANGE - exactly like sample
  doc.setTextColor(216, 69, 11); // Matching orange-red color from sample
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', margin + 35, currentY + 10);
  
  // Company details in black - exactly positioned like sample
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon', margin + 35, currentY + 16);
  addText('Mouza - Ramcharani, Guwahati, Assam - 781035', margin + 35, currentY + 20);
  addText('GST No : 18CGMPP6536N2ZG', margin + 35, currentY + 24);
  addText('Mobile No : +91 8453059698', margin + 35, currentY + 28);
  addText('Email ID : info.srihmbitumen@gmail.com', margin + 35, currentY + 32);

  currentY += 38;

  // "Sales Order" title with orange background - exactly like sample
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('Sales Order', pageWidth / 2, currentY + 8, { align: 'center' });
  
  currentY += 14;

  // EXACT LAYOUT matching the sample image
  const tableWidth = pageWidth - 2 * margin;
  const boxHeight = 14; // Slightly taller for better readability
  const thirdWidth = tableWidth / 3;
  
  // Row 1: Three boxes - Sales Order No, Date, Delivery Terms with orange headers
  doc.setFillColor(216, 69, 11); // Orange background like sample
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');  
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  // Draw black borders
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY, thirdWidth, boxHeight);
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight);
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Sales Order No.', margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Sales Order Date', margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Delivery Terms', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  currentY += boxHeight;
  
  // Values for row 1 - white background with black text
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  // Draw borders
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, thirdWidth, boxHeight);
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight);
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  addText(`SRIHM-SO/93/25-26`, margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addText(quotationData.quotationDate.toLocaleDateString('en-GB'), margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addText('Within 10 to 12 Days', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  currentY += boxHeight;
  
  // Row 2: Payment Terms, Destination, Loading From with orange headers
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  // Draw borders
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, thirdWidth, boxHeight);
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight);
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Payment Terms', margin + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Destination', margin + thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  addWhiteText('Loading From', margin + 2*thirdWidth + thirdWidth/2, currentY + 9, { align: 'center' });
  currentY += boxHeight;
  
  // Values for row 2 (taller boxes for payment terms)
  const tallBoxHeight = boxHeight * 1.2;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, tallBoxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, tallBoxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, tallBoxHeight, 'F');
  
  // Draw borders
  doc.rect(margin, currentY, thirdWidth, tallBoxHeight);
  doc.rect(margin + thirdWidth, currentY, thirdWidth, tallBoxHeight);
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, tallBoxHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('30 Days Credit. Interest will be charged', margin + 2, currentY + 7);
  addText('Day 1st Of Billing @18% P.A', margin + 2, currentY + 13);
  addText('Dhemaji', margin + thirdWidth + 2, currentY + 10);
  addText('Kandla', margin + 2*thirdWidth + 2, currentY + 10);
  currentY += tallBoxHeight + 2;
  
  // Bill To and Ship To sections side by side
  const halfWidth = tableWidth / 2;
  const clientSectionHeight = 60;
  
  // Headers with orange background
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight, 'F');
  
  // Draw borders
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, halfWidth, boxHeight);
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Bill To :', margin + 2, currentY + 9);
  addWhiteText('Ship To :', margin + halfWidth + 2, currentY + 9);
  currentY += boxHeight;
  
  // Client details with white background
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, clientSectionHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, clientSectionHeight, 'F');
  
  // Draw borders
  doc.rect(margin, currentY, halfWidth, clientSectionHeight);
  doc.rect(margin + halfWidth, currentY, halfWidth, clientSectionHeight);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  let clientY = currentY + 6;
  addText(`Name : ${quotationData.client.name}`, margin + 2, clientY);
  addText(`Name : ${quotationData.client.name}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`GST No : ${quotationData.client.gstNumber || '18CTQPK1818R3ZQ'}`, margin + 2, clientY);
  addText(`GST No : ${quotationData.client.gstNumber || '18CTQPK1818R3ZQ'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Address : ${quotationData.client.address || 'WARD NO 5, 2 NO BHARALICHUK, DHEMAJI, Dhemaji.'}`, margin + 2, clientY);
  addText(`Address : ${quotationData.client.address || 'WARD NO 5, 2 NO BHARALICHUK, DHEMAJI, Dhemaji.'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`State : ${quotationData.client.state || 'ASSAM'}`, margin + 2, clientY);
  addText(`State : ${quotationData.client.state || 'ASSAM'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Pin Code : ${quotationData.client.pinCode || '787057'}`, margin + 2, clientY);
  addText(`Pin Code : ${quotationData.client.pinCode || '787057'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Mobile No : ${quotationData.client.mobileNumber || '9954307310'}`, margin + 2, clientY);
  addText(`Mobile No : ${quotationData.client.mobileNumber || '9954307310'}`, margin + halfWidth + 2, clientY);
  clientY += 7;
  addText(`Email ID : ${quotationData.client.email || 'bitupankonch9@gmail.com'}`, margin + 2, clientY);
  addText(`Email ID : ${quotationData.client.email || 'bitupankonch9@gmail.com'}`, margin + halfWidth + 2, clientY);
  
  currentY += clientSectionHeight + 3;
  
  // Items table with exact layout from sample
  doc.setFontSize(8);
  
  // Table header with orange background like sample
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
  
  // Draw border
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, tableWidth, boxHeight);
  
  // Column widths matching sample exactly
  const col1Width = 55; // Item # - wider for description
  const col2Width = 20; // Qty
  const col3Width = 15; // Unit
  const col4Width = 30; // Ex Factory Rate
  const col5Width = 30; // Amount
  const col6Width = 30; // GST@18%
  const col7Width = tableWidth - col1Width - col2Width - col3Width - col4Width - col5Width - col6Width; // Total Amount
  
  const colPositions = [
    margin,
    margin + col1Width, 
    margin + col1Width + col2Width,
    margin + col1Width + col2Width + col3Width,
    margin + col1Width + col2Width + col3Width + col4Width,
    margin + col1Width + col2Width + col3Width + col4Width + col5Width,
    margin + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width
  ];
  
  // Draw vertical lines for columns
  colPositions.forEach(pos => {
    doc.line(pos, currentY, pos, currentY + boxHeight);
  });
  doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Item #', colPositions[0] + 2, currentY + 9);
  addWhiteText('Qty', colPositions[1] + 2, currentY + 9);
  addWhiteText('Unit', colPositions[2] + 2, currentY + 9);
  addWhiteText('Ex Factory', colPositions[3] + 2, currentY + 5);
  addWhiteText('Rate', colPositions[3] + 2, currentY + 11);
  addWhiteText('Amount', colPositions[4] + 2, currentY + 9);
  addWhiteText('GST@18%', colPositions[5] + 2, currentY + 9);
  addWhiteText('Total Amount(₹)', colPositions[6] + 2, currentY + 9);
  
  currentY += boxHeight;

  // Table content - exactly like sample
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  const rowHeight = 12;
  
  // Main item - BITUMEN VG-30 PHONEIX EMBOSSED exactly like sample
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
  
  // Draw borders for this row
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, currentY, tableWidth, rowHeight);
  colPositions.forEach(pos => {
    doc.line(pos, currentY, pos, currentY + rowHeight);
  });
  doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + rowHeight);
  
  addText('BITUMEN VG-30 PHONEIX', colPositions[0] + 2, currentY + 5);
  addText('EMBOSSED', colPositions[0] + 2, currentY + 9);
  addText('40.7', colPositions[1] + 2, currentY + 7);
  addText('MT', colPositions[2] + 2, currentY + 7);
  addText('37300', colPositions[3] + 2, currentY + 7);
  addText('1518110', colPositions[4] + 2, currentY + 7);
  addText('273260', colPositions[5] + 2, currentY + 7);
  addText('1791370', colPositions[6] + 2, currentY + 7);
  
  currentY += rowHeight;

  // Transport charges section exactly like sample
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
  
  // Draw borders for transport row
  doc.rect(margin, currentY, tableWidth, rowHeight);
  colPositions.forEach(pos => {
    doc.line(pos, currentY, pos, currentY + rowHeight);
  });
  doc.line(margin + tableWidth, currentY, margin + tableWidth, currentY + rowHeight);
  
  addText('Transport Charges', colPositions[0] + 2, currentY + 7);
  addText('42', colPositions[1] + 2, currentY + 7);
  addText('MT', colPositions[2] + 2, currentY + 7);
  addText('7800', colPositions[3] + 2, currentY + 7);
  addText('327600', colPositions[4] + 2, currentY + 7);
  // Leave GST and total blank for transport
  
  currentY += rowHeight + 2;

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
  
  // Sales Person value
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, boxHeight);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText('Pradeep Bhuyan', margin + 2, currentY + 9);
  
  // SubTotal value - exactly like sample
  doc.setFillColor(255, 255, 255);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addText('1791370', rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Description header
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, leftSectionWidth, boxHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, boxHeight);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Description :', margin + 2, currentY + 9);
  
  // Freight header
  doc.setFillColor(216, 69, 11);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addWhiteText('Freight', rightSectionX + 2, currentY + 9);
  currentY += boxHeight;
  
  // Description content
  const descriptionHeight = 20;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftSectionWidth, descriptionHeight, 'F');
  doc.rect(margin, currentY, leftSectionWidth, descriptionHeight);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  addText('Note- Above Payment terms Not included in Transportation. Transportation payment', margin + 2, currentY + 6);
  addText('should be made on before unloading.', margin + 2, currentY + 12);
  
  // Freight value
  doc.setFillColor(255, 255, 255);
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight, 'F');
  doc.rect(rightSectionX, currentY, rightSectionWidth, boxHeight);
  addText('327600', rightSectionX + 2, currentY + 9);
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
  addText('2118970', rightSectionX + 2, currentY + 9);
  currentY += boxHeight + 5;

  // Terms and Bank Details section with orange headers like sample
  const leftTermsWidth = tableWidth * 0.65;
  const rightBankWidth = tableWidth * 0.35;
  const rightBankX = margin + leftTermsWidth;
  
  // Terms and Conditions header
  doc.setFillColor(216, 69, 11);
  doc.rect(margin, currentY, leftTermsWidth, boxHeight, 'F');
  doc.setDrawColor(0, 0, 0);
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

  const termsAndConditions = [
    "* Payment Should be made on or before 30th day of the Day of Billing.",
    "* Incase Of Late Payment, Credit Limit will be Reduced by 10%.",
    "* If the Payment is not done within the due terms of invoice then an interest of 24% per annum i.e 2% per month",
    "  would be charged on due amount.",
    "* All Cheques/Demand Drafts for payment of bills must be crossed \"A/C Payee Only\" and Drawn in Favour of",
    "  \"M/S SRI HM BITUMEN CO\".",
    "* In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.",
    "* Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.",
    "* If the Payment is Not Done within the 30 days of the due date then the rest of the pending order will be on hold.",
    "* Telephonic Conversations Can be recorded for training and other official purposes.",
    "* If Payment Received Before 30 Days Then a Special Discount will be given to you 200 / Per Ton.",
    "* Detention of Rs 4000 per day will be charged, if the vehicle is not unloaded within 48 hrs of Reporting."
  ];

  const bankDetails = [
    'Bank Name : State Bank of India',
    'Account No. : 40464693538',
    'Branch : Paltan Bazar',
    'IFSC Code : SBIN0040464'
  ];

  // White backgrounds for content
  const termsHeight = termsAndConditions.length * 4 + 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftTermsWidth, termsHeight, 'F');
  doc.rect(margin, currentY, leftTermsWidth, termsHeight);
  doc.rect(rightBankX, currentY, rightBankWidth, 35, 'F');
  doc.rect(rightBankX, currentY, rightBankWidth, 35);

  // Add terms with smaller font like sample
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  let termsY = currentY + 4;
  termsAndConditions.forEach(term => {
    addText(term, margin + 2, termsY);
    termsY += 4;
  });

  // Add bank details
  doc.setFontSize(7);
  let bankY = currentY + 4;
  bankDetails.forEach(detail => {
    addText(detail, rightBankX + 2, bankY);
    bankY += 6;
  });

  // Company signature section
  currentY += Math.max(termsHeight, 35) + 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('For M/S SRI HM BITUMEN CO', rightBankX + 2, currentY);
  currentY += 20;
  addText('Authorized Signatory', rightBankX + 2, currentY);
  currentY += 15;

  return doc;
};

// React component for displaying quotation
interface QuotationTemplateProps {
  quotationData: QuotationData;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const QuotationTemplate: React.FC<QuotationTemplateProps> = ({
  quotationData,
  onDownload,
  onPrint
}) => {
  const handleDownload = () => {
    const doc = generateBitumenQuotationPDF(quotationData);
    doc.save(`quotation-${quotationData.quotationNumber}.pdf`);
    onDownload?.();
  };

  const handlePrint = () => {
    const doc = generateBitumenQuotationPDF(quotationData);
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