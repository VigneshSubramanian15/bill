import React, { useState } from "react";
import { Plus, Minus, Printer, Save } from "lucide-react";
import { cn } from "../Util/utils";

const mockCustomers = [
  { id: "CUST001", name: "Tech Solutions Inc", email: "billing@techsolutions.com" },
  { id: "CUST002", name: "Global Innovations", email: "accounts@globalinnovations.com" },
  { id: "CUST003", name: "Digital Dynamics", email: "finance@digitaldynamics.com" },
];

export function CreateEditBill() {
  const [billNumber] = useState(
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [lineItems, setLineItems] = useState([{ id: "1", name: "", quantity: 1, rate: 0, total: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.id.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setCustomerId(customer.id);
    setCustomerSearch(customer.id);
    setShowCustomerDropdown(false);
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
      total:
        field === "quantity" || field === "rate"
          ? Number(newLineItems[index].quantity) * Number(newLineItems[index].rate)
          : newLineItems[index].total,
    };
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: String(lineItems.length + 1), name: "", quantity: 1, rate: 0, total: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const handleSave = () => {
    console.log("Saving bill...");
  };

  const handlePrint = () => {
    console.log("Printing bill...");
  };

  return (
    <div className="space-y-6 mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-gray-600">Fill in the details to create a new bill</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer size={20} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save size={20} className="mr-2" />
            Save Bill
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Number</label>
            <input
              type="text"
              value={billNumber}
              disabled
              className="bg-gray-50 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter customer ID or name"
          />
          {showCustomerDropdown && customerSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                        onChange={(e) => handleLineItemChange(index, "name", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, "quantity", Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleLineItemChange(index, "rate", Number(e.target.value))}
                        className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-900 font-medium">${item.total.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => removeLineItem(index)} className="text-red-600 hover:text-red-800">
                        <Minus size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="w-full max-w-md ml-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
