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
  const margin = 15;
  let currentY = 20;

  // Helper function to add text with proper spacing
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Helper function to add bold text
  const addBoldText = (text: string, x: number, y: number, options?: any) => {
    doc.setFont(undefined, 'bold');
    doc.text(text, x, y, options);
    doc.setFont(undefined, 'normal');
  };

  // Company Header (Right aligned like the sample)
  doc.setFontSize(16);
  addBoldText(salesOrderData.companyDetails.name, pageWidth - margin, currentY, { align: 'right' });
  currentY += 6;
  
  doc.setFontSize(10);
  const addressLines = salesOrderData.companyDetails.address.split('\n');
  addressLines.forEach(line => {
    addText(line, pageWidth - margin, currentY, { align: 'right' });
    currentY += 4;
  });
  
  addText(`GST No : ${salesOrderData.companyDetails.gstNumber}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;
  addText(`Mobile No : ${salesOrderData.companyDetails.mobile}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;
  addText(`Email ID : ${salesOrderData.companyDetails.email}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 15;

  // Sales Order Title
  doc.setFontSize(18);
  addBoldText('Sales Order', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Order Details Row (3 columns)
  doc.setFontSize(10);
  const col1X = margin;
  const col2X = margin + 65;
  const col3X = margin + 130;

  // Headers
  addBoldText('Sales Order No.', col1X, currentY);
  addBoldText('Sales Order Date', col2X, currentY);
  addBoldText('Delivery Terms', col3X, currentY);
  currentY += 6;

  // Values
  addText(salesOrderData.orderNumber, col1X, currentY);
  addText(salesOrderData.orderDate.toLocaleDateString('en-GB'), col2X, currentY);
  addText(salesOrderData.deliveryTerms || 'With In 10 to 12 Days', col3X, currentY);
  currentY += 10;

  // Payment Terms Row
  addBoldText('Payment Terms', col1X, currentY);
  addBoldText('Destination', col2X, currentY);
  addBoldText('Loading From', col3X, currentY);
  currentY += 6;

  addText(salesOrderData.paymentTerms || '30 Days Credit. Interest will be charged\nDay 1st Of Billing @18%P.A', col1X, currentY);
  addText(salesOrderData.destination || '', col2X, currentY);
  addText(salesOrderData.loadingFrom || 'Kandla', col3X, currentY);
  currentY += 20;

  // Bill To and Ship To sections
  addBoldText('Bill To :', col1X, currentY);
  addBoldText('Ship To :', col2X + 30, currentY);
  currentY += 6;

  // Client details for both Bill To and Ship To
  const clientLines = [
    `Name : ${salesOrderData.client.name}`,
    `GST No : ${salesOrderData.client.gstNumber || ''}`,
    `Address : ${salesOrderData.client.address || ''}`,
    `State : ${salesOrderData.client.state || ''}`,
    `Pin Code : ${salesOrderData.client.pinCode || ''}`,
    `Mobile No : ${salesOrderData.client.mobileNumber || ''}`,
    `Email ID : ${salesOrderData.client.email || ''}`
  ];

  clientLines.forEach(line => {
    addText(line, col1X, currentY);
    addText(line, col2X + 30, currentY); // Ship To (same as Bill To)
    currentY += 5;
  });

  currentY += 10;

  // Items Table Header
  const tableStartY = currentY;
  const colWidths = [25, 20, 15, 30, 25, 25, 35];
  const colPositions = [margin, margin + 25, margin + 45, margin + 60, margin + 90, margin + 115, margin + 140];

  // Table headers
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY - 3, pageWidth - (margin * 2), 8, 'F');
  
  addBoldText('Item #', colPositions[0], currentY);
  addBoldText('Qty', colPositions[1], currentY);
  addBoldText('Unit', colPositions[2], currentY);
  addBoldText('Ex Factory Rate', colPositions[3], currentY);
  addBoldText('Amount GST@18%', colPositions[4], currentY);
  addBoldText('(₹)', colPositions[5], currentY);
  addBoldText('Total Amount(₹)', colPositions[6], currentY);
  currentY += 8;

  // Table content
  salesOrderData.items.forEach((item, index) => {
    addText(item.description, colPositions[0], currentY);
    addText(item.quantity.toString(), colPositions[1], currentY);
    addText(item.unit, colPositions[2], currentY);
    addText(item.rate.toString(), colPositions[3], currentY);
    addText(item.amount.toString(), colPositions[4], currentY);
    addText(item.gstAmount?.toString() || '', colPositions[5], currentY);
    addText(item.totalAmount.toString(), colPositions[6], currentY);
    currentY += 7;
  });

  // Transport charges if applicable
  if (salesOrderData.transportCharges) {
    addText('Transport Charges', colPositions[0], currentY);
    addText(salesOrderData.transportCharges.quantity.toString(), colPositions[1], currentY);
    addText(salesOrderData.transportCharges.unit, colPositions[2], currentY);
    addText(salesOrderData.transportCharges.rate.toString(), colPositions[3], currentY);
    addText(salesOrderData.transportCharges.amount.toString(), colPositions[4], currentY);
    currentY += 10;
  }

  // Sales Person
  addText(`Sales Person Name:`, margin, currentY);
  currentY += 5;
  addBoldText(salesOrderData.salesPersonName || '', margin, currentY);
  currentY += 10;

  // Description and Note
  if (salesOrderData.description) {
    addBoldText('Description :', margin, currentY);
    currentY += 5;
    addText(salesOrderData.description, margin, currentY);
    currentY += 5;
  }

  if (salesOrderData.note) {
    addText(salesOrderData.note, margin, currentY);
    currentY += 15;
  }

  // Totals section (right aligned)
  const totalsX = pageWidth - 80;
  addBoldText('SubTotal', totalsX, currentY);
  addText(salesOrderData.subtotal.toString(), totalsX + 30, currentY);
  currentY += 6;

  addBoldText('Freight', totalsX, currentY);
  addText(salesOrderData.freight.toString(), totalsX + 30, currentY);
  currentY += 6;

  addBoldText('Total', totalsX, currentY);
  addText(salesOrderData.total.toString(), totalsX + 30, currentY);
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
    `Bank Name : ${salesOrderData.companyDetails.bankDetails.bankName}`,
    `Account No. : ${salesOrderData.companyDetails.bankDetails.accountNumber}`,
    `Branch : ${salesOrderData.companyDetails.bankDetails.branch}`,
    `IFSC Code : ${salesOrderData.companyDetails.bankDetails.ifscCode}`
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
  addText(`For ${salesOrderData.companyDetails.name}`, bankDetailsX, currentY);
  currentY += 20;
  addText('Authorized Signatory', bankDetailsX, currentY);
  currentY += 15;

  // Footer
  addBoldText('SUBJECT TO GUWAHATI JURISDICTION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  addText('THIS IS COMPUTER GENERATED SALES ORDER SIGNATURE NOT REQUIRED', pageWidth / 2, currentY, { align: 'center' });

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