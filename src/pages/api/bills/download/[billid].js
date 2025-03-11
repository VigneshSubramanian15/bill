import Bill from "@/Components/Models/Bill";
import generateInvoicePdf from "@/Components/UI/Bill-Templates/InvoiceGenerator";
import Company from "@/Components/Models/CompanySchema";

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return res.status(405).end("Method Not Allowed");
        }

        const { billid: id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing bill id in query parameters" });
        }

        const billData = await Bill.findById(id)
        if (!billData) {
            return res.status(500).json({ error: "Failed to load bill data" });
        }
        const { name, address, phoneNumber } = await Company.findById(billData.companyId).select(["name", "address", "phoneNumber", "-_id"])
        if (!name && !address && !phoneNumber) {
            return res.status(500).json({ error: "Failed to load bill data" });
        }
        const companyInfo = {
            name,
            address: address[0],
            city: address[1],
            number: phoneNumber,
        };
        console.log({ companyInfo, billData })
        const pdfArrayBuffer = generateInvoicePdf(companyInfo, billData, false, true);

        // Set headers so the PDF is downloaded
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Invoice_${billData.billNumber}.pdf`);

        // Convert ArrayBuffer to Buffer (Node.js)
        const pdfBuffer = Buffer.from(new Uint8Array(pdfArrayBuffer));
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Server error", message: error.message });
    }
}
