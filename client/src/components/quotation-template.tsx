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
  let currentY = 15;

  // Helper function to add text with proper spacing
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Helper function to add bold text
  const addBoldText = (text: string, x: number, y: number, options?: any) => {
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, y, options);
    doc.setFont('helvetica', 'normal');
  };

  // Helper function to draw rectangle with border
  const drawRect = (x: number, y: number, width: number, height: number, fill = false) => {
    if (fill) {
      doc.setFillColor(240, 240, 240);
      doc.rect(x, y, width, height, 'FD');
    } else {
      doc.rect(x, y, width, height);
    }
  };

  // Set document background
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header section with company logo placeholder and details
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, margin, pageWidth - 2 * margin, 35, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, margin, pageWidth - 2 * margin, 35);

  // Company logo placeholder (orange circle)
  doc.setFillColor(255, 165, 0);
  doc.circle(margin + 15, margin + 17, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 11, margin + 20);

  // Company name and details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', margin + 35, margin + 12);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon', margin + 35, margin + 18);
  addText('Mouza - Ramcharani, Guwahati, Assam - 781035', margin + 35, margin + 22);
  addText('GST No : 18CGMPP6536N2ZG', margin + 35, margin + 26);
  addText('Mobile No : +91 8453059698', margin + 35, margin + 30);
  addText('Email ID : info.srihmbitumen@gmail.com', margin + 35, margin + 34);

  currentY = margin + 50;

  // Quotation title in red
  doc.setTextColor(200, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('Quotation', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15;

  // Details table header with colored background
  const detailsTableStartY = currentY;
  const tableWidth = pageWidth - 2 * margin;
  const rowHeight = 8;
  
  // First row with quotation details
  doc.setFillColor(100, 100, 100);
  doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const col1 = margin + 2;
  const col2 = margin + 65;
  const col3 = margin + 130;
  
  addText('Quotation No.', col1, currentY + 5);
  addText('Quotation Date', col2, currentY + 5);
  addText('Valid Until', col3, currentY + 5);
  currentY += rowHeight;
  
  // Values row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.quotationNumber, col1, currentY + 5);
  addText(quotationData.quotationDate.toLocaleDateString('en-GB'), col2, currentY + 5);
  addText(quotationData.validUntil.toLocaleDateString('en-GB'), col3, currentY + 5);
  currentY += rowHeight;
  
  // Second header row
  doc.setFillColor(100, 100, 100);
  doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addText('Payment Terms', col1, currentY + 5);
  addText('Destination', col2, currentY + 5);
  addText('Loading From', col3, currentY + 5);
  currentY += rowHeight;
  
  // Values row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, tableWidth, rowHeight * 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(`${quotationData.paymentTerms || '30'} days`, col1, currentY + 5);
  addText(quotationData.destination || '', col2, currentY + 5);
  addText(quotationData.loadingFrom || 'Kandla', col3, currentY + 5);
  currentY += rowHeight * 2;
  
  // Bill To and Ship To sections
  const sectionHeight = 35;
  const halfWidth = tableWidth / 2;
  
  // Bill To section
  doc.setFillColor(100, 100, 100);
  doc.rect(margin, currentY, halfWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addText('Bill To :', col1, currentY + 5);
  
  // Ship To section
  doc.rect(margin + halfWidth, currentY, halfWidth, rowHeight, 'F');
  addText('Ship To :', margin + halfWidth + 2, currentY + 5);
  currentY += rowHeight;
  
  // Client details
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, sectionHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, sectionHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  const clientY = currentY + 3;
  addText(`Name : ${quotationData.client.name}`, col1, clientY);
  addText(`Name : ${quotationData.client.name}`, margin + halfWidth + 2, clientY);
  addText(`GST No : ${quotationData.client.gstNumber || ''}`, col1, clientY + 5);
  addText(`GST No : ${quotationData.client.gstNumber || ''}`, margin + halfWidth + 2, clientY + 5);
  addText(`Address : ${quotationData.client.address || ''}`, col1, clientY + 10);
  addText(`Address : ${quotationData.client.address || ''}`, margin + halfWidth + 2, clientY + 10);
  addText(`State : ${quotationData.client.state || ''}`, col1, clientY + 15);
  addText(`State : ${quotationData.client.state || ''}`, margin + halfWidth + 2, clientY + 15);
  addText(`Pin Code : ${quotationData.client.pinCode || ''}`, col1, clientY + 20);
  addText(`Pin Code : ${quotationData.client.pinCode || ''}`, margin + halfWidth + 2, clientY + 20);
  addText(`Mobile No : ${quotationData.client.mobileNumber || ''}`, col1, clientY + 25);
  addText(`Mobile No : ${quotationData.client.mobileNumber || ''}`, margin + halfWidth + 2, clientY + 25);
  addText(`Email ID : ${quotationData.client.email || ''}`, col1, clientY + 30);
  addText(`Email ID : ${quotationData.client.email || ''}`, margin + halfWidth + 2, clientY + 30);
  
  currentY += sectionHeight + 5;

  currentY += 10;

  // Items Table Header
  const tableStartY = currentY;
  const colPositions = [margin, margin + 50, margin + 70, margin + 90, margin + 120, margin + 150, margin + 175];

  // Table headers
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY - 3, pageWidth - (margin * 2), 8, 'F');
  
  addBoldText('Item #', colPositions[0], currentY);
  addBoldText('Qty', colPositions[1], currentY);
  addBoldText('Unit', colPositions[2], currentY);
  addBoldText('Ex Factory Rate', colPositions[3], currentY);
  addBoldText('Amount', colPositions[4], currentY);
  addBoldText('GST@18%', colPositions[5], currentY);
  addBoldText('Total Amount(₹)', colPositions[6], currentY);
  currentY += 8;

  // Table content
  quotationData.items.forEach((item, index) => {
    addText(item.description, colPositions[0], currentY);
    addText(item.quantity.toString(), colPositions[1], currentY);
    addText(item.unit, colPositions[2], currentY);
    addText('₹' + item.rate.toFixed(2), colPositions[3], currentY);
    addText('₹' + item.amount.toFixed(2), colPositions[4], currentY);
    addText('₹' + (item.amount * 0.18).toFixed(2), colPositions[5], currentY);
    addText('₹' + (item.amount * 1.18).toFixed(2), colPositions[6], currentY);
    currentY += 7;
  });

  // Transport charges if applicable
  if (quotationData.transportCharges) {
    addText('Transport Charges', colPositions[0], currentY);
    addText(quotationData.transportCharges.quantity.toString(), colPositions[1], currentY);
    addText(quotationData.transportCharges.unit, colPositions[2], currentY);
    addText(quotationData.transportCharges.rate.toString(), colPositions[3], currentY);
    addText(quotationData.transportCharges.amount.toString(), colPositions[4], currentY);
    currentY += 10;
  }

  // Sales Person
  addText(`Sales Person Name:`, margin, currentY);
  currentY += 5;
  addBoldText(quotationData.salesPersonName || '', margin, currentY);
  currentY += 10;

  // Description and Note
  if (quotationData.description) {
    addBoldText('Description :', margin, currentY);
    currentY += 5;
    addText(quotationData.description, margin, currentY);
    currentY += 5;
  }

  if (quotationData.note) {
    addText(quotationData.note, margin, currentY);
    currentY += 15;
  }

  // Totals section (right aligned)
  const totalsX = pageWidth - 100;
  const totalsValueX = pageWidth - 30;
  
  addBoldText('SubTotal', totalsX, currentY);
  addText('₹' + quotationData.subtotal.toFixed(2), totalsValueX, currentY, { align: 'right' });
  currentY += 6;

  addBoldText('GST (18%)', totalsX, currentY);
  addText('₹' + (quotationData.subtotal * 0.18).toFixed(2), totalsValueX, currentY, { align: 'right' });
  currentY += 6;

  addBoldText('Freight', totalsX, currentY);
  addText('₹' + quotationData.freight.toFixed(2), totalsValueX, currentY, { align: 'right' });
  currentY += 6;

  doc.setLineWidth(0.5);
  doc.line(totalsX, currentY - 2, pageWidth - margin, currentY - 2);
  
  addBoldText('Total', totalsX, currentY);
  addBoldText('₹' + (quotationData.subtotal * 1.18 + quotationData.freight).toFixed(2), totalsValueX, currentY, { align: 'right' });
  currentY += 15;

  // Terms and Conditions (Left side)
  const termsX = margin;
  const bankDetailsX = pageWidth - 80;

  addBoldText('Terms and Conditions', termsX, currentY);
  addBoldText('Bank Details', bankDetailsX, currentY);
  currentY += 6;

  const termsAndConditions = [
    "-Payment Should be made on or before 30th day of the Day of Billing.",
    "-Incase Of Late Payment, Credit Limit will be Reduce by 10%.",
    "-If the Payment is not done within the due terms of invoice then an interest of 24% per annum i.e 2% per month",
    " would be charged on due amount.",
    "-All Cheques/Demand Drafts for payment of bills must be crossed \"A/C Payee Only\" and Drawn in Favor of",
    " \"Company's Name\".",
    "-In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.",
    "-Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.",
    "-If the Payment is Not Done within the 30 days of the due date then the rest of the pending order will be on hold.",
    "-Telephonic Conversations Can be recorded for training and other official purposes.",
    "-If Payment Received Before 30 Days Then a Special Discount will be given to you 200 / Per Ton.",
    "-Detention of Rs 4000 per day will be charged,if the vehicle is not unloaded within 48 hrs of Reporting."
  ];

  const bankDetails = [
    `Bank Name : ${quotationData.companyDetails.bankDetails.bankName}`,
    `Account No. : ${quotationData.companyDetails.bankDetails.accountNumber}`,
    `Branch : ${quotationData.companyDetails.bankDetails.branch}`,
    `IFSC Code : ${quotationData.companyDetails.bankDetails.ifscCode}`
  ];

  // Add terms (left side)
  termsAndConditions.forEach(term => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    addText(term, termsX, currentY);
    currentY += 4;
  });

  // Add bank details (right side) - reset Y position
  let bankY = currentY - (termsAndConditions.length * 4) + 6;
  bankDetails.forEach(detail => {
    addText(detail, bankDetailsX, bankY);
    bankY += 5;
  });

  // Company signature section
  currentY = Math.max(currentY, bankY) + 20;
  addText(`For ${quotationData.companyDetails.name}`, bankDetailsX, currentY);
  currentY += 20;
  addText('Authorized Signatory', bankDetailsX, currentY);
  currentY += 15;

  // Footer
  addBoldText('SUBJECT TO GUWAHATI JURISDICTION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
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