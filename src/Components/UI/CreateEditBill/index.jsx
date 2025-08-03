import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/router";
import { useApiRequest } from "../../Util/useApiRequest";
import BillMetaField from "./BillMetaField";
import LineItemsTable from "./LineItemsTable";
import Summary from "./Summary";
import { useSelector } from "react-redux";
import HSNCalculation from "./HSNCalculation";

export function CreateEditBill() {
  const router = useRouter();
  const isCreateMode = router?.query?.id ? true : false;
  const [billNumber, setBillNumber] = useState();
  const [billLoading, setbillLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerInfo, setCustomerInfo] = useState("");
  const [customerFiltered, setCustomerFiltered] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [MetaFields, setMetaFields] = useState([]);
  const [HSNData, setHSNData] = useState([]);
  const [gstNumber, setGstNumber] = useState("");
  const [MetaFieldValues, setMetaFieldValues] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [inclusiveTax, setInclusiveTax] = useState(false);
  const [lineItems, setLineItems] = useState([
    { id: "1", name: "", quantity: 1, rate: "", total: 0 },
  ]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { apiRequest } = useApiRequest();
  const login = useSelector((state) => state?.login);
  const isHSN = login?.companyModules?.HSN || false;

  useEffect(() => {
    if (isCreateMode) {
      const billNumberFromQuery = router.query.id;
      apiRequest(`/api/bills/${billNumberFromQuery}`)
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
            setGstNumber(bill.customer.gstNumber || "");
            setLineItems(
              bill.items.map((item, index) => ({
                id: String(index + 1),
                name: item.itemName,
                quantity: item.itemQty,
                rate: item.itemPrice,
                taxRate: item.taxRate || 0,
                hsnCode: item.hsnCode || "",
                metaData: Object.fromEntries(
                  item.metaData.map((item) => [item.name, item.value]),
                ),
                total: item.itemQty * item.itemPrice,
              })),
            );
            setInclusiveTax(bill.inclusiveOfTax);
            setTax(bill.tax);
            setDiscount(bill.discount);
            let metavalue = {};
            bill.metaData.map(
              (meta) =>
                (metavalue = {
                  ...metavalue,
                  [meta.name]: meta.value,
                }),
            );
            setMetaFieldValues(metavalue);
          } else {
            setError("Failed to load bill data");
          }
        })
        .catch(() => setError("Failed to load bill data"));
    } else {
      apiRequest("/api/bills/getBillNo").then((data) =>
        setBillNumber(incrementIfInteger(data.data.billNumber)),
      );
    }
    apiRequest("/api/settings/metafields").then((data) => {
      const order = {
        String: 1,
        Number: 2,
        MultiSelect: 3,
        Select: 4,
        Boolean: 5,
      };
      const meta = {
        bill: data.data.billMetaField.sort(
          (a, b) => order[a.dataType] - order[b.dataType],
        ),
        customer: data.data.customerMetaField.sort(
          (a, b) => order[a.dataType] - order[b.dataType],
        ),
        lineItem: data.data.lineItemMetaField.sort(
          (a, b) => order[a.dataType] - order[b.dataType],
        ),
      };
      setMetaFields(meta);
    });
  }, [isCreateMode, router.query.billNumber]);

  useEffect(() => {
    if (customerInfo) {
      apiRequest(`/api/customers?search=${customerInfo}`).then((Customers) => {
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

  const calculateHSNTax = () => {
    return HSNData.reduce((total, item) => {
      return total + item.totalTax;
    }, 0);
  };

  const handleLineItemChange = (index, field, value, isMetaData, HSNTax) => {
    let newLineItems = [...lineItems];
    if (isMetaData) {
      const updatedItem = {
        ...newLineItems[index],
        metaData: { ...newLineItems[index].metaData, [field]: value },
      };
      newLineItems[index] = updatedItem;
    } else if (HSNTax) {
      const updatedItem = { ...newLineItems[index], [field]: value };
      newLineItems = newLineItems.map((item) => {
        if (item.hsnCode === updatedItem.hsnCode) {
          item.taxRate = value;
          item.totalTax = item.total * (value / 100);
          return item;
        }
        return item;
      });
    } else {
      const updatedItem = { ...newLineItems[index], [field]: value };
      if (field === "quantity" || field === "rate") {
        const quantity =
          field === "quantity" ? value : Number(updatedItem.quantity) || 0;
        const rate = field === "rate" ? value : Number(updatedItem.rate) || 0;
        updatedItem.total = quantity * rate;
      }
      newLineItems[index] = updatedItem;
    }

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
  const taxAmount = isHSN
    ? calculateHSNTax()
    : (subtotal * (Number(tax) || 0)) / 100;
  const discountAmount =
    ((subtotal + (!inclusiveTax ? taxAmount : 0)) * (Number(discount) || 0)) /
    100;
  const metaFieldsToAdd = MetaFields?.bill?.filter((meta) => meta.addToTotal);
  const metaTotal = metaFieldsToAdd?.reduce((sum, meta) => {
    const value = MetaFieldValues[meta.name];
    if (meta.dataType === "Number" && value) {
      return sum + Number(value);
    }
    return sum;
  }, 0);
  const grandTotal = !inclusiveTax
    ? subtotal + taxAmount + metaTotal - discountAmount
    : subtotal + metaTotal - discountAmount;

  const validateForm = () => {
    if (!customerName || !customerPhone) {
      setError("Customer details are required");
      return false;
    }
    if (
      !lineItems.length ||
      lineItems.some((item) => !item.name || !item.rate)
    ) {
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
    setbillLoading(false);
    setError("");
    setSuccess("");

    if (billLoading) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    if (!customerId) {
      setbillLoading(true);
      const customer = await apiRequest("/api/customers", "POST", {
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
    const BillMetaData = [];
    Object.keys(MetaFieldValues).forEach((key) => {
      const metaInfo = MetaFields.bill.find((m) => m.name === key);
      if (!metaInfo) return [];
      return BillMetaData.push({
        ...metaInfo,
        value: MetaFieldValues[key],
        type: "bill",
      });
    });
    const customerMetaData = [];
    Object.keys(MetaFieldValues).forEach((key) => {
      const metaInfo = MetaFields.customer.find((m) => m.name === key);
      if (!metaInfo) return [];
      return customerMetaData.push({
        ...metaInfo,
        value: MetaFieldValues[key],
        type: "customer",
      });
    });
    const MetaData = [...BillMetaData, ...customerMetaData];
    console.log({ MetaData, MetaFields, MetaFieldValues });
    const billData = {
      customer: {
        id: customerId || newCustomerId,
        number: customerPhone,
        name: customerName,
        email: customerEmail ? customerEmail : undefined,
        address: customerAddress,
        gstNumber: gstNumber,
      },
      billNumber: billNumber.toString(),
      date,
      inclusiveOfTax: inclusiveTax,
      items: lineItems.map((item) => ({
        itemName: item.name,
        itemQty: item.quantity,
        itemPrice: item.rate,
        taxRate: item.taxRate,
        hsnCode: item.hsnCode,
        metaData: Object.keys(item.metaData || {}).map((key) => ({
          name: key,
          value: item.metaData[key],
          label: MetaFields.lineItem.find((m) => m.name === key)?.label || key,
        })),
      })),
      total: grandTotal.toFixed(2),
      tax,
      discount,
      metaData: MetaData || [],
    };
    setbillLoading(false);
    console.log("Bill Data to be saved:", billData);
    try {
      let billId = "";
      if (!isCreateMode) {
        billId = await apiRequest("/api/bills", "POST", billData);
      } else {
        billId = await apiRequest(
          `/api/bills/${router?.query?.id}`,
          "PUT",
          billData,
        );
      }
      console.log({ billId });
      setSuccess(
        !isCreateMode
          ? "Bill created successfully"
          : "Bill updated successfully",
      );
      setbillLoading(false);
      router.push(`/bill/${billId.data}`);
    } catch (err) {
      setError(err.message);
      setbillLoading(false);
      console.error("Error saving bill:", err);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded">{success}</div>
      )}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Number
            </label>
            <input
              type="text"
              onChange={({ target: { value } }) => setBillNumber(value)}
              value={billNumber}
              className=" w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="relative">
          <div
            style={{ marginTop: "20px" }}
            className=" mt-5 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone Number
              </label>
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
                      <div className="text-sm text-gray-600">
                        {customer.number}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
            {isHSN ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter GST number"
                />
              </div>
            ) : (
              ""
            )}
          </div>
          <div
            style={{ marginTop: "20px" }}
            className=" mt-5 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email
              </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Address
            </label>
            <input
              type="email"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter customer email"
            />
          </div>
        </div>

        <BillMetaField
          MetaFields={MetaFields}
          MetaFieldValues={MetaFieldValues}
          setMetaFieldValues={setMetaFieldValues}
        />

        <LineItemsTable
          lineItems={lineItems}
          MetaFields={MetaFields}
          isHSN={isHSN}
          handleLineItemChange={handleLineItemChange}
          removeLineItem={removeLineItem}
          addLineItem={addLineItem}
        />
        {isHSN ? (
          <HSNCalculation
            HSNData={HSNData}
            lineItems={lineItems}
            setHSNData={setHSNData}
          />
        ) : (
          ""
        )}
        <Summary
          isHSN={isHSN}
          HSNData={HSNData}
          subtotal={subtotal}
          tax={tax}
          setTax={setTax}
          setDiscount={setDiscount}
          discount={discount}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          grandTotal={grandTotal}
          metaFields={MetaFields.bill}
          metaFieldValues={MetaFieldValues}
          setSubTotalInclusiveTax={setInclusiveTax}
          subTotalInclusiveTax={inclusiveTax}
        />
        <div className="flex justify-end">
          {!isCreateMode ? (
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={20} className="mr-2" />
              {billLoading ? "Creating Bill..." : "Create Bill"}
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={20} className="mr-2" />
              {billLoading ? "Updating Bill..." : "Update Bill"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
