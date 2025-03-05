import React, { useState, useEffect } from "react";
import { Plus, Minus, Save, Square, CheckSquare2Icon } from "lucide-react";
import { useRouter } from "next/router";
import { ApiRequest } from "../Util/apiRequest";

export function CreateEditBill() {
  const router = useRouter();
  const isCreateMode = router?.query?.id ? true : false;
  const [billNumber, setBillNumber] = useState();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerInfo, setCustomerInfo] = useState("");
  const [customerFiltered, setCustomerFiltered] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [MetaFields, setMetaFields] = useState([]);
  const [MetaFieldVlaues, setMetaFieldVlaues] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [lineItems, setLineItems] = useState([{ id: "1", name: "", quantity: 1, rate: "", total: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isCreateMode) {
      const billNumberFromQuery = router.query.id;
      ApiRequest(`/api/bills/${billNumberFromQuery}`)
        .then((data) => {
          if (data.success) {
            const bill = data.data;
            setBillNumber(bill.billNumber);
            setDate(bill.metaData?.date || date);
            setCustomerId(bill.customer.id || "");
            setCustomerPhone(bill.customer.number || "");
            setCustomerName(bill.customer.name || "");
            setCustomerEmail(bill.customer.email || "");
            setCustomerAddress(bill.customer.address || "");
            setLineItems(
              bill.items.map((item, index) => ({
                id: String(index + 1),
                name: item.itemName,
                quantity: item.itemQty,
                rate: item.itemPrice,
                total: item.itemQty * item.itemPrice,
              }))
            );
            setTax(bill.tax);
            setDiscount(bill.discount);
            let metavalue = {};
            bill.metaData.map((meta) => (metavalue = { ...metavalue, [meta.name]: meta.value }));
            setMetaFieldVlaues(metavalue);
          } else {
            setError("Failed to load bill data");
          }
        })
        .catch(() => setError("Failed to load bill data"));
    } else {
      ApiRequest("/api/bills/getBillNo").then((data) => setBillNumber(incrementIfInteger(data.data.billNumber)));
    }
    ApiRequest("/api/settings/metafields").then((data) => {
      const order = {
        String: 1,
        Number: 2,
        MultiSelect: 3,
        Select: 4,
        Boolean: 5,
      };
      const meta = [...data.data.billMetaField, ...data.data.customerMetaField].sort(
        (a, b) => order[a.dataType] - order[b.dataType]
      );
      console.log({ meta });
      setMetaFields(meta);
    });
  }, [isCreateMode, router.query.billNumber]);

  useEffect(() => {
    if (customerInfo) {
      ApiRequest(`/api/customers?search=${customerInfo}`).then((Customers) => {
        setCustomerFiltered(Customers.data);
      });
    }
  }, [customerInfo]);

  function incrementIfInteger(str) {
    if (/^-?\d+$/.test(str)) {
      return parseInt(str, 10) + 1;
    }
    return str;
  }
  const handleCustomerSelect = (customer) => {
    setCustomerId(customer._id);
    setCustomerPhone(customer.number);
    setCustomerInfo(customer.number);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setShowCustomerDropdown(false);
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    const updatedItem = { ...newLineItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      const quantity = field === "quantity" ? value : Number(updatedItem.quantity) || 0;
      const rate = field === "rate" ? value : Number(updatedItem.rate) || 0;
      updatedItem.total = quantity * rate;
    }
    newLineItems[index] = updatedItem;
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: String(lineItems.length + 1),
        name: "",
        quantity: 1,
        rate: "",
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (Number(tax) || 0)) / 100;
  const discountAmount = (subtotal * (Number(discount) || 0)) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const validateForm = () => {
    if (!customerName || !customerPhone) {
      setError("Customer details are required");
      return false;
    }
    if (!lineItems.length || lineItems.some((item) => !item.name || !item.rate)) {
      setError("Each line item must have a name and rate");
      return false;
    }
    if (lineItems.some((item) => item.quantity <= 0 || item.rate <= 0)) {
      setError("Quantity and rate must be positive numbers");
      return false;
    }
    if (tax < 0 || tax > 100) {
      setError("Tax must be between 0 and 100%");
      return false;
    }
    if (discount < 0 || discount > 100) {
      setError("Discount must be between 0 and 100%");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!customerId) {
      const customer = await ApiRequest("/api/customers", "POST", {
        name: customerName,
        email: customerEmail ? customerEmail : undefined,
        number: customerPhone,
        address: customerAddress,
      });
      setCustomerId(customer.data._id);
      createBill(customer.data._id);
    } else {
      createBill();
    }
  };

  const createBill = async (newCustomerId) => {
    const billData = {
      customer: {
        id: customerId || newCustomerId,
        number: customerPhone,
        name: customerName,
        email: customerEmail ? customerEmail : undefined,
        address: customerAddress,
      },
      billNumber: billNumber.toString(),
      date,
      items: lineItems.map((item) => ({
        itemName: item.name,
        itemQty: item.quantity,
        itemPrice: item.rate,
      })),
      total: grandTotal.toFixed(2),
      tax,
      discount,
      metaData:
        Object.keys(MetaFieldVlaues).map((key) => {
          const metaInfo = MetaFields.find((m) => m.name === key);
          return { ...metaInfo, value: MetaFieldVlaues[key] };
        }) || [],
    };
    try {
      let billId = "";
      if (!isCreateMode) {
        billId = await ApiRequest("/api/bills", "POST", billData);
      } else {
        billId = await ApiRequest(`/api/bills/${router?.query?.id}`, "PUT", billData);
      }
      console.log({ billId });
      setSuccess(!isCreateMode ? "Bill created successfully" : "Bill updated successfully");
      router.push(`/bill/${billId.data}`);
    } catch (err) {
      setError(err.message);
      console.error("Error saving bill:", err);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded">{success}</div>}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Number</label>
            <input
              type="text"
              onChange={({ target: { value } }) => setBillNumber(value)}
              value={billNumber}
              className=" w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone Number</label>
          <input
            type="number"
            value={customerInfo || customerPhone}
            onChange={(e) => {
              setCustomerId("");
              setCustomerInfo(e.target.value);
              setCustomerPhone(e.target.value);
              setShowCustomerDropdown(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter customer phone number"
          />
          {showCustomerDropdown ? (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {customerFiltered?.map((customer) => (
                <div
                  key={customer._id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.number}</div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
          <div style={{ marginTop: "20px" }} className=" mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter customer email"
              />
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address</label>
            <input
              type="email"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter customer email"
            />
          </div>
        </div>

        {/* Meta Fields */}
        <hr className="!text-gray-300" />
        <div className="flex justify-center items-center flex-wrap">
          {MetaFields?.map((meta) =>
            meta.dataType === "String" ? (
              <div className="w-full md:w-1/2 px-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">{meta.label}</label>
                <input
                  type="email"
                  value={MetaFieldVlaues[meta.name]}
                  onChange={(e) => setMetaFieldVlaues((m) => ({ ...m, [meta.name]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={meta.label}
                />
              </div>
            ) : (
              <div className="w-1/2 mt-3 md:w-1/4 px-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={MetaFieldVlaues[meta.name]}
                    onChange={(e) => setMetaFieldVlaues((m) => ({ ...m, [meta.name]: e.target.checked }))}
                    className="hidden peer"
                  />
                  <span>{MetaFieldVlaues[meta.name] ? <CheckSquare2Icon size={20} /> : <Square size={20} />}</span>
                  <span className="ml-2 text-sm text-gray-700">{meta.label}</span>
                </label>
              </div>
            )
          )}
        </div>
        <hr className="!text-gray-300" />

        {/* Meta Fields */}
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
                        style={{ minWidth: 220 }}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        style={{ minWidth: 70 }}
                        onChange={(e) =>
                          handleLineItemChange(index, "quantity", e.target.value.replace(/^0+/, "") || 0)
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
                        onChange={(e) => handleLineItemChange(index, "rate", e.target.value.replace(/^0+/, "") || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-900 font-medium">₹{item.total.toFixed(2)}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-300 pt-6">
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
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
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                value={discount}
                style={{ maxWidth: 250 }}
                onChange={(e) => setDiscount(e.target.value.replace(/^0+/, "") || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Discount (%)"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900 font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount:</span>
                <span className="text-gray-900 font-medium">₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Grand Total:</span>
                <span className="text-gray-900 font-medium">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save size={20} className="mr-2" />
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}
