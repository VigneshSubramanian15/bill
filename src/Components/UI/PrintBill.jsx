import React, { useState, useEffect } from "react";
import { Download, Printer, Palette, SquareCheckIcon, Square } from "lucide-react";
import { useRouter } from "next/router";
import { ApiRequest } from "../Util/apiRequest";
import GetNumberToWords from "../Util/numberToWords";

const defaultCompanyInfo = {
  name: "Bike Zone",
  // logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=128&h=128&fit=crop&auto=format",
  address: "Balaji Nagar",
  city: "Trichy Tanjore Highways",
  phone: "+91 98424 90088",
  email: "billing@.com",
  website: "www.company.com",
};

export function PrintBill() {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState(defaultCompanyInfo);
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (router?.query?.id) {
      ApiRequest(`/api/company`).then((res) => {
        console.log({ res: res.data });
        const { name, address, phoneNumber } = res.data;
        setCompanyInfo({ name, address: address[0], city: address[1], number: phoneNumber });
      });
      ApiRequest(`/api/bills/${router.query.id}`, "GET")
        .then((res) => {
          if (res.success) {
            setBillData(res.data);
          } else {
            setError("Failed to load bill data");
          }
        })
        .catch((err) => setError(err.message || "Failed to load bill data"));
    }
  }, [router?.query?.id]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!billData) {
    return <div className="p-4">Loading bill data...</div>;
  }

  const computedItems = billData.items.map((item) => ({
    ...item,
    total: item.itemQty * item.itemPrice,
  }));
  const subtotal = computedItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (Number(billData.tax) || 0)) / 100;
  const discountAmount = (subtotal * (Number(billData.discount) || 0)) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl ml-12 font-semibold text-green-600">Bill Number {billData.billNumber}</h1>
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={20} className="mr-2" />
              Download PDF
            </button> */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Printer size={20} color="#fff" className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-sm remove-margin my-20 p-8 print:my-0 print:shadow-none">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            {companyInfo.logo && <img src={companyInfo.logo} alt="Company Logo" className="w-16 h-16 object-contain" />}
            <div>
              <h2 className="text-2xl text-green-600 font-bold">{companyInfo.name}</h2>
              <p className="text-gray-600">{companyInfo.address}</p>
              <p className="text-gray-600">{companyInfo.city}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl text-green-600 font-bold mb-4">INVOICE</h1>
            <p className="text-gray-600">Bill Number #{billData.billNumber}</p>
            <p className="text-gray-600">Date: {new Date(billData.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-green-600 font-semibold mb-2">Bill To:</h3>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold text-gray-600">{billData.customer.name}</p>
              <p className="text-gray-600">Customer Number: {billData.customer.number}</p>
              <p className="text-gray-600">{billData.customer.address || ""}</p>
            </div>
          </div>
          {billData.metaData.length && (
            <div>
              {billData.metaData.map((meta) =>
                meta.dataType !== "Boolean" ? (
                  <p className="text-gray-600">
                    {meta.label}: <span className="font-semibold"> {meta.value} </span>
                  </p>
                ) : (
                  <p className="text-gray-600 flex">
                    {meta.label}:{" "}
                    <span style={{ marginLeft: "7px" }} className="font-semibold block">
                      {" "}
                      {meta.value ? <SquareCheckIcon /> : <Square />}{" "}
                    </span>
                  </p>
                )
              )}
            </div>
          )}
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-left">
              <th className="py-2 font-semibold text-green-600">Item Description</th>
              <th className="py-2 font-semibold text-right text-green-600">Quantity</th>
              <th className="py-2 font-semibold text-right text-green-600">Rate</th>
              <th className="py-2 font-semibold text-right text-green-600">Amount</th>
            </tr>
          </thead>
          <tbody className="border-t border-b">
            {computedItems.map((item, index) => (
              <tr key={index} className="border-b text-gray-600 last:border-b-0">
                <td className="py-3">{item.itemName}</td>
                <td className="py-3 text-right">{item.itemQty}</td>
                <td className="py-3 text-right">₹{Number(item.itemPrice).toFixed(2)}</td>
                <td className="py-3 text-right">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-1/2 ml-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-600">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax ({billData.tax}%):</span>
            <span className="font-medium text-gray-600">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount ({billData.discount}%):</span>
            <span className="font-medium text-gray-600">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 text-gray-600 border-y font-bold text-lg">
            <span>Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-5">
          Total amount in words -{" "}
          <span className="font-extrabold text-green-600">{GetNumberToWords(grandTotal.toFixed(0))}</span>{" "}
        </div>

        <div className="mt-12 pt-4 border-t text-center text-gray-600">
          <p className="font-medium">{companyInfo.name}</p>
          <p>
            {companyInfo.number}
            {/* {companyInfo.phone} | {companyInfo.email} */}
          </p>
          {/* <p>{companyInfo.website}</p> */}
        </div>
      </div>
    </div>
  );
}
