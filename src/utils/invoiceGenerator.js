import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';

export const generateInvoice = (order) => {
  if (!order) {
    console.error("No order data provided to generateInvoice");
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Professional Theme Colors (Clean & Minimalist)
    const primaryColor = [31, 41, 55]; // Dark Slate
    const accentColor = [37, 99, 235];  // PHUB Blue
    const borderGrey = [229, 231, 235];

    // 1. Watermark (Center)
    const watermarkWidth = 100;
    const watermarkHeight = 100;
    try {
        // @ts-ignore
        doc.saveGraphicsState();
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.addImage(logo, 'PNG', (pageWidth - watermarkWidth) / 2, (pageHeight - watermarkHeight) / 2, watermarkWidth, watermarkHeight);
        // @ts-ignore
        doc.restoreGraphicsState();
    } catch (e) {
        console.warn("Watermark opacity failed, skipping watermark");
    }

    // 2. Clean Header (No Background)
    const logoSize = 25;
    doc.addImage(logo, 'PNG', 14, 15, logoSize, logoSize);
    
    doc.setFontSize(26);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('PHUB PHARMACY', 14 + logoSize + 5, 28);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Digital Healthcare Simplified | Genuine Medicines', 14 + logoSize + 5, 36);
    
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('INVOICE', pageWidth - 14, 28, { align: 'right' });
    
    // Header Border
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(14, 48, pageWidth - 14, 48);

    // 3. Metadata Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Left Column: Order Details
    doc.setFont('helvetica', 'bold');
    doc.text('Order Information:', 14, 62);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Order ID: #${order.id || 'N/A'}`, 14, 69);
    doc.text(`Date: ${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}`, 14, 75);
    doc.text(`Payment: ${order.paymentMethod || 'N/A'}`, 14, 81);
    doc.text(`Status: ${order.deliveryStatus || 'Placed'}`, 14, 87);

    // Right Column: Shipping Details
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', pageWidth / 2 + 10, 62);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const address = order.shippingAddress || 'Customer Address';
    const addressLines = doc.splitTextToSize(address, (pageWidth / 2) - 24);
    doc.text(addressLines, pageWidth / 2 + 10, 69);
    doc.text(`Phone: ${order.contactNumber || 'N/A'}`, pageWidth / 2 + 10, 69 + (addressLines.length * 5));

    // 4. Ordered Items Table
    const tableColumn = ["Medicine Name", "Unit Price", "Qty", "Total"];
    const tableRows = [];

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach(item => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      const itemData = [
        item.name || 'Unknown Item',
        `Rs. ${price.toFixed(2)}`,
        qty,
        `Rs. ${(price * qty).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 105,
      head: [tableColumn],
      body: tableRows,
      theme: 'plain',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right' }
      },
      bodyStyles: {
        fillColor: null,
        textColor: [60, 60, 60]
      },
      styles: { fontSize: 9, cellPadding: 4, lineWidth: 0.1, lineColor: borderGrey },
      margin: { left: 14, right: 14 }
    });

    // 5. Financial Summary
    // @ts-ignore
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 15;
    const summaryX = pageWidth - 80;
    const totalAmount = parseFloat(order.totalAmount) || 0;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Subtotal:', summaryX, finalY);
    doc.setTextColor(0);
    doc.text(`Rs. ${totalAmount.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });

    doc.setTextColor(100);
    doc.text('Delivery Fee:', summaryX, finalY + 8);
    doc.setTextColor(16, 185, 129); // Success Green
    doc.setFont('helvetica', 'bold');
    doc.text('FREE', pageWidth - 14, finalY + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Total Amount Highlight
    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX - 5, finalY + 12, (pageWidth - summaryX) + 5, 15, 'F');
    
    doc.setFontSize(13);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', summaryX, finalY + 22);
    doc.text(`Rs. ${totalAmount.toFixed(2)}`, pageWidth - 14, finalY + 22, { align: 'right' });

    // 6. Professional Footer
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 35, pageWidth - 14, pageHeight - 35);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    const footerY = pageHeight - 25;
    doc.text('Thank you for choosing PHUB - Your Health, Our Priority!', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Healthcare Simplified | Genuine Medications Guaranteed', pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text('P-Hub Healthcare Services | www.phub.com', pageWidth / 2, footerY + 13, { align: 'center' });

    // 7. Download Trigger
    doc.save(`PHUB_Invoice_${order.id || 'Order'}.pdf`);
  } catch (error) {
    console.error("Error generating PDF invoice:", error);
    alert("Could not generate invoice. Technical Error: " + error.message);
  }
};
