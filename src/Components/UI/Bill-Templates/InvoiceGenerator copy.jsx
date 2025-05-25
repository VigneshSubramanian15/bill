// InvoiceGenerator.js
import { jsPDF } from "jspdf";
import GetNumberToWords from "@/Components/Util/numberToWords";
import "jspdf-autotable";

export default function generateInvoicePdf(
  companyInfo,
  billData,
  sendToWhatsApp = false,
) {
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
      addressLine1: companyInfo.address, // May contain multiple lines separated by "\n"
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

  // Invoice title (top right)
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Invoice Number: ${invoiceData.invoice.number}`,
    pageWidth - margin,
    margin,
    { align: "right" },
  );

  // Company details (top left)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.company.name, margin, margin + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  // Handle multi-line for addressLine1 by splitting at "\n"
  const addressLines = invoiceData.company.addressLine1.split("\n");
  let currentY = margin + 15;
  addressLines.forEach((line) => {
    doc.text(line.trim(), margin, currentY);
    currentY += 5; // Adjust line spacing as needed
  });
  // Print addressLine2 and contact after the multi-line address
  doc.text(invoiceData.company.addressLine2, margin, currentY);
  currentY += 5;
  doc.text(invoiceData.company.contact, margin, currentY);

  // Invoice details (top right, below invoice title)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", pageWidth - margin - 60, margin + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Date: ${invoiceData.invoice.date}`,
    pageWidth - margin - 60,
    margin + 15,
  );

  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, currentY + 5, pageWidth - margin, currentY + 5);

  // Customer details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, currentY + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceData.customer.name, margin, currentY + 20);
  doc.text(invoiceData.customer.addressLine1, margin, currentY + 25);
  doc.text(invoiceData.customer.contact, margin, currentY + 30);

  // Items table
  const tableStartY = currentY + 40;
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
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
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
  doc.text(
    `${invoiceData.summary.subTotal.toFixed(2)}`,
    pageWidth - margin,
    finalY + 10,
    { align: "right" },
  );
  doc.text("Tax:", pageWidth - margin - 60, finalY + 15);
  doc.text(
    `${invoiceData.summary.tax.toFixed(2)}`,
    pageWidth - margin,
    finalY + 15,
    { align: "right" },
  );
  doc.text("Discount:", pageWidth - margin - 60, finalY + 20);
  doc.text(
    `-${invoiceData.summary.discount.toFixed(2)}`,
    pageWidth - margin,
    finalY + 20,
    { align: "right" },
  );
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", pageWidth - margin - 60, finalY + 30);
  doc.text(
    `Rs ${invoiceData.summary.total.toFixed(2)}`,
    pageWidth - margin,
    finalY + 30,
    { align: "right" },
  );

  // Amount in words
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Amount in words:", margin, finalY + 40);
  doc.setFont("helvetica", "italic");
  doc.text(
    GetNumberToWords(invoiceData.summary.total.toFixed(0)),
    margin + 30,
    finalY + 40,
  );

  // Signature
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signature", pageWidth - margin - 30, finalY + 60, {
    align: "center",
  });
  doc.line(
    pageWidth - margin - 60,
    finalY + 55,
    pageWidth - margin,
    finalY + 55,
  );
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.signature, pageWidth - margin - 30, finalY + 65, {
    align: "center",
  });

  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    invoiceData.footer,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" },
  );

  if (sendToWhatsApp) {
    const pdfBlob = doc.output("blob");
    const fileName = `Invoice_${invoiceData.invoice.number}.pdf`;
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator
        .share({
          files: [file],
          title: `Invoice ${invoiceData.invoice.number}`,
          text: `Please find attached invoice ${invoiceData.invoice.number}.`,
        })
        .then(() => {
          console.log("Share was successful.");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      console.error("File sharing is not supported on this device/browser.");
      doc.save(fileName);
    }
  } else {
    doc.save(`Invoice_${invoiceData.invoice.number}.pdf`);
  }
}
