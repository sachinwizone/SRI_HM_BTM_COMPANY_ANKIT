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
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let currentY = 10;

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

    currentY = 15;

    // ===================== HEADER SECTION =====================
    // Add company logo on the left
    const logoSize = 45;
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', margin + 5, currentY - 5, logoSize, logoSize);
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
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('M/S SRI HM BITUMEN CO', margin + 65, currentY + 8);

    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const addressLine = 'Dag No: 1071, Patta No: 264, Guwahati, Assam 781035';
    doc.text(addressLine, margin + 65, currentY + 14);
    doc.text('GSTIN/UIN: 18CGMPP6536N2ZG', margin + 65, currentY + 19);
    doc.text('Mobile: +91 8453059698 | Email: info.srihmbitumen@gmail.com', margin + 65, currentY + 24);

    currentY += 50;

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

    // Content boxes with improved spacing
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, currentY, partyWidth, 45, 'F');
    doc.rect(margin + partyWidth + 2, currentY, partyWidth, 45, 'F');
    
    // Add border to content boxes
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY, partyWidth, 45);
    doc.rect(margin + partyWidth + 2, currentY, partyWidth, 45);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
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

    const clientName = quotationData.client.name || 'N/A';
    const clientGST = quotationData.client.gstNumber || 'N/A';
    const clientAddress = quotationData.client.address || 'N/A';
    const clientState = quotationData.client.state || 'N/A';
    const clientPin = quotationData.client.pinCode || 'N/A';

    // Calculate available width for text (subtract margins and padding)
    const availableWidth = partyWidth - 6;
    const maxCharsPerLine = Math.floor(availableWidth / 2.2); // Improved calculation

    let detailY = currentY + 4;
    
    // Name - with improved alignment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Name:', margin + 3, detailY);
    doc.text('Name:', margin + partyWidth + 5, detailY);
    doc.setFont('helvetica', 'normal');
    
    const nameLines = splitText(clientName, maxCharsPerLine - 6);
    nameLines.forEach((line, index) => {
      doc.text(line, margin + 20, detailY + (index * 3.5));
      doc.text(line, margin + partyWidth + 22, detailY + (index * 3.5));
    });
    detailY += Math.max(nameLines.length * 3.5, 5);

    // GST - with improved alignment
    doc.setFont('helvetica', 'bold');
    doc.text('GST:', margin + 3, detailY);
    doc.text('GST:', margin + partyWidth + 5, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(clientGST, margin + 20, detailY);
    doc.text(clientGST, margin + partyWidth + 22, detailY);
    detailY += 5;

    // Address - Handle long addresses with improved spacing
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', margin + 3, detailY);
    doc.text('Address:', margin + partyWidth + 5, detailY);
    doc.setFont('helvetica', 'normal');
    
    const addressLines = splitText(clientAddress, maxCharsPerLine - 9);
    addressLines.forEach((line, index) => {
      doc.text(line, margin + 26, detailY + (index * 3.5));
      doc.text(line, margin + partyWidth + 28, detailY + (index * 3.5));
    });
    detailY += Math.max(addressLines.length * 3.5, 5);

    // State - with improved alignment
    doc.setFont('helvetica', 'bold');
    doc.text('State:', margin + 3, detailY);
    doc.text('State:', margin + partyWidth + 5, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(clientState, margin + 20, detailY);
    doc.text(clientState, margin + partyWidth + 22, detailY);
    detailY += 5;

    // Pin Code - with improved alignment
    doc.setFont('helvetica', 'bold');
    doc.text('Pin:', margin + 3, detailY);
    doc.text('Pin:', margin + partyWidth + 5, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(clientPin, margin + 17, detailY);
    doc.text(clientPin, margin + partyWidth + 19, detailY);

    currentY += 47;

    // ===================== ITEMS TABLE =====================
    const totalTableWidth = pageWidth - 2 * margin;
    const itemTableHeaders = ['Item #', 'Description', 'Qty', 'Unit', 'Rate', 'Amount', 'GST', 'Total'];
    // Improved column widths for better balance
    const itemColWidths = [13, 42, 12, 13, 20, 22, 18, 22];
    
    // Calculate column positions
    const tableColPositions = [margin];
    for (let i = 0; i < itemColWidths.length - 1; i++) {
      tableColPositions.push(tableColPositions[i] + itemColWidths[i]);
    }

    // Draw table outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    const headerY = currentY;
    const rowHeight = 10; // Increased height to accommodate multi-line descriptions
    
    // Draw header with improved styling
    doc.setFillColor(230, 126, 34);
    doc.rect(margin, headerY, totalTableWidth, rowHeight, 'F');
    
    // Header border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, headerY, totalTableWidth, rowHeight);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    itemTableHeaders.forEach((header, i) => {
      const xPos = tableColPositions[i];
      const colWidth = itemColWidths[i];
      
      // Draw column dividers
      if (i > 0) {
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(xPos, headerY, xPos, headerY + rowHeight);
        doc.setDrawColor(0, 0, 0);
      }
      
      // Add text with improved alignment
      if (i >= 2 && i !== 1) { // Right align numeric columns (Qty, Unit, Rate, Amount, GST, Total)
        doc.text(header, xPos + colWidth - 3, headerY + 5.5, { align: 'right' });
      } else {
        doc.text(header, xPos + 3, headerY + 5.5);
      }
    });

    currentY = headerY + rowHeight;

    // Draw table rows with improved formatting
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    quotationData.items?.forEach((item, index) => {
      const rowY = currentY;
      
      // Alternate row colors for better readability
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, rowY, totalTableWidth, rowHeight, 'F');
      }

      // Draw row borders with consistent styling
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.3);
      
      // Vertical column dividers
      for (let i = 1; i < tableColPositions.length; i++) {
        doc.line(tableColPositions[i], rowY, tableColPositions[i], rowY + rowHeight);
      }
      
      // Row borders
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, rowY + rowHeight, margin + totalTableWidth, rowY + rowHeight);
      
      // Outer borders
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, rowY, margin, rowY + rowHeight); // Left border
      doc.line(margin + totalTableWidth, rowY, margin + totalTableWidth, rowY + rowHeight); // Right border

      // Add text for each column with improved alignment
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      
      // Column 0: Item # (centered)
      const itemNum = (index + 1).toString();
      doc.text(itemNum, tableColPositions[0] + itemColWidths[0] / 2, rowY + 6.5, { align: 'center' });
      
      // Column 1: Description (with proper text wrapping)
      const desc = (item.description || 'N/A');
      const descWidth = itemColWidths[1] - 6; // Available width minus padding
      const maxCharsPerLine = Math.floor(descWidth / 2.3); // Approximate chars that fit
      
      // Split description into multiple lines if needed
      const descLines = [];
      if (desc.length <= maxCharsPerLine) {
        descLines.push(desc);
      } else {
        const words = desc.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) descLines.push(currentLine);
            currentLine = word;
            // Limit to 2 lines to maintain table structure
            if (descLines.length >= 2) {
              break;
            }
          }
        }
        if (currentLine && descLines.length < 2) {
          descLines.push(currentLine);
        }
        
        // If still too long, truncate the last line with ellipsis
        if (descLines.length >= 2 && currentLine && currentLine !== descLines[descLines.length - 1]) {
          const lastLine = descLines[descLines.length - 1];
          if (lastLine.length > maxCharsPerLine - 3) {
            descLines[descLines.length - 1] = lastLine.substring(0, maxCharsPerLine - 3) + '...';
          } else {
            descLines[descLines.length - 1] = lastLine + '...';
          }
        }
      }
      
      // Display description lines
      descLines.forEach((line, lineIndex) => {
        const lineY = rowY + 4 + (lineIndex * 3);
        doc.text(line, tableColPositions[1] + 3, lineY);
      });
      
      // Column 2: Qty (right aligned)
      const qty = parseFloat(item.quantity.toString()).toFixed(2);
      doc.text(qty, tableColPositions[2] + itemColWidths[2] - 3, rowY + 6.5, { align: 'right' });
      
      // Column 3: Unit (centered)
      doc.text(item.unit || 'N/A', tableColPositions[3] + itemColWidths[3] / 2, rowY + 6.5, { align: 'center' });
      
      // Column 4: Rate (right aligned)
      doc.text(formatCurrency(item.rate), tableColPositions[4] + itemColWidths[4] - 3, rowY + 6.5, { align: 'right' });
      
      // Column 5: Amount (right aligned)
      doc.text(formatCurrency(item.amount), tableColPositions[5] + itemColWidths[5] - 3, rowY + 6.5, { align: 'right' });
      
      // Column 6: GST (right aligned)
      const gstAmount = item.gstRate === 0 ? 0 : (item.gstAmount || 0);
      doc.text(formatCurrency(gstAmount), tableColPositions[6] + itemColWidths[6] - 3, rowY + 6.5, { align: 'right' });
      
      // Column 7: Total (right aligned, bold for emphasis)
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.totalAmount), tableColPositions[7] + itemColWidths[7] - 3, rowY + 6.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += rowHeight;
    });

    // Final table border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + totalTableWidth, currentY);

    currentY += 8;

    // ===================== BANK DETAILS =====================
    doc.setFillColor(39, 174, 96);
    doc.rect(margin, currentY, 80, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK DETAILS', margin + 2, currentY + 6);

    currentY += 8;
    
    doc.setFillColor(240, 250, 240);
    doc.rect(margin, currentY, 80, 22, 'F');
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY, 80, 22);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    doc.text('Bank: State Bank of India', margin + 3, currentY + 4);
    doc.text('A/c: 40464693538', margin + 3, currentY + 8);
    doc.text('Branch: Paltan Bazar', margin + 3, currentY + 12);
    doc.text('IFSC: SBIN0040464', margin + 3, currentY + 16);
    doc.text('Name: M/S SRI HM BITUMEN CO', margin + 3, currentY + 20);

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
      doc.setFontSize(8);
      
      // Label on left
      doc.text(item.label, summaryX + 2, summaryY + 5);
      
      // Amount on right with rupee symbol using text directly
      const amountText = formatCurrency(item.value);
      doc.text('Rs. ' + amountText, summaryX + summaryWidth - 2, summaryY + 5, { align: 'right' });

      summaryY += 7;
    });

    currentY = Math.max(currentY + 15, summaryY + 3);

    // ===================== SIGNATURE SECTION =====================
    // Ensure signature fits within page
    if (currentY > pageHeight - margin - 40) {
      currentY = pageHeight - margin - 40;
    }
    
    currentY += 3;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 6;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Sales Person: ${quotationData.salesPersonName || 'System Administrator'}`, margin, currentY);

    // Authorized Signatory on right with stamp
    const sigX = pageWidth - margin - 60;
    doc.text('For M/S SRI HM BITUMEN CO', sigX, currentY);
    
    currentY += 6;
    
    // Stamp image - load and embed if available (smaller size)
    const stampY = currentY;
    if (stampBase64) {
      try {
        doc.addImage(stampBase64, 'PNG', sigX, stampY, 30, 30);
      } catch (err) {
        console.error('Failed to add stamp image:', err);
      }
    }

    currentY += 32;
    // Only add signature line if there's room
    if (currentY < pageHeight - margin - 2) {
      doc.setLineWidth(0.3);
      doc.line(sigX, currentY, sigX + 40, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Authorized Signatory', sigX + 3, currentY + 3);
    }

    // Save PDF
    const fileName = `Quotation_${(quotationData.quotationNumber || 'UNKNOWN').replace(/[\/\\]/g, '_')}.pdf`;
    doc.save(fileName);

    return doc;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
