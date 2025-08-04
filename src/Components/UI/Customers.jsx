import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  DollarSign,
  Calendar,
} from "lucide-react";
import { cn } from "./../Util/utils";
import { useApiRequest } from "../Util/useApiRequest";

const CustomerAddPopup = ({ onClose, refetchCustomers }) => {
  const { apiRequest, loading, error } = useApiRequest();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
  });
  const [metaFields, setMetaFields] = useState([]);
  const [metaFieldData, setMetaFieldData] = useState({});

  useEffect(() => {
    const fetchMetaFields = async () => {
      try {
        const response = await apiRequest("/api/settings/metafields", "GET");
        if (response.success && response.data.customerMetaField) {
          setMetaFields(response.data.customerMetaField);
          // Initialize metaFieldData with default values
          const initialData = {};
          response.data.customerMetaField.forEach((field) => {
            switch (field.dataType) {
              case "Boolean":
                initialData[field.name] = false;
                break;
              case "Number":
                initialData[field.name] = "";
                break;
              case "MultiSelect":
                initialData[field.name] = [];
                break;
              default:
                initialData[field.name] = "";
            }
          });
          setMetaFieldData(initialData);
        }
      } catch (error) {
        console.error("Failed to fetch metafields:", error);
      }
    };
    fetchMetaFields();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      metaData: metaFieldData,
    };
    apiRequest("/api/customers", "POST", submitData).then(() =>
      refetchCustomers(),
    );
    onClose();
  };

  const handleMetaFieldChange = (fieldName, value, dataType) => {
    setMetaFieldData((prev) => ({
      ...prev,
      [fieldName]: dataType === "MultiSelect" ? value : value,
    }));
  };

  const renderMetaField = (field) => {
    const { name, label, dataType, options, isRequired } = field;

    switch (dataType) {
      case "String":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            />
          </div>
        );

      case "Number":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            />
          </div>
        );

      case "Boolean":
        return (
          <div key={field._id}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={metaFieldData[name] || false}
                onChange={(e) =>
                  handleMetaFieldChange(name, e.target.checked, dataType)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      case "Select":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            >
              <option value="">Select {label}</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "MultiSelect":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2 max-h-24 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(metaFieldData[name] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = metaFieldData[name] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      handleMetaFieldChange(name, newValues, dataType);
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-96 overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.number}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  number: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Dynamic Meta Fields */}
          {metaFields.map((field) => renderMetaField(field))}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerEditPopup = ({ customer, onClose, onSave, refetchCustomers }) => {
  const { apiRequest, loading, error } = useApiRequest();
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    number: customer.number,
  });
  const [metaFields, setMetaFields] = useState([]);
  const [metaFieldData, setMetaFieldData] = useState({});

  useEffect(() => {
    const fetchMetaFields = async () => {
      try {
        const response = await apiRequest("/api/settings/metafields", "GET");
        if (response.success && response.data.customerMetaField) {
          setMetaFields(response.data.customerMetaField);
          // Initialize metaFieldData with existing customer data or default values
          const initialData = {};
          response.data.customerMetaField.forEach((field) => {
            if (
              customer.metaFields &&
              customer.metaFields[field.name] !== undefined
            ) {
              initialData[field.name] = customer.metaFields[field.name];
            } else {
              switch (field.dataType) {
                case "Boolean":
                  initialData[field.name] = false;
                  break;
                case "Number":
                  initialData[field.name] = "";
                  break;
                case "MultiSelect":
                  initialData[field.name] = [];
                  break;
                default:
                  initialData[field.name] = "";
              }
            }
          });
          setMetaFieldData(initialData);
        }
      } catch (error) {
        console.error("Failed to fetch metafields:", error);
      }
    };
    fetchMetaFields();
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      metaFields: metaFieldData,
    };
    apiRequest("/api/customers/" + customer._id, "PUT", submitData).then(() =>
      refetchCustomers(),
    );
    onClose();
  };

  const handleMetaFieldChange = (fieldName, value, dataType) => {
    setMetaFieldData((prev) => ({
      ...prev,
      [fieldName]: dataType === "MultiSelect" ? value : value,
    }));
  };

  const renderMetaField = (field) => {
    const { name, label, dataType, options, isRequired } = field;

    switch (dataType) {
      case "String":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            />
          </div>
        );

      case "Number":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            />
          </div>
        );

      case "Boolean":
        return (
          <div key={field._id}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={metaFieldData[name] || false}
                onChange={(e) =>
                  handleMetaFieldChange(name, e.target.checked, dataType)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      case "Select":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              value={metaFieldData[name] || ""}
              style={{ color: "black" }}
              onChange={(e) =>
                handleMetaFieldChange(name, e.target.value, dataType)
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required={isRequired}
            >
              <option value="">Select {label}</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "MultiSelect":
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2 max-h-24 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(metaFieldData[name] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = metaFieldData[name] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      handleMetaFieldChange(name, newValues, dataType);
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-96 overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.number}
              style={{ color: "black" }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  number: e.target.value,
                })
              }
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Dynamic Meta Fields */}
          {metaFields.map((field) => renderMetaField(field))}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles =
    {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
    }[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const CustomerDetails = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Customer Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {customer.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  {customer.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  {customer.phone}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-gray-600">Customer ID</span>
                <p className="font-medium text-gray-900">{customer.id}</p>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-600">Status</span>
                <div className="flex justify-end mt-1">
                  <StatusBadge status={customer.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <DollarSign size={16} className="mr-1" />
                Total Spent
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${customer.totalSpent?.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar size={16} className="mr-1" />
                Last Invoice
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(customer.lastInvoice).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment History
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationPopup = ({ customer, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Delete Customer?
      </h2>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete {customer.name}? This action cannot be
        undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={() => onDelete(customer._id)}
          style={{ backgroundColor: "#dc2626" }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const { apiRequest, loading, error } = useApiRequest();
  const [loadMore, setLoadMore] = useState(true);
  const bottomRef = useRef(null);

  const handleEditCustomer = (id, data) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === id ? { ...customer, ...data } : customer,
      ),
    );
  };

  const handleDeleteCustomer = async (id) => {
    const response = await apiRequest(`${"/api/customers"}/${id}`, "DELETE");
    if (response.success) {
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    }
    setDeletingCustomer(null);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const FetchCustomers = async () => {
    const data = await apiRequest("/api/customers?page=" + page, "GET");
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch customers");
    }
    if (data.data.length < 10) setLoadMore(false);

    if (page === 1) {
      setCustomers(data.data);
    } else {
      setCustomers((prevCustomers) => [...prevCustomers, ...data.data]);
    }
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    // setError("");
  };

  useEffect(() => {
    FetchCustomers();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <button
          onClick={() => setAddingCustomer(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus color="white" size={20} className="mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <span>
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  // onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCustomer(customer);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(customer)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="text-center py-4">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}
        {loadMore && (
          <div ref={bottomRef} className="text-center py-4">
            <button
              onClick={() => setPage((prevPage) => prevPage + 1)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {addingCustomer && (
        <CustomerAddPopup
          refetchCustomers={FetchCustomers}
          onClose={() => setAddingCustomer(false)}
        />
      )}

      {editingCustomer && (
        <CustomerEditPopup
          refetchCustomers={FetchCustomers}
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleEditCustomer}
        />
      )}

      {deletingCustomer && (
        <DeleteConfirmationPopup
          customer={deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
}
