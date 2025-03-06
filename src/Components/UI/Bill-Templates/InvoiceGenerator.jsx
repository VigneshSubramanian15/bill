import { jsPDF } from "jspdf";
import GetNumberToWords from "@/Components/Util/numberToWords";
import "jspdf-autotable";

export default function generateInvoicePdf(companyInfo, billData) {
  const doc = new jsPDF();

  // Calculate items and amounts
  const computedItems = billData.items.map((item) => ({
    description: item.itemName,
    quantity: item.itemQty,
    rate: item.itemPrice,
    amount: item.itemQty * item.itemPrice,
  }));

  // Calculate financial values
  const subTotal = computedItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subTotal * (Number(billData.tax) || 0)) / 100;
  const discountAmount = (subTotal * (Number(billData.discount) || 0)) / 100;
  const grandTotal = subTotal + taxAmount - discountAmount;

  // Dynamic invoice data
  const invoiceData = {
    company: {
      name: companyInfo.name,
      addressLine1: companyInfo.address,
      addressLine2: companyInfo.city,
      contact: companyInfo.number,
    },
    invoice: {
      number: billData.billNumber,
      date: new Date(billData.date).toLocaleDateString(),
    },
    customer: {
      name: billData.customer.name,
      addressLine1: billData.customer.address,
      contact: billData.customer.number,
    },
    items: computedItems,
    summary: {
      subTotal: subTotal,
      tax: taxAmount,
      discount: discountAmount,
      total: grandTotal,
    },
    signature: companyInfo.signature || "Authorized Signature",
    footer: `${companyInfo.name}\n${companyInfo.number}`,
  };

  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoiceData.invoice.number}`,
    author: invoiceData.company.name,
    subject: "Invoice",
    keywords: "invoice, bill, payment",
  });

  // Styling variables
  const primaryColor = [0, 166, 62];
  const secondaryColor = [52, 73, 94];
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Company logo placeholder
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, margin, 40, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(invoiceData.company.name.substring(0, 5).toUpperCase(), margin + 20, margin + 8, { align: "center" });

  // Invoice title
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, margin + 8, { align: "right" });

  // Company details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.company.name, margin, margin + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceData.company.addressLine1, margin, margin + 30);
  doc.text(invoiceData.company.addressLine2, margin, margin + 35);
  doc.text(invoiceData.company.contact, margin, margin + 40);

  // Invoice details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", pageWidth - margin - 60, margin + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice Number: ${invoiceData.invoice.number}`, pageWidth - margin - 60, margin + 30);
  doc.text(`Date: ${invoiceData.invoice.date}`, pageWidth - margin - 60, margin + 35);

  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, margin + 45, pageWidth - margin, margin + 45);

  // Customer details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, margin + 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceData.customer.name, margin, margin + 60);
  doc.text(invoiceData.customer.addressLine1, margin, margin + 65);
  doc.text(invoiceData.customer.contact, margin, margin + 70);

  // Items table
  const tableStartY = margin + 80;
  const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
  const tableRows = invoiceData.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.rate.toFixed(2),
    item.amount.toFixed(2),
  ]);

  doc.autoTable({
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center", // Center align all headers
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" }, // Description - left aligned
      1: { cellWidth: 20, halign: "center" }, // Quantity - center aligned
      2: { cellWidth: 30, halign: "center" }, // Rate - right aligned
      3: { cellWidth: 30, halign: "center" }, // Amount - right aligned
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    margin: { left: margin, right: margin },
    theme: "grid",
  });

  const finalY = doc.lastAutoTable.finalY;

  // Summary
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sub Total:", pageWidth - margin - 60, finalY + 10);
  doc.text(`${invoiceData.summary.subTotal.toFixed(2)}`, pageWidth - margin, finalY + 10, { align: "right" });
  doc.text("Tax:", pageWidth - margin - 60, finalY + 15);
  doc.text(`${invoiceData.summary.tax.toFixed(2)}`, pageWidth - margin, finalY + 15, { align: "right" });
  doc.text("Discount:", pageWidth - margin - 60, finalY + 20);
  doc.text(`-${invoiceData.summary.discount.toFixed(2)}`, pageWidth - margin, finalY + 20, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", pageWidth - margin - 60, finalY + 30);
  doc.text(`Rs ${invoiceData.summary.total.toFixed(2)}`, pageWidth - margin, finalY + 30, { align: "right" });

  // Amount in words
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Amount in words:", margin, finalY + 40);
  doc.setFont("helvetica", "italic");
  doc.text(GetNumberToWords(invoiceData.summary.total.toFixed(0)), margin + 30, finalY + 40);

  // Signature
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signature", pageWidth - margin - 30, finalY + 60, { align: "center" });
  doc.line(pageWidth - margin - 60, finalY + 55, pageWidth - margin, finalY + 55);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.signature, pageWidth - margin - 30, finalY + 65, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(invoiceData.footer, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

  // Save PDF
  doc.save(`Invoice_${invoiceData.invoice.number}.pdf`);
}
