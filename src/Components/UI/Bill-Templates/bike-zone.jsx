import React, { useRef } from "react";
import { Download, Printer, SquareCheckIcon, Square } from "lucide-react";
import GetNumberToWords from "../../Util/numberToWords";
import generateInvoicePdf from "./InvoiceGenerator";

export function BikeZoneBill({ companyInfo, billData }) {
  const divRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white shadow-sm print:shadow-none z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl ml-12 font-semibold text-black">Bill Number {billData.billNumber}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => generateInvoicePdf(companyInfo, billData)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={20} className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => generateInvoicePdf(companyInfo, billData, true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={20} className="mr-2" />
              Whatsapp
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black-700"
            >
              <Printer size={20} color="#fff" className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
      <div className="mt-20 print:hidden" />
      <div
        ref={divRef}
        className="max-w-4xl mx-auto bg-white shadow-sm px-8 pt-4 print:m-4 py-0 print:p-0 print:pt-0 print:my-0 print:shadow-none"
      >
        <div className="flex justify-between items-start mb-4 print:mb-3">
          <div className="flex items-center space-x-4">
            {companyInfo.logo && <img src={companyInfo.logo} alt="Company Logo" className="w-16 h-16 object-contain" />}
            <div>
              <h2 className="text-2xl text-black font-bold">{companyInfo.name}</h2>
              <p className="text-black" dangerouslySetInnerHTML={{ __html: companyInfo.address.replace(/\\n/g, '<br>') }} />
              <p className="text-black">{companyInfo.city}</p>
            </div>
          </div>
          <div className="text-right">
            {/* <h1 className="text-4xl text-black font-bold mb-4">INVOICE</h1> */}
            <h1 className="text-4xl text-black font-bold mb-4">Bill Number #{billData.billNumber}</h1>
            {/* <p className="text-black">Bill Number #{billData.billNumber}</p> */}
            <p className="text-black">Date: {new Date(billData.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-10 print:mb-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-black font-semibold mb-2">Bill To:</h3>
            <div className="border-l-4 border-black-500 pl-4">
              <p className="font-semibold text-black">{billData.customer.name}</p>
              <p className="text-black">Customer Number: {billData.customer.number}</p>
              <p className="text-black">{billData.customer.address || ""}</p>
            </div>
          </div>
          {billData.metaData.length && (
            <div>
              {billData.metaData.map((meta, idx) =>
                meta.dataType !== "Boolean" ? (
                  <p key={idx} className="text-black">
                    {meta.label}: <span className="font-semibold"> {meta.value} </span>
                  </p>
                ) : (
                  <p key={idx} className="text-black flex">
                    {meta.label}:{" "}
                    <span style={{ marginLeft: "7px" }} className="font-semibold block">
                      {meta.value ? <SquareCheckIcon /> : <Square />}
                    </span>
                  </p>
                )
              )}
            </div>
          )}
        </div>

        <table className="w-full mb-8 print:mb-5">
          <thead>
            <tr className="text-left">
              <th className="py-2 font-semibold text-black">Item Description</th>
              <th className="py-2 font-semibold text-center text-black">Quantity</th>
              <th className="py-2 font-semibold text-center text-black">Rate</th>
              <th className="py-2 font-semibold text-right text-black">Amount</th>
            </tr>
          </thead>
          <tbody className="border-t border-b border-black">
            {computedItems.map((item, index) => (
              <tr key={index} className=" text-black text-sm ">
                <td className="py-2 print:py-1">{item.itemName}</td>
                <td className="py-2 print:py-1 text-center">{item.itemQty}</td>
                <td className="py-2 print:py-1 text-center">₹{Number(item.itemPrice).toFixed(2)}</td>
                <td className="py-2 print:py-1 text-right">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-1/2 ml-auto space-y-1">
          <div className="flex justify-between">
            <span className="text-black">Subtotal:</span>
            <span className="font-medium text-black">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Tax ({billData.tax}%):</span>
            <span className="font-medium text-black">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Discount ({billData.discount}%):</span>
            <span className="font-medium text-black">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 text-black font-bold text-lg">
            <span>Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-5 text-black">
          Total amount in words -{" "}
          <span className="font-extrabold text-black">{GetNumberToWords(grandTotal.toFixed(0))}</span>
        </div>
        <div className="mt-5 print:mt-1.5 mr-10 text-black text-right">Signature</div>

        <div className="mt-12 print:mt-5 pt-4 border-t text-center text-black">
          <p className="font-medium">{companyInfo.name}</p>
          <p>
            {companyInfo.number}
            {/* {companyInfo.phone} | {companyInfo.email} */}
          </p>
          {/* <p>{companyInfo.website}</p> */}
        </div>
        <div className="p-3 block print:hidden" />
      </div>
    </div>
  );
}
