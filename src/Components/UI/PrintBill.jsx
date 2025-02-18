import React, { useState } from "react";
import { Download, Printer, Palette } from "lucide-react";
// import { cn } from "../lib/utils";

const defaultCompanyInfo = {
  name: "Your Company Name",
  logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=128&h=128&fit=crop&auto=format",
  address: "123 Business Street",
  city: "City, State 12345",
  phone: "+1 (555) 123-4567",
  email: "billing@company.com",
  website: "www.company.com",
};

export function PrintBill({ bill }) {
  const [accentColor, setAccentColor] = useState("#16a34a");
  const [showCustomization, setShowCustomization] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(defaultCompanyInfo);

  const billData = bill || {
    number: "INV-2024-001",
    date: "2024-03-20",
    customer: {
      name: "Tech Solutions Inc",
      id: "CUST001",
      address: "456 Tech Avenue, Innovation City, ST 54321",
    },
    items: [
      { name: "Web Development Services", quantity: 1, rate: 2000, total: 2000 },
      { name: "UI/UX Design", quantity: 2, rate: 800, total: 1600 },
      { name: "Server Maintenance", quantity: 1, rate: 500, total: 500 },
    ],
    subtotal: 4100,
    tax: 10,
    taxAmount: 410,
    discount: 5,
    discountAmount: 205,
    total: 4305,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Bill Preview</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCustomization(!showCustomization)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Palette size={20} className="mr-2" />
              Customize
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={20} className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Printer size={20} className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {showCustomization && (
        <div className="print:hidden fixed right-0 top-16 w-80 bg-white border-l h-full shadow-lg p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Customize Invoice</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full h-10 p-1 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="text"
                value={companyInfo.logo}
                onChange={(e) => setCompanyInfo({ ...companyInfo, logo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className="max-w-4xl mx-auto bg-white shadow-sm my-20 p-8 print:my-0 print:shadow-none"
        style={{ "--accent-color": accentColor }}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <img src={companyInfo.logo} alt="Company Logo" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                {companyInfo.name}
              </h2>
              <p className="text-gray-600">{companyInfo.address}</p>
              <p className="text-gray-600">{companyInfo.city}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold mb-4" style={{ color: accentColor }}>
              INVOICE
            </h1>
            <p className="text-gray-600">Bill #{billData.number}</p>
            <p className="text-gray-600">Date: {billData.date}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2" style={{ color: accentColor }}>
            Bill To:
          </h3>
          <div className="border-l-4 pl-4" style={{ borderColor: accentColor }}>
            <p className="font-semibold text-gray-600">{billData.customer.name}</p>
            <p className="text-gray-600">Customer ID: {billData.customer.id}</p>
            <p className="text-gray-600">{billData.customer.address}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-left" style={{ color: accentColor }}>
              <th className="py-2 font-semibold">Item Description</th>
              <th className="py-2 font-semibold text-right">Quantity</th>
              <th className="py-2 font-semibold text-right">Rate</th>
              <th className="py-2 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="border-t border-b">
            {billData.items.map((item, index) => (
              <tr key={index} className="border-b text-gray-600 last:border-b-0">
                <td className="py-3">{item.name}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                <td className="py-3 text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-1/2 ml-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-600">${billData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax ({billData.tax}%):</span>
            <span className="font-medium text-gray-600">${billData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount ({billData.discount}%):</span>
            <span className="font-medium text-gray-600">-${billData.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 text-gray-600 border-t font-bold text-lg">
            <span>Total:</span>
            <span style={{ color: accentColor }}>${billData.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t text-center text-gray-600">
          <p className="font-medium" style={{ color: accentColor }}>
            {companyInfo.name}
          </p>
          <p>
            {companyInfo.phone} | {companyInfo.email}
          </p>
          <p>{companyInfo.website}</p>
        </div>
      </div>
    </div>
  );
}
