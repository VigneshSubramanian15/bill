import GetNumberToWords from "@/Components/Util/numberToWords";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generateInvoicePdf(companyInfo, billData) {
  const computedItems = billData.items.map((item) => {
    const total = Number(item.itemQty) * Number(item.itemPrice);
    return {
      description: item.itemName,
      qty: item.itemQty,
      rate: Number(item.itemPrice).toFixed(2),
      total: total.toFixed(2),
    };
  });

  const subtotal = computedItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const taxAmount = (subtotal * (Number(billData.tax) || 0)) / 100;
  const discountAmount = (subtotal * (Number(billData.discount) || 0)) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
  });

  // Some margin and font definitions
  const leftMargin = 40;
  let currentY = 40; // vertical position
  const headerFontSize = 14;
  const normalFontSize = 10;
  const boldFontSize = 10;
  const rightMargin = 400; // for right-side text alignment

  // -----------------------------
  // 1. Title / Header Section
  // -----------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(headerFontSize);
  // Company Name
  doc.text(companyInfo.name, leftMargin, currentY);

  // Company address, city, and phone
  doc.setFontSize(normalFontSize);
  doc.setFont("helvetica", "normal");

  currentY += 14;
  doc.text(companyInfo.address, leftMargin, currentY);

  currentY += 14;
  if (companyInfo.city) {
    doc.text(companyInfo.city, leftMargin, currentY);
    currentY += 14;
  }

  if (companyInfo.number) {
    doc.text(`${companyInfo.number}`, leftMargin, currentY);
    currentY += 14;
  }

  // Bill Number, Date, etc. on the right side
  doc.setFontSize(boldFontSize);
  doc.setFont("helvetica", "bold");
  let rightSideY = 40;
  doc.text(`Bill Number: ${billData.billNumber}`, rightMargin, rightSideY, { align: "left" });
  rightSideY += 14;
  doc.text(`Date: ${new Date(billData.date).toLocaleDateString()}`, rightMargin, rightSideY, { align: "left" });

  // Horizontal line below header
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 80, 550, 80);

  // -----------------------------
  // 2. Billing Information
  // -----------------------------
  currentY = 100;
  doc.setFontSize(boldFontSize);
  doc.text("Bill To:", leftMargin, currentY);

  doc.setFontSize(normalFontSize);
  doc.setFont("helvetica", "normal");
  currentY += 14;
  doc.text(`${billData.customer.name}`, leftMargin, currentY);

  currentY += 14;
  doc.text(`Customer Number: ${billData.customer.number}`, leftMargin, currentY);

  if (billData.customer.address) {
    currentY += 14;
    doc.text(billData.customer.address, leftMargin, currentY);
  }

  // Right side: meta data (if any)
  let metaSectionY = 100;
  if (billData.metaData && billData.metaData.length > 0) {
    billData.metaData.forEach((meta) => {
      doc.setFontSize(normalFontSize);
      doc.setFont("helvetica", "normal");

      // Example of boolean vs. non-boolean data
      if (meta.dataType !== "Boolean") {
        doc.text(`${meta.label}: ${meta.value}`, rightMargin, metaSectionY, { align: "left" });
      } else {
        // Simple [X] / [ ] approach for booleans
        const checkBox = meta.value ? "[X]" : "[ ]";
        doc.text(`${meta.label}: ${checkBox}`, rightMargin, metaSectionY, { align: "left" });
      }
      metaSectionY += 14;
    });
  }

  // -----------------------------
  // 3. Table of Items
  // -----------------------------
  const tableHeaders = [
    [
      { content: "Item Description", styles: { halign: "left", fontStyle: "bold" } },
      { content: "Qty", styles: { halign: "center", fontStyle: "bold" } },
      { content: "Rate", styles: { halign: "center", fontStyle: "bold" } },
      { content: "Total", styles: { halign: "center", fontStyle: "bold" } },
    ],
  ];

  // Transform the computedItems into the array format autoTable expects
  const tableBody = computedItems.map((item) => [item.description, item.qty.toString(), item.rate, item.total]);

  const startY = 150; // where table should start
  autoTable(doc, {
    startY,
    head: tableHeaders,
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    bodyStyles: {
      lineWidth: 0.1,
    },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 240 },
      1: { halign: "center", cellWidth: 60 },
      2: { halign: "center", cellWidth: 70 },
      3: { halign: "center", cellWidth: 70 },
    },
  });

  // Calculate where the table ends
  const tableFinalY = doc.lastAutoTable.finalY;

  // -----------------------------
  // 4. Subtotal / Totals Section
  // -----------------------------
  let totalsY = tableFinalY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(boldFontSize);

  // Subtotal
  doc.text("Subtotal:", leftMargin + 300, totalsY, { align: "right" });
  doc.text(subtotal.toFixed(2), leftMargin + 400, totalsY, { align: "right" });

  totalsY += 14;
  // Tax
  doc.text(`Tax (${billData.tax || 0}%):`, leftMargin + 300, totalsY, { align: "right" });
  doc.text(taxAmount.toFixed(2), leftMargin + 400, totalsY, { align: "right" });

  totalsY += 14;
  // Discount
  doc.text(`Discount (${billData.discount || 0}%):`, leftMargin + 300, totalsY, { align: "right" });
  doc.text(`-${discountAmount.toFixed(2)}`, leftMargin + 400, totalsY, { align: "right" });

  totalsY += 20;
  doc.setFontSize(headerFontSize);
  doc.text(`Total: ₹${grandTotal.toFixed(2)}`, leftMargin + 350, totalsY, { align: "right" });

  // -----------------------------
  // 5. Amount in Words / Footer
  // -----------------------------
  totalsY += 30;
  doc.setFontSize(normalFontSize);
  doc.setFont("helvetica", "italic");

  doc.text(`Total amount in words: ${GetNumberToWords(grandTotal.toFixed(2))}`, leftMargin, totalsY);

  totalsY += 30;
  doc.setFontSize(boldFontSize);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for your business!", leftMargin, totalsY);

  // Optional line
  totalsY += 20;
  doc.setLineWidth(0.5);
  doc.line(leftMargin, totalsY, 550, totalsY);

  // -----------------------------
  // Save the PDF
  // -----------------------------
  doc.save(`Bill-${billData.billNumber}.pdf`);
}
