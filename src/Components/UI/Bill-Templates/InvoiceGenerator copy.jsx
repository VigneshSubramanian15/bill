import { jsPDF } from "jspdf";
import GetNumberToWords from "@/Components/Util/numberToWords";
import "jspdf-autotable";

// Sample invoice data - in a real app, you would get this from your database or form
const invoiceData = {
  company: {
    name: "Acme Corporation",
    addressLine1: "123 Business Avenue",
    addressLine2: "Suite 456",
    contact: "+1 (555) 123-4567",
  },
  invoice: {
    number: "INV-2025-0001",
    date: new Date().toLocaleDateString(),
  },
  customer: {
    name: "John Doe",
    addressLine1: "789 Customer Street",
    contact: "+1 (555) 987-6543",
  },
  items: [
    { description: "Web Development Services", quantity: 1, rate: 1500, amount: 1500 },
    { description: "UI/UX Design", quantity: 1, rate: 800, amount: 800 },
    { description: "Content Creation", quantity: 10, rate: 50, amount: 500 },
  ],
  summary: {
    subTotal: 2800,
    tax: 280,
    discount: 100,
    total: 2980,
  },
  signature: "John Smith",
  footer: "Thank you for your business!",
};

// Generate PDF
export default function generateInvoicePdf(companyInfo, billData) {
  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoiceData.invoice.number}`,
    author: invoiceData.company.name,
    subject: "Invoice",
    keywords: "invoice, bill, payment",
  });

  // Add styling variables
  const primaryColor = [0, 166, 62]; // RGB for #2980b9
  const secondaryColor = [52, 73, 94]; // RGB for #34495e
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Company logo placeholder
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, margin, 40, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(invoiceData.company.name.substring(0, 5).toUpperCase(), margin + 20, margin + 8, { align: "center" });

  // Add "INVOICE" title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, margin + 8, { align: "right" });

  // Add company details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.company.name, margin, margin + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceData.company.addressLine1, margin, margin + 30);
  doc.text(invoiceData.company.addressLine2, margin, margin + 35);
  doc.text(invoiceData.company.contact, margin, margin + 40);

  // Add invoice details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", pageWidth - margin - 60, margin + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice Number: ${invoiceData.invoice.number}`, pageWidth - margin - 60, margin + 30);
  doc.text(`Date: ${invoiceData.invoice.date}`, pageWidth - margin - 60, margin + 35);

  // Add separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, margin + 45, pageWidth - margin, margin + 45);

  // Add customer details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, margin + 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceData.customer.name, margin, margin + 60);
  doc.text(invoiceData.customer.addressLine1, margin, margin + 65);
  doc.text(invoiceData.customer.contact, margin, margin + 70);

  // Add line items table
  const tableStartY = margin + 80;

  // Table headers and data
  const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
  const tableRows = [];

  // Add data to table rows
  invoiceData.items.forEach((item) => {
    const tableRow = [
      item.description,
      item.quantity.toString(),
      `$${item.rate.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`,
    ];
    tableRows.push(tableRow);
  });

  // Create table
  doc.autoTable({
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: margin, right: margin },
    theme: "grid",
    tableWidth: "auto",
  });

  // Get the Y position after the table
  const finalY = doc.lastAutoTable.finalY;

  // Add summary
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sub Total:", pageWidth - margin - 60, finalY + 10);
  doc.text("Tax (10%):", pageWidth - margin - 60, finalY + 15);
  doc.text("Discount:", pageWidth - margin - 60, finalY + 20);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", pageWidth - margin - 60, finalY + 30);

  // Add summary values
  doc.setFont("helvetica", "normal");
  doc.text(`$${invoiceData.summary.subTotal.toFixed(2)}`, pageWidth - margin, finalY + 10, { align: "right" });
  doc.text(`$${invoiceData.summary.tax.toFixed(2)}`, pageWidth - margin, finalY + 15, { align: "right" });
  doc.text(`$${invoiceData.summary.discount.toFixed(2)}`, pageWidth - margin, finalY + 20, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(`$${invoiceData.summary.total.toFixed(2)}`, pageWidth - margin, finalY + 30, { align: "right" });

  // Add separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(pageWidth - margin - 60, finalY + 25, pageWidth - margin, finalY + 25);

  // Add amount in words
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Amount in words:", margin, finalY + 40);
  doc.setFont("helvetica", "italic");
  doc.text(GetNumberToWords(invoiceData.summary.total), margin + 30, finalY + 40);

  // Add separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, finalY + 50, pageWidth - margin, finalY + 50);

  // Add signature
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signature", pageWidth - margin - 30, finalY + 60, { align: "center" });
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - margin - 60, finalY + 55, pageWidth - margin, finalY + 55);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.signature, pageWidth - margin - 30, finalY + 65, { align: "center" });

  // Add footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(invoiceData.footer, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

  // Save the PDF
  doc.save(`Invoice_${invoiceData.invoice.number}.pdf`);
}
