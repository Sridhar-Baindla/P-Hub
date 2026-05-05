import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (order) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22); // Primary color
  doc.text('P-HUB PHARMACY', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Premium Healthcare & Medicines', 14, 28);
  
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('INVOICE', pageWidth - 50, 22);
  
  // Divider
  doc.setDrawColor(240);
  doc.line(14, 35, pageWidth - 14, 35);
  
  // Order Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Order ID:', 14, 45);
  doc.setTextColor(0);
  doc.text(`#${order.id || 'N/A'}`, 40, 45);
  
  doc.setTextColor(100);
  doc.text('Date:', 14, 52);
  doc.setTextColor(0);
  doc.text(new Date(order.orderDate).toLocaleDateString(), 40, 52);
  
  doc.setTextColor(100);
  doc.text('Transaction ID:', 14, 59);
  doc.setTextColor(0);
  doc.text(order.transactionId || 'SIM-PAY-001', 40, 59);

  // Billing Info
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 75);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(order.shippingAddress.split(',')[0], 14, 82);
  doc.text(order.shippingAddress.split(',').slice(1).join(','), 14, 88);
  doc.text(`Phone: ${order.contactNumber}`, 14, 94);
  
  // Table
  const tableColumn = ["Item", "Price", "Qty", "Subtotal"];
  const tableRows = [];

  order.items.forEach(item => {
    const itemData = [
      item.name,
      `INR ${item.price.toFixed(2)}`,
      item.quantity,
      `INR ${(item.price * item.quantity).toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 105,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillStyle: 'var(--primary)', fillColor: [249, 115, 22] },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 60, finalY);
  doc.text(`INR ${(order.totalAmount - 50).toFixed(2)}`, pageWidth - 30, finalY, { align: 'right' });
  
  doc.text('Delivery Fee:', pageWidth - 60, finalY + 7);
  doc.text('INR 50.00', pageWidth - 30, finalY + 7, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setTextColor(249, 115, 22);
  doc.text('Total Amount:', pageWidth - 60, finalY + 16);
  doc.text(`INR ${order.totalAmount.toFixed(2)}`, pageWidth - 30, finalY + 16, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('This is a computer generated invoice and does not require a signature.', pageWidth / 2, pageWidth + 60, { align: 'center' });
  doc.text('Thank you for shopping with P-Hub!', pageWidth / 2, pageWidth + 67, { align: 'center' });

  doc.save(`Invoice_PHub_${order.id}.pdf`);
};
