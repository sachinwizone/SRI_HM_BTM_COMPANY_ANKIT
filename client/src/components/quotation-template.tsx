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
  const margin = 8;
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

  // Header section
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 30);

  // Logo placeholder
  doc.setFillColor(255, 165, 0);
  doc.circle(margin + 12, currentY + 15, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 8, currentY + 17);

  // Company name in RED
  doc.setTextColor(220, 20, 20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', margin + 28, currentY + 8);
  
  // Company details in black
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  addText('Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon', margin + 28, currentY + 13);
  addText('Mouza - Ramcharani, Guwahati, Assam - 781035', margin + 28, currentY + 16);
  addText('GST No : 18CGMPP6536N2ZG', margin + 28, currentY + 19);
  addText('Mobile No : +91 8453059698', margin + 28, currentY + 22);
  addText('Email ID : info.srihmbitumen@gmail.com', margin + 28, currentY + 25);

  currentY += 33;

  // "Sales Order" title with dark background
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 10, 'F');
  doc.setTextColor(220, 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addText('Quotation', pageWidth / 2, currentY + 7, { align: 'center' });
  
  currentY += 12;

  // EXACT LAYOUT matching the sample image
  const tableWidth = pageWidth - 2 * margin;
  const boxHeight = 12;
  const thirdWidth = tableWidth / 3;
  
  // Row 1: Three boxes - Quotation No, Date, Delivery Terms with dark headers
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');  
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  // Draw borders
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.rect(margin, currentY, thirdWidth, boxHeight);
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight);
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Quotation No.', margin + thirdWidth/2, currentY + 7, { align: 'center' });
  addWhiteText('Quotation Date', margin + thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  addWhiteText('Delivery Terms', margin + 2*thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  currentY += boxHeight;
  
  // Values for row 1
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.quotationNumber, margin + thirdWidth/2, currentY + 7, { align: 'center' });
  addText(quotationData.quotationDate.toLocaleDateString('en-GB'), margin + thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  addText(quotationData.deliveryTerms || 'Within 10 to 12 Days', margin + 2*thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  currentY += boxHeight + 2;
  
  // Row 2: Payment Terms, Destination, Loading From  
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Payment Terms', margin + thirdWidth/2, currentY + 7, { align: 'center' });
  addWhiteText('Destination', margin + thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  addWhiteText('Loading From', margin + 2*thirdWidth + thirdWidth/2, currentY + 7, { align: 'center' });
  currentY += boxHeight;
  
  // Values for row 2 (taller boxes)
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, boxHeight * 1.5, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight * 1.5, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight * 1.5, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.paymentTerms || '30 Days Credit', margin + 2, currentY + 9);
  addText(quotationData.destination || 'Guwahati', margin + thirdWidth + 2, currentY + 9);
  addText(quotationData.loadingFrom || 'Kandla', margin + 2*thirdWidth + 2, currentY + 9);
  currentY += boxHeight * 1.5 + 2;
  
  // Bill To and Ship To sections side by side
  const halfWidth = tableWidth / 2;
  const clientSectionHeight = 50;
  
  // Headers
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Bill To :', margin + 2, currentY + 7);
  addWhiteText('Ship To :', margin + halfWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // Client details
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, clientSectionHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, clientSectionHeight, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  let clientY = currentY + 4;
  addText(`Name: ${quotationData.client.name}`, margin + 2, clientY);
  addText(`Name: ${quotationData.client.name}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`GST No: ${quotationData.client.gstNumber || 'N/A'}`, margin + 2, clientY);
  addText(`GST No: ${quotationData.client.gstNumber || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`Address: ${quotationData.client.address || 'N/A'}`, margin + 2, clientY);
  addText(`Address: ${quotationData.client.address || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`State: ${quotationData.client.state || 'N/A'}`, margin + 2, clientY);
  addText(`State: ${quotationData.client.state || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`Pin Code: ${quotationData.client.pinCode || 'N/A'}`, margin + 2, clientY);
  addText(`Pin Code: ${quotationData.client.pinCode || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`Mobile No: ${quotationData.client.mobileNumber || 'N/A'}`, margin + 2, clientY);
  addText(`Mobile No: ${quotationData.client.mobileNumber || 'N/A'}`, margin + halfWidth + 2, clientY);
  clientY += 6;
  addText(`Email ID: ${quotationData.client.email || 'N/A'}`, margin + 2, clientY);
  addText(`Email ID: ${quotationData.client.email || 'N/A'}`, margin + halfWidth + 2, clientY);
  
  currentY += clientSectionHeight + 3;
  
  // Items table
  doc.setFontSize(8);
  
  // Table header with exact columns like sample
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
  
  const colPositions = [margin + 2, margin + 25, margin + 45, margin + 65, margin + 100, margin + 135, margin + 170];
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Item #', colPositions[0], currentY + 7);
  addWhiteText('Qty', colPositions[1], currentY + 7);
  addWhiteText('Unit', colPositions[2], currentY + 7);
  addWhiteText('Ex Factory Rate', colPositions[3], currentY + 7);
  addWhiteText('Amount', colPositions[4], currentY + 7);
  addWhiteText('GST@18%', colPositions[5], currentY + 7);
  addWhiteText('Total Amount(₹)', colPositions[6], currentY + 7);
  
  currentY += boxHeight;

  // Table content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  quotationData.items.forEach((item, index) => {
    // White background for each row
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, tableWidth, 10, 'F');
    
    addText(item.description, colPositions[0], currentY + 6);
    addText(item.quantity.toString(), colPositions[1], currentY + 6);
    addText(item.unit, colPositions[2], currentY + 6);
    addText(item.rate.toFixed(0), colPositions[3], currentY + 6);
    addText(item.amount.toFixed(0), colPositions[4], currentY + 6);
    addText((item.amount * 0.18).toFixed(0), colPositions[5], currentY + 6);
    addText((item.amount * 1.18).toFixed(0), colPositions[6], currentY + 6);
    
    // Draw borders
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, currentY, tableWidth, 10);
    
    currentY += 10;
  });

  // Transport charges section
  if (quotationData.transportCharges) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, tableWidth, 10, 'F');
    
    addText('Transport Charges', colPositions[0], currentY + 6);
    addText('42', colPositions[1], currentY + 6);
    addText('MT', colPositions[2], currentY + 6);
    addText('7800', colPositions[3], currentY + 6);
    addText('327600', colPositions[4], currentY + 6);
    
    doc.rect(margin, currentY, tableWidth, 10);
    currentY += 12;
  }

  // Sales Person Name section
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addWhiteText('Sales Person Name:', margin + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.salesPersonName || 'Pradeep Bhuyan', margin + 2, currentY + 7);
  
  currentY += boxHeight + 3;

  // Description section matching sample layout
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addWhiteText('Description :', margin + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, 20, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  addText('Note: As per the rate is Not included in Transportation. Transportation payment', margin + 2, currentY + 6);
  addText('should handle by before delivery.', margin + 2, currentY + 12);
  currentY += 22;

  // Move totals section above the Terms and Bank Details
  currentY -= boxHeight + 30;
  
  // Sub Total, GST, Total on the right side
  const totalsX = margin + halfWidth + 10;
  const totalsWidth = halfWidth - 10;
  const totalsLabelWidth = totalsWidth * 0.6;
  const totalsValueWidth = totalsWidth * 0.4;
  
  // Sub Total
  doc.setFillColor(70, 70, 70);
  doc.rect(totalsX, currentY, totalsLabelWidth, boxHeight, 'F');
  doc.rect(totalsX + totalsLabelWidth, currentY, totalsValueWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Sub Total', totalsX + 2, currentY + 7);
  addWhiteText('1791370', totalsX + totalsLabelWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // GST
  doc.setFillColor(170, 70, 70);
  doc.rect(totalsX, currentY, totalsLabelWidth, boxHeight, 'F');
  doc.rect(totalsX + totalsLabelWidth, currentY, totalsValueWidth, boxHeight, 'F');
  addWhiteText('GST', totalsX + 2, currentY + 7);
  addWhiteText('322447', totalsX + totalsLabelWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // Total
  doc.setFillColor(120, 120, 120);
  doc.rect(totalsX, currentY, totalsLabelWidth, boxHeight, 'F');
  doc.rect(totalsX + totalsLabelWidth, currentY, totalsValueWidth, boxHeight, 'F');
  addWhiteText('Total', totalsX + 2, currentY + 7);
  addWhiteText('2113817', totalsX + totalsLabelWidth + 2, currentY + 7);
  currentY += boxHeight + 5;

  // Calculate position after totals
  currentY += boxHeight + 10;

  // Terms and Bank Details section with dark headers
  const leftWidth = tableWidth * 0.65;
  const rightWidth = tableWidth * 0.35;
  const rightX = margin + leftWidth;
  
  // Terms and Conditions header
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, leftWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addWhiteText('Terms and Conditions', margin + 2, currentY + 7);
  
  // Bank Details header
  doc.setFillColor(70, 70, 70);
  doc.rect(rightX, currentY, rightWidth, boxHeight, 'F');
  addWhiteText('Bank Details', rightX + 2, currentY + 7);
  currentY += boxHeight;

  const termsAndConditions = [
    "* Payment Should be made on or before 30th day of the Day of Billing.",
    "* Incase Of Late Payment, Credit Limit will be Reduce by 10%.",
    "* If the Payment is not done within the due terms of invoice then an",
    "  interest of 24% per annum i.e 2% per month would be charged on due amount.",
    "* All Cheques/Demand Drafts for payment of bills must be crossed",
    '  "A/C Payee Only" and Drawn in Favor of "Company\'s Name".',
    "* In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.",
    "* Disputes are subject to jurisdiction of Guwahati courts and all the legal",
    "  fees will be borne by the buyer.",
    "* If the Payment is Not Done within the 30 days of the due date then the",
    "  rest of the pending order will be on hold.",
    "* Telephonic Conversations Can be recorded for training and other",
    "  official purposes.",
    "* If Payment Received Before 30 Days Then a Special Discount will be",
    "  given to you 200 / Per Ton.",
    "* Detention of Rs 4000 per day will be charged,if the vehicle is not",
    "  unloaded within 48 hrs of Reporting."
  ];

  const bankDetails = [
    'Bank Name : State Bank of India',
    'Account No. : 40464693538',
    'Branch : Guwahati',
    'IFSC Code : SBIN0040464'
  ];

  // White backgrounds for content
  const termsHeight = termsAndConditions.length * 4 + 5;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, leftWidth, termsHeight, 'F');
  doc.rect(rightX, currentY, rightWidth, 25, 'F');

  // Add terms
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  let termsY = currentY + 3;
  termsAndConditions.forEach(term => {
    addText(term, margin + 2, termsY);
    termsY += 4;
  });

  // Add bank details
  let bankY = currentY + 3;
  bankDetails.forEach(detail => {
    addText(detail, rightX + 2, bankY);
    bankY += 5;
  });

  // For company signature
  currentY += Math.max(termsHeight, 25) + 10;
  addText('For M/S SRI HM BITUMEN CO', rightX + 2, currentY);
  currentY += 15;
  addText('Authorized Signatory', rightX + 2, currentY);
  currentY += 10;

  // Footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addBoldText('SUBJECT TO GUWAHATI JURISDICTION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  addText('THIS IS COMPUTER GENERATED QUOTATION SIGNATURE NOT REQUIRED', pageWidth / 2, currentY, { align: 'center' });

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