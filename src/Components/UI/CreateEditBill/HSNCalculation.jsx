import React, { useEffect, useState } from "react";

export default function HSNCalculation({ lineItems, HSNData, setHSNData }) {
  const calculateHSN = () => {
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
        setHSNData(HSNCopy);
      }
    });
  };

  useEffect(() => {
    calculateHSN();
  }, [lineItems]);

  return HSNData.length !== 0 ? (
    <>
      <h3 className="text-lg text-gray-700 font-semibold mb-4">
        HSN/SAC Calculation
      </h3>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="">
            <th className="px-4 py-2 text-gray-700 border-b">HSN/SAC Code</th>
            <th className="px-4 py-2 text-gray-700 border-b">Total</th>
            <th className="px-4 py-2 text-gray-700 border-b">Tax %</th>
            <th className="px-4 py-2 text-gray-700 border-b">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {HSNData.map((item) => (
            <tr key={item.hsnCode}>
              <td className="px-4 text-center py-2 border-b border-r text-gray-700 border-gray-300">
                {item.hsnCode}
              </td>
              <td className="px-4 text-center py-2 border-b border-r text-gray-700 border-gray-300">
                {item.total.toFixed(2) || 0}
              </td>
              <td className="px-4 text-center py-2 border-b border-r text-gray-700 border-gray-300">
                {item.tax || 0}%
              </td>
              <td className="px-4 text-center py-2 border-b text-gray-700 border-gray-300">
                {item.totalTax.toFixed(2) || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : (
    <></>
  );
}
