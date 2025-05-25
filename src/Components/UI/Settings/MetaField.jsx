import {
  Code,
  Edit2,
  FileText,
  Hash,
  List,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/Components/Util/utils";
import { ApiRequest } from "@/Components/Util/apiRequest";

const mockMetaFields = [
  {
    id: 1,
    name: "taxId",
    label: "Tax ID",
    type: "string",
    entity: "company",
    required: true,
    description: "Company tax identification number",
  },
  {
    id: 2,
    name: "industry",
    label: "Industry",
    type: "select",
    entity: "customer",
    options: ["Technology", "Healthcare", "Finance", "Retail", "Other"],
    required: false,
    description: "Customer industry sector",
  },
  {
    id: 3,
    name: "terms",
    label: "Terms & Conditions",
    type: "markdown",
    entity: "bill",
    required: false,
    description: "Bill-specific terms and conditions",
  },
];

const AddMetaFieldModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    metaType: "billMetaField",
    dataType: "String",
    addToTotal: false,
    showInBill: false,
    displayInPrintBill: false,
    isRequired: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      options:
        formData.dataType === "Select" || formData.dataType === "MultiSelect"
          ? formData.options.split(",").map((o) => o.trim())
          : undefined,
    });
    // onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Meta Field
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Field Type
            </label>
            <select
              value={formData.metaType}
              onChange={(e) =>
                setFormData({
                  metaType: e.target.value,
                  dataType: "String",
                  addToTotal: false,
                  showInBill: false,
                  displayInPrintBill: false,
                  isRequired: false,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="billMetaField">Bill Meta Field</option>
              <option value="customerMetaField">Customer Meta Field</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              placeholder="e.g., taxId"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  label: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              placeholder="e.g., Tax ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={formData.dataType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dataType: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">Boolean</option>
              <option value="MultiSelect">MultiSelect</option>
              <option value="Select">Select</option>
            </select>
          </div>

          {(formData.dataType === "MultiSelect" ||
            formData.dataType === "Select") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <input
                type="text"
                value={formData.options}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Option1, Option2, Option3"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Comma-separated list of options
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-10">
            {formData.metaType === "billMetaField" ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="addToTotal"
                  checked={formData.addToTotal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addToTotal: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="addToTotal"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Add to Total
                </label>
              </div>
            ) : (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInBill"
                  checked={formData.showInBill}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      showInBill: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="showInBill"
                  className="ml-2 block text-sm text-gray-700"
                >
                  show In Bill
                </label>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="displayInPrintBill"
                checked={formData.displayInPrintBill}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayInPrintBill: e.target.checked,
                  })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="displayInPrintBill"
                className="ml-2 block text-sm text-gray-700"
              >
                Display In Print Bill
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isRequired: e.target.checked,
                  })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRequired"
                className="ml-2 block text-sm text-gray-700"
              >
                Is Required
              </label>
            </div>
          </div>

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
              Add Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MetaField() {
  const [showAddMetaField, setShowAddMetaField] = useState(false);
  const [metaFields, setMetaFields] = useState(mockMetaFields);

  const handleDeleteMetaField = (id, metaType) => {
    ApiRequest("/api/settings/metafields", "DELETE", {
      metaType,
      _id: id,
    }).then(() => fetchMetaFields());
  };

  const handleAddMetaField = (newField) => {
    if (newField.metaType === "billMetaField") {
      delete newField.showInBill;
    } else {
      delete newField.addToTotal;
    }
    ApiRequest("/api/settings/metafields", "POST", newField).then(
      (res) => fetchMetaFields(),
      setShowAddMetaField(false),
    );
  };

  const getFieldTypeIcon = (type) => {
    const icons = {
      String: Type,
      Number: Hash,
      Select: List,
      MultiSelect: FileText,
      html: Code,
      js: Code,
    };
    return icons[type] || Type;
  };

  const TypeBadge = ({ type }) => {
    const styles =
      {
        string: "bg-blue-100 text-blue-700",
        number: "bg-purple-100 text-purple-700",
        select: "bg-green-100 text-green-700",
        markdown: "bg-yellow-100 text-yellow-700",
        html: "bg-red-100 text-red-700",
        js: "bg-gray-100 text-gray-700",
      }[type] || "bg-gray-100 text-gray-700";

    return (
      <span
        className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}
      >
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </span>
    );
  };

  const EntityBadge = ({ entity }) => {
    const styles =
      {
        company: "bg-indigo-100 text-indigo-700",
        customer: "bg-pink-100 text-pink-700",
        bill: "bg-orange-100 text-orange-700",
      }[entity] || "bg-gray-100 text-gray-700";

    return (
      <span
        className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}
      >
        {entity?.charAt(0).toUpperCase() + entity?.slice(1)}
      </span>
    );
  };

  const fetchMetaFields = () => {
    ApiRequest("/api/settings/metafields").then((res) => {
      setMetaFields([
        ...res.data.billMetaField.map((field) => ({
          ...field,
          entity: "Bill",
        })),
        ...res.data.customerMetaField.map((field) => ({
          ...field,
          entity: "Customer",
        })),
      ]);
    });
  };
  useEffect(() => {
    fetchMetaFields();
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Meta Fields</h3>
            <p className="text-sm text-gray-500">
              Define custom fields for your entities
            </p>
          </div>
          <button
            onClick={() => setShowAddMetaField(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} className="mr-2" />
            Add Field
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metaFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          {React.createElement(
                            getFieldTypeIcon(field.dataType),
                            {
                              size: 18,
                              className: "text-gray-500",
                            },
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {field.label}
                        </div>
                        <div className=" text-gray-500">{field.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={field.dataType} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EntityBadge entity={field.entity} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.isRequired ? (
                      <span className="text-green-700 px-2 py-1 bg-green-100 font-bold rounded-full">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleDeleteMetaField(
                          field._id,
                          field.entity === "Bill"
                            ? "billMetaField"
                            : "customerMetaField",
                        )
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      // onClick={() =>
                      //   handleDeleteMetaField(
                      //     field._id,
                      //     field.entity === "Bill" ? "billMetaField" : "customerMetaField"
                      //   )
                      // }
                      className="text-red-600 ml-4 hover:text-red-900"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAddMetaField && (
        <AddMetaFieldModal
          onClose={() => setShowAddMetaField(false)}
          onSave={handleAddMetaField}
        />
      )}
    </>
  );
}
