import { Code, FileText, Hash, List, Plus, Trash2, Type } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/Components/Util/utils";

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
    name: "",
    label: "",
    type: "string",
    entity: "company",
    options: "",
    required: false,
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      options:
        formData.type === "select"
          ? formData.options.split(",").map((o) => o.trim())
          : undefined,
    });
    onClose();
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
              Field Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
                setFormData({ ...formData, label: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              placeholder="e.g., Tax ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="js">JavaScript</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity
            </label>
            <select
              value={formData.entity}
              onChange={(e) =>
                setFormData({ ...formData, entity: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="company">Company</option>
              <option value="customer">Customer</option>
              <option value="bill">Bill</option>
            </select>
          </div>

          {formData.type === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <input
                type="text"
                value={formData.options}
                onChange={(e) =>
                  setFormData({ ...formData, options: e.target.value })
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Field description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) =>
                setFormData({ ...formData, required: e.target.checked })
              }
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="required"
              className="ml-2 block text-sm text-gray-700"
            >
              Required field
            </label>
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

  const handleDeleteMetaField = (id) => {
    setMetaFields(metaFields.filter((field) => field.id !== id));
  };

  const handleAddMetaField = (newField) => {
    const id = Math.max(...metaFields.map((f) => f.id)) + 1;
    setMetaFields([...metaFields, { ...newField, id }]);
  };

  const getFieldTypeIcon = (type) => {
    const icons = {
      string: Type,
      number: Hash,
      select: List,
      markdown: FileText,
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
        {type.charAt(0).toUpperCase() + type.slice(1)}
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
        {entity.charAt(0).toUpperCase() + entity.slice(1)}
      </span>
    );
  };

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
                  Type
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
                          {React.createElement(getFieldTypeIcon(field.type), {
                            size: 18,
                            className: "text-gray-500",
                          })}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {field.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {field.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={field.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EntityBadge entity={field.entity} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.required ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteMetaField(field.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
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
