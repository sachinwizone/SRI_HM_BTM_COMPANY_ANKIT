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

export function generateBitumenQuotationPDF(quotationData: QuotationData) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    
    // Helper function to safely add text with bounds checking
    const safeAddText = (text: string | number, x: number, y: number, options?: { align?: 'left' | 'center' | 'right', maxWidth?: number }) => {
      try {
        const textStr = String(text || '');
        const safeX = Math.max(0, Math.min(x, pageWidth - 5));
        const safeY = Math.max(10, Math.min(y, pageHeight - 10));
        
        if (options?.maxWidth && textStr.length > options.maxWidth) {
          const truncated = textStr.substring(0, options.maxWidth - 3) + '...';
          if (options.align === 'center') {
            doc.text(truncated, safeX, safeY, { align: 'center' });
          } else if (options.align === 'right') {
            doc.text(truncated, safeX, safeY, { align: 'right' });
          } else {
            doc.text(truncated, safeX, safeY);
          }
        } else {
          if (options?.align === 'center') {
            doc.text(textStr, safeX, safeY, { align: 'center' });
          } else if (options?.align === 'right') {
            doc.text(textStr, safeX, safeY, { align: 'right' });
          } else {
            doc.text(textStr, safeX, safeY);
          }
        }
      } catch (error) {
        console.error('Error adding text:', error);
      }
    };

    // Helper function to safely draw rectangles
    const safeRect = (x: number, y: number, width: number, height: number, style?: string) => {
      try {
        const safeX = Math.max(0, x);
        const safeY = Math.max(0, y);
        const safeWidth = Math.min(width, pageWidth - safeX);
        const safeHeight = Math.min(height, pageHeight - safeY);
        
        if (safeWidth > 0 && safeHeight > 0) {
          doc.rect(safeX, safeY, safeWidth, safeHeight, style);
        }
      } catch (error) {
        console.error('Error drawing rectangle:', error);
      }
    };
    
    let currentY = margin;
    
    // Header Section
    const headerHeight = 35;
    
    try {
      // Company Logo - Simple HM text logo
      doc.setFillColor(220, 50, 47);
      doc.circle(margin + 15, currentY + 17, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      safeAddText('HM', margin + 11, currentY + 20);
      
      // Company details
      const detailsX = margin + contentWidth - 100;
      doc.setTextColor(220, 50, 47);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      safeAddText('M/S SRI HM BITUMEN CO', detailsX, currentY + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      safeAddText('Dag No: 1071, Patta No: 264', detailsX, currentY + 14);
      safeAddText('Guwahati, Assam - 781035', detailsX, currentY + 18);
      safeAddText('GST: 18CGMPP6536N2ZG', detailsX, currentY + 22);
      safeAddText('Mobile: +91 8453059698', detailsX, currentY + 26);
      safeAddText('Email: info.srihmbitumen@gmail.com', detailsX, currentY + 30);
    } catch (error) {
      console.error('Error in header section:', error);
    }
    
    currentY += headerHeight + 10;
    
    // Main title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 50, 47);
    safeAddText('Sales Order', pageWidth/2, currentY, { align: 'center' });
    currentY += 15;
    
    // Top info boxes
    try {
      const boxHeight = 20;
      const boxWidth = contentWidth / 6;
      const boxes = [
        { label: 'Order No', value: quotationData.quotationNumber || 'N/A' },
        { label: 'Date', value: quotationData.quotationDate ? quotationData.quotationDate.toLocaleDateString('en-GB') : 'N/A' },
        { label: 'Delivery', value: quotationData.deliveryTerms || 'Standard' },
        { label: 'Destination', value: quotationData.destination || 'TBD' },
        { label: 'Loading', value: quotationData.loadingFrom || 'Kandla' },
        { label: 'Payment', value: quotationData.paymentTerms || '30 Days' }
      ];
      
      // Headers
      doc.setFillColor(220, 50, 47);
      for (let i = 0; i < boxes.length; i++) {
        const x = margin + i * boxWidth;
        safeRect(x, currentY, boxWidth, boxHeight/2, 'F');
      }
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      for (let i = 0; i < boxes.length; i++) {
        const x = margin + i * boxWidth;
        safeAddText(boxes[i].label, x + boxWidth/2, currentY + 7, { align: 'center', maxWidth: 15 });
      }
      
      currentY += boxHeight/2;
      
      // Values
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < boxes.length; i++) {
        const x = margin + i * boxWidth;
        safeRect(x, currentY, boxWidth, boxHeight/2);
        safeAddText(boxes[i].value, x + boxWidth/2, currentY + 6, { align: 'center', maxWidth: 20 });
      }
      
      currentY += boxHeight/2 + 10;
    } catch (error) {
      console.error('Error in info boxes:', error);
      currentY += 30;
    }
    
    // Bill To / Ship To section
    try {
      const halfWidth = contentWidth / 2;
      const clientSectionHeight = 45;
      
      // Headers
      doc.setFillColor(220, 50, 47);
      safeRect(margin, currentY, halfWidth - 1, 12, 'F');
      safeRect(margin + halfWidth + 1, currentY, halfWidth - 1, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      safeAddText('Bill To', margin + 5, currentY + 8);
      safeAddText('Ship To', margin + halfWidth + 6, currentY + 8);
      
      currentY += 12;
      
      // Content
      doc.setFillColor(240, 240, 240);
      safeRect(margin, currentY, halfWidth - 1, clientSectionHeight, 'F');
      safeRect(margin + halfWidth + 1, currentY, halfWidth - 1, clientSectionHeight, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const clientInfo = [
        `Name: ${quotationData.client.name || 'N/A'}`,
        `GST: ${quotationData.client.gstNumber || 'N/A'}`,
        `Address: ${quotationData.client.address || 'N/A'}`,
        `State: ${quotationData.client.state || 'N/A'}`,
        `Pin: ${quotationData.client.pinCode || 'N/A'}`,
        `Mobile: ${quotationData.client.mobileNumber || 'N/A'}`,
        `Email: ${quotationData.client.email || 'N/A'}`
      ];
      
      let clientY = currentY + 6;
      for (const info of clientInfo) {
        safeAddText(info, margin + 3, clientY, { maxWidth: 35 });
        safeAddText(info, margin + halfWidth + 4, clientY, { maxWidth: 35 });
        clientY += 6;
      }
      
      currentY += clientSectionHeight + 10;
    } catch (error) {
      console.error('Error in client section:', error);
      currentY += 60;
    }
    
    // Items Table
    try {
      const tableHeaders = ['#', 'Description', 'Qty', 'Unit', 'Rate', 'Amount', 'Tax%', 'Total'];
      const colWidths = [15, 50, 15, 15, 25, 25, 15, 30];
      let colX = margin;
      const colPositions = [colX];
      for (let i = 0; i < colWidths.length - 1; i++) {
        colX += colWidths[i];
        colPositions.push(colX);
      }
      
      const tableHeaderHeight = 12;
      
      // Table headers
      doc.setFillColor(220, 50, 47);
      safeRect(margin, currentY, contentWidth, tableHeaderHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      for (let i = 0; i < tableHeaders.length; i++) {
        safeAddText(tableHeaders[i], colPositions[i] + 2, currentY + 8);
      }
      
      currentY += tableHeaderHeight;
      
      // Table rows
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const rowHeight = 12;
      
      if (quotationData.items && quotationData.items.length > 0) {
        quotationData.items.forEach((item, index) => {
          try {
            if (index % 2 === 0) {
              doc.setFillColor(250, 250, 250);
              safeRect(margin, currentY, contentWidth, rowHeight, 'F');
            }
            
            safeRect(margin, currentY, contentWidth, rowHeight);
            
            // Get GST rate from item (0% for freight, 18% for products)
            const gstRate = item.gstRate === 0 ? '0%' : '18%';
            
            safeAddText((index + 1).toString(), colPositions[0] + 2, currentY + 7);
            safeAddText(item.description || 'N/A', colPositions[1] + 2, currentY + 7, { maxWidth: 30 });
            safeAddText((item.quantity || 0).toString(), colPositions[2] + 2, currentY + 7);
            safeAddText(item.unit || 'PCS', colPositions[3] + 2, currentY + 7);
            safeAddText((item.rate || 0).toFixed(0), colPositions[4] + 2, currentY + 7);
            safeAddText((item.amount || 0).toFixed(0), colPositions[5] + 2, currentY + 7);
            safeAddText(gstRate, colPositions[6] + 2, currentY + 7);
            safeAddText((item.totalAmount || 0).toFixed(0), colPositions[7] + 2, currentY + 7);
            
            currentY += rowHeight;
          } catch (error) {
            console.error('Error in table row:', error);
            currentY += rowHeight;
          }
        });
      } else {
        // No items case
        safeRect(margin, currentY, contentWidth, rowHeight);
        safeAddText('No items found', margin + contentWidth/2, currentY + 7, { align: 'center' });
        currentY += rowHeight;
      }
      
      currentY += 10;
    } catch (error) {
      console.error('Error in items table:', error);
      currentY += 50;
    }

    // Transportation Details Section (if provided)
    if (quotationData.transportationDetails) {
      try {
        // Transportation header
        doc.setFillColor(220, 50, 47);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        safeAddText('Transportation Details', margin + 5, currentY + 5.5);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        
        // Transportation details content
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY, contentWidth, 20, 'FD');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const transportY = currentY + 5;
        
        safeAddText(`Transport Mode: ${quotationData.transportationDetails.transportMode || 'Road Transport'}`, margin + 5, transportY);
        safeAddText(`Vehicle Type: ${quotationData.transportationDetails.vehicleType || 'Truck'}`, margin + 90, transportY);
        
        safeAddText(`Estimated Delivery: ${quotationData.transportationDetails.estimatedDelivery || 'As per schedule'}`, margin + 5, transportY + 10);
        safeAddText(`Route: ${quotationData.transportationDetails.route || 'Standard Route'}`, margin + 90, transportY + 10);
        
        currentY += 25;
      } catch (error) {
        console.error('Error in transportation details:', error);
        currentY += 30;
      }
    }
    
    // Summary section
    try {
      const summaryWidth = 60;
      const summaryX = margin + contentWidth - summaryWidth;
      const summaryRowHeight = 10;
      
      // Calculate totals from items with per-item GST rates
      const nonFreightItems = quotationData.items?.filter(item => !item.isFreight) || [];
      const freightItems = quotationData.items?.filter(item => item.isFreight) || [];
      
      const productSubtotal = nonFreightItems.reduce((sum, item) => sum + item.amount, 0);
      const taxTotal = nonFreightItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
      const freightTotal = freightItems.reduce((sum, item) => sum + item.amount, 0);
      
      const summaryItems = [
        { label: 'Sub-Total', value: productSubtotal || 0 },
        { label: 'Tax Total (18%)', value: taxTotal || 0 },
        { label: 'Freight (Non-GST)', value: freightTotal || 0 },
        { label: 'Grand Total', value: quotationData.total || 0, isBold: true }
      ];
      
      summaryItems.forEach((item) => {
        try {
          if (item.isBold) {
            doc.setFillColor(220, 50, 47);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFillColor(240, 240, 240);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
          }
          
          safeRect(summaryX, currentY, summaryWidth, summaryRowHeight, 'F');
          safeRect(summaryX, currentY, summaryWidth, summaryRowHeight);
          doc.setFontSize(9);
          safeAddText(item.label, summaryX + 2, currentY + 7);
          safeAddText(`₹${item.value.toFixed(0)}`, summaryX + summaryWidth - 2, currentY + 7, { align: 'right' });
          
          currentY += summaryRowHeight;
        } catch (error) {
          console.error('Error in summary item:', error);
          currentY += summaryRowHeight;
        }
      });
      
      currentY += 10;
    } catch (error) {
      console.error('Error in summary section:', error);
      currentY += 50;
    }
    
    // Footer sections
    try {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeAddText('Sales Person:', margin, currentY);
      safeAddText(quotationData.salesPersonName || 'System Administrator', margin + 35, currentY);
      currentY += 15;
      
      // Terms
      doc.setTextColor(220, 50, 47);
      safeAddText('Terms & Conditions', margin, currentY);
      currentY += 8;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const terms = [
        '• Payment within one day of billing',
        '• Late payment reduces credit limit by 10%',
        '• Interest of 24% per annum on overdue amounts'
      ];
      
      terms.forEach(term => {
        safeAddText(term, margin, currentY);
        currentY += 5;
      });
      
      currentY += 10;
      
      // Bank Details
      doc.setFillColor(220, 50, 47);
      safeRect(margin, currentY, 80, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeAddText('Bank Details', margin + 2, currentY + 6);
      
      currentY += 8;
      doc.setFillColor(240, 240, 240);
      safeRect(margin, currentY, 80, 17, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      safeAddText('State Bank of India', margin + 2, currentY + 5);
      safeAddText('A/C: 40464693538', margin + 2, currentY + 9);
      safeAddText('Branch: Paltan Bazar', margin + 2, currentY + 13);
      safeAddText('IFSC: SBIN0040464', margin + 2, currentY + 17);
      
      currentY += 25;
      
      // Footer
      doc.setFontSize(7);
      safeAddText('Email: info.srihmbitumen@gmail.com | Phone: +91 8453059698', margin, currentY);
      safeAddText('Authorized Signatory: ________________', margin + contentWidth - 60, currentY + 10, { align: 'right' });
      
    } catch (error) {
      console.error('Error in footer section:', error);
    }
    
    // Save PDF
    const fileName = `Sales_Order_${(quotationData.quotationNumber || 'UNKNOWN').replace(/[\/\\]/g, '_')}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    // Show user-friendly error
    alert('Failed to generate PDF. Please try again or contact support if the issue persists.');
  }
}