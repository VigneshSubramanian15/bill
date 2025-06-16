import React from "react";
import { Plus, Minus } from "lucide-react";

export default function LineItemsTable({
  lineItems,
  MetaFields,
  handleLineItemChange,
  removeLineItem,
  addLineItem,
  isHSN,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        <button
          onClick={addLineItem}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus size={16} className="mr-1" />
          Add Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              {MetaFields.lineItem?.map((meta) => (
                <th
                  key={`header-${meta.name}`}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {meta.label}
                </th>
              ))}
              {isHSN && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HSN/SAC Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Percentage
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lineItems.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleLineItemChange(index, "name", e.target.value)
                    }
                    style={{ minWidth: 220 }}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Item name"
                  />
                </td>
                {MetaFields.lineItem?.map((meta) => {
                  return (
                    <td key={meta.name} className="px-4 py-2">
                      <input
                        type={meta.dataType === "Number" ? "number" : "text"}
                        placeholder={meta.label}
                        value={item?.metaData?.[meta.name]}
                        style={{ minWidth: 200 }}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            meta.name,
                            e.target.value.replace(/^0+/, ""),
                            true,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </td>
                  );
                })}
                {isHSN && (
                  <>
                    <td className="flex gap-2 px-4 py-2">
                      <input
                        type="text"
                        value={item.hsnCode}
                        onChange={(e) =>
                          handleLineItemChange(index, "hsnCode", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="HSN/SAC"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "taxRate",
                            e.target.value,
                            false,
                            true,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tax Rate (%)"
                      />
                    </td>
                  </>
                )}
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    style={{ minWidth: 70 }}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "quantity",
                        e.target.value.replace(/^0+/, "") || 0,
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.rate}
                    style={{ minWidth: 100 }}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "rate",
                        e.target.value.replace(/^0+/, "") || 0,
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="text-gray-900 font-medium">
                    ₹{item.total.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
