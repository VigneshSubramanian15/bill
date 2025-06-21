import React, { useEffect, useRef, useState } from "react";
import { Download, Printer, SquareCheckIcon, Square } from "lucide-react";
import GetNumberToWords from "../../Util/numberToWords";
import generateInvoicePdf from "./InvoiceGenerator";
import { useSelector } from "react-redux";

export function DefaultBillTemplate({ companyInfo, billData }) {
  const divRef = useRef(null);
  const [lineItems, setLineItems] = useState([]);
  const [metaHeader, setMetaHeader] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [metaCalculation, setMetaCalculation] = useState(0);
  // HSN related state
  const [HSNData, setHSNData] = useState([]);
  const login = useSelector((state) => state?.login);
  const isHSN = login?.companyModules?.HSN || false;

  const handlePrint = () => {
    window.print();
  };

  const calculateHSN = () => {
    console.log("Calculating HSN Data...");
    let HSNCopy = [];

    if (!lineItems || lineItems.length === 0) return;
    lineItems.forEach((item) => {
      if (item.hsnCode) {
        const hsnItemIndex = HSNCopy.findIndex(
          (hsnItem) => hsnItem.hsnCode === item.hsnCode,
        );
        if (hsnItemIndex === -1) {
          HSNCopy.push({
            hsnCode: item.hsnCode,
            total: item.total,
            tax: item.taxRate,
            totalTax: item.total * (item.taxRate / 100),
          });
        } else {
          HSNCopy[hsnItemIndex] = {
            hsnCode: item.hsnCode,
            total: HSNCopy[hsnItemIndex].total + item.total,
            tax: item.taxRate,
            totalTax:
              (HSNCopy[hsnItemIndex].total + item.total) * (item.taxRate / 100),
          };
        }
        console.log("HSN Data:", { HSNCopy });
        setHSNData(HSNCopy);
      }
    });
  };

  const calculateHSNTax = () => {
    if (!HSNData || HSNData.length === 0) return;
    const taxAmount = HSNData.reduce((total, item) => {
      return total + item.totalTax;
    }, 0);
    const calculatedTotal =
      subtotal + taxAmount + metaCalculation - discountAmount;

    setTaxAmount(taxAmount);
    setGrandTotal(calculatedTotal);
  };

  useEffect(() => {
    const calculatedLineItems = [];
    const calculatedMetaHeader = [];
    billData.items.forEach((item, i) => {
      if (i === 0)
        item.metaData.forEach((meta) => calculatedMetaHeader.push(meta.label));
      calculatedLineItems.push({
        ...item,
        total: item.itemQty * item.itemPrice,
      });
    });
    const subtotal = calculatedLineItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const taxAmount = (subtotal * (Number(billData.tax) || 0)) / 100;
    const discountAmount = (subtotal * (Number(billData.discount) || 0)) / 100;
    const metaCalculation = billData.metaData.reduce((acc, meta) => {
      if (meta.addToTotal) {
        const value = parseFloat(meta.value) || 0;
        return acc + value;
      }
      return acc;
    }, 0);
    const calculatedTotal =
      subtotal + taxAmount + metaCalculation - discountAmount;

    setLineItems(calculatedLineItems);
    setMetaHeader(calculatedMetaHeader);
    setGrandTotal(calculatedTotal);
    setSubtotal(subtotal);
    setTaxAmount(taxAmount);
    setDiscountAmount(discountAmount);
    setMetaCalculation(metaCalculation);
  }, []);

  useEffect(() => {
    isHSN && calculateHSN();
  }, [lineItems]);

  useEffect(() => {
    if (isHSN && lineItems.length > 0) {
      calculateHSNTax();
    }
  }, [HSNData]);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white shadow-sm print:shadow-none z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl ml-12 font-semibold text-black">
            Bill Number {billData.billNumber}
          </h1>
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
            {companyInfo.logo && (
              <img
                src={companyInfo.logo}
                alt="Company Logo"
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl text-black font-bold">
                {companyInfo.name}
              </h2>
              <p
                className="text-black"
                dangerouslySetInnerHTML={{
                  __html: companyInfo.address.replace(/\\n/g, "<br>"),
                }}
              />
              <p className="text-black">{companyInfo.city}</p>
            </div>
          </div>
          <div className="text-right">
            {/* <h1 className="text-4xl text-black font-bold mb-4">INVOICE</h1> */}
            <h1 className="text-4xl text-black font-bold mb-4">
              Bill Number #{billData.billNumber}
            </h1>
            {/* <p className="text-black">Bill Number #{billData.billNumber}</p> */}
            <p className="text-black">
              Date: {new Date(billData.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-10 print:mb-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-black font-semibold mb-2">Bill To:</h3>
            <div className="border-l-4 border-black-500 pl-4">
              <p className="font-semibold text-black">
                {billData.customer.name}
              </p>
              <p className="text-black">
                Customer Number: {billData.customer.number}
              </p>
              <p className="text-black">{billData.customer.address || ""}</p>
            </div>
          </div>
          {billData?.metaData?.length && (
            <div>
              {billData.metaData.map(
                (meta, idx) =>
                  !meta.addToTotal &&
                  (meta.dataType !== "Boolean" ? (
                    <p key={idx} className="text-black">
                      {meta.label}:{" "}
                      <span className="font-semibold"> {meta.value} </span>
                    </p>
                  ) : (
                    <p key={idx} className="text-black flex">
                      {meta.label}:{" "}
                      <span
                        style={{ marginLeft: "7px" }}
                        className="font-semibold block"
                      >
                        {meta.value ? <SquareCheckIcon /> : <Square />}
                      </span>
                    </p>
                  )),
              )}
            </div>
          )}
        </div>

        <table className="w-full mb-8 print:mb-5">
          <thead>
            <tr className="text-left">
              <th className="py-2 font-semibold text-black"></th>
              <th className="py-2 font-semibold text-black">
                Item Description
              </th>
              {metaHeader.map((meta, idx) => (
                <th key={meta} className="py-2 font-semibold text-black">
                  {meta}
                </th>
              ))}
              {isHSN && (
                <>
                  <th className="py-2 font-semibold text-center text-black">
                    HSN/SAC
                  </th>
                  <th className="py-2 font-semibold text-center text-black">
                    Tax %
                  </th>
                </>
              )}
              <th className="py-2 font-semibold text-center text-black">
                Quantity
              </th>
              <th className="py-2 font-semibold text-center text-black">
                Rate
              </th>
              <th className="py-2 font-semibold text-right text-black">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="border-t border-b border-black">
            {lineItems.map((item, index) => (
              <tr key={index} className=" text-black text-sm ">
                <td
                  style={{ width: "50px" }}
                  className="py-2 print:py-1 text-center"
                >
                  <span className="font-semibold">{index + 1}</span>
                </td>
                <td className="py-2 print:py-1">{item.itemName}</td>
                {item.metaData.map((meta, idx) => (
                  <td key={idx} className="py-2 print:py-1">
                    {meta.dataType === "Boolean" ? (
                      <span className="flex items-center">
                        {meta.value ? (
                          <SquareCheckIcon size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </span>
                    ) : (
                      meta.value
                    )}
                  </td>
                ))}
                {isHSN && (
                  <>
                    <td className="py-2 print:py-1 text-center">
                      {item.hsnCode || "N/A"}
                    </td>
                    <td className="py-2 print:py-1 text-center">
                      {item.taxRate || 0}%
                    </td>
                  </>
                )}
                <td className="py-2 print:py-1 text-center">{item.itemQty}</td>
                <td className="py-2 print:py-1 text-center">
                  ₹{Number(item.itemPrice).toFixed(2)}
                </td>
                <td className="py-2 print:py-1 text-right">
                  ₹{item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          {isHSN && HSNData.length > 0 && (
            <>
              <h5 className="font-semibold text-black">HSN/SAC Calculation</h5>
              <table className="min-w-full border-b border-black mb-4">
                <thead className="border-b border-black">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-black">Code</th>
                    <th className="px-4 py-2 font-semibold text-black">
                      Total
                    </th>
                    <th className="px-4 py-2 font-semibold text-black">SGST</th>
                    <th className="px-4 py-2 font-semibold text-black">CGST</th>
                    <th className="px-4 py-2 font-semibold text-black">
                      Total Tax
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HSNData.map((item) => (
                    <tr key={item.hsnCode}>
                      <td className="px-4 text-center text-sm py-1 text-black">
                        {item.hsnCode}
                      </td>
                      <td className="px-4 text-center text-sm py-1 text-black">
                        ₹{item.total.toFixed(2) || 0}
                      </td>
                      <td className="px-4 text-center text-sm py-1 text-black">
                        <div className="flex justify-around">
                          <span>{item.tax / 2 || 0}%</span>
                          <span>₹{item.totalTax.toFixed(2) / 2 || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 text-center text-sm py-1 text-black">
                        <div>
                          <div className="flex justify-around">
                            <span>{item.tax / 2 || 0}%</span>
                            <span>₹{item.totalTax.toFixed(2) / 2 || 0}</span>
                          </div>
                        </div>
                      </td>{" "}
                      <td className="px-4 text-center text-sm py-1 text-black">
                        ₹{item.totalTax.toFixed(2) || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="flex space-x-7 justify-between items-center mb-8 print:mb-5">
          <div className="w-1/2 space-y-1"></div>
          <div className="w-1/2 space-y-1">
            <div className="flex justify-between">
              <span className="text-black">Subtotal:</span>
              <span className="font-medium text-black">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">
                Tax{isHSN ? "" : ` ${billData.tax}%`}:
              </span>
              <span className="font-medium text-black">
                ₹{taxAmount.toFixed(2)}
              </span>
            </div>
            {billData.metaData.map(
              (meta) =>
                meta.addToTotal && (
                  <div key={meta.name} className="flex justify-between">
                    <span className="text-black">{meta.label}:</span>
                    <span className="font-medium text-black">
                      ₹{metaCalculation.toFixed(2)}
                    </span>
                  </div>
                ),
            )}
            <div className="flex justify-between">
              <span className="text-black">
                Discount ({billData.discount}%):
              </span>
              <span className="font-medium text-black">
                -₹{discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-black font-bold text-lg">
              <span>Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-black">
          Total Amount In Words -{" "}
          <span className="font-extrabold text-black">
            {GetNumberToWords(grandTotal.toFixed(0))}
          </span>
        </div>
        <div className="mt-5 print:mt-1.5 mr-10 text-black text-right">
          Signature
        </div>

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
