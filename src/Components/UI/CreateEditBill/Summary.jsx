import { SquareCheckIcon, SquareIcon } from "lucide-react";
import React from "react";

export default function Summary({
  subtotal,
  tax,
  setTax,
  setDiscount,
  discount,
  taxAmount,
  discountAmount,
  grandTotal,
  metaFields,
  metaFieldValues,
  isHSN = false,
  HSNData,
  setSubTotalInclusiveTax,
  subTotalInclusiveTax,
}) {
  const calculateHSNTax = () => {
    return HSNData.reduce((total, item) => {
      return total + item.totalTax;
    }, 0);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-300 pt-6">
      <div>
        {!isHSN ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax (%)
            </label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value.replace(/^0+/, "") || 0)}
              style={{ maxWidth: 250 }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tax (%)"
              min="0"
              max="100"
              step="1"
            />
          </div>
        ) : (
          ""
        )}
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            value={discount}
            style={{ maxWidth: 250 }}
            onChange={(e) =>
              setDiscount(e.target.value.replace(/^0+/, "") || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Discount (%)"
            min="0"
            max="100"
            step="1"
          />
        </div>
        <div
          onClick={() =>
            setSubTotalInclusiveTax((inclusiveTax) => !inclusiveTax)
          }
          className="pt-4 flex items-center align-middle cursor-pointer gap-7"
        >
          <label className="block text-sm font-medium text-gray-700 mt-1">
            Inclusive Of Tax
          </label>
          <span>
            {subTotalInclusiveTax ? (
              <SquareCheckIcon className="inline-block text-gray-500" />
            ) : (
              <SquareIcon className="inline-block text-gray-400" />
            )}
          </span>
        </div>
      </div>
      <div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900 font-medium">
              {subTotalInclusiveTax
                ? `₹${(subtotal - (isHSN ? calculateHSNTax() : taxAmount)).toFixed(2)}`
                : `₹${subtotal.toFixed(2)}`}
              {/* ₹{subtotal.toFixed(2)} */}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tax:</span>
            {!isHSN ? (
              <span className="text-gray-900 font-medium">
                ₹{taxAmount.toFixed(2)}
              </span>
            ) : (
              <span className="text-gray-900 font-medium">
                {calculateHSNTax().toFixed(2)}
              </span>
            )}
          </div>
          {metaFields?.map((meta) => {
            const value = metaFieldValues[meta.name];
            if (!meta?.addToTotal || !value) return null;
            return (
              <div
                className="flex justify-between items-center"
                key={meta.name}
              >
                <span className="text-gray-600">{meta.label}:</span>
                <span className="text-gray-900 font-medium">
                  ₹
                  {value
                    ? typeof value === "string"
                      ? parseFloat(value).toFixed(2)
                      : value.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Discount:</span>
            <span className="text-gray-900 font-medium">
              ₹{discountAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Grand Total:</span>
            <span className="text-gray-900 font-medium">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
