import React, { useState } from "react";
import { Building2, Users, Palette, Upload, Trash2, Plus, Mail, Lock } from "lucide-react";
import { cn } from "../Util/utils";

const mockCompanyInfo = {
  name: "InvoiceApp",
  logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=128&h=128&fit=crop&auto=format",
  address: "123 Business Street",
  city: "San Francisco",
  state: "CA",
  zip: "94105",
  country: "United States",
  phone: "+1 (555) 123-4567",
  email: "contact@invoiceapp.com",
  website: "www.invoiceapp.com",
};

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "admin", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "manager", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "user", status: "inactive" },
];

const StatusBadge = ({ status }) => {
  const styles =
    {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
    }[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const styles =
    {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      user: "bg-gray-100 text-gray-700",
    }[role] || "bg-gray-100 text-gray-700";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const AddUserModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [companyInfo, setCompanyInfo] = useState(mockCompanyInfo);
  const [users, setUsers] = useState(mockUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [accentColor, setAccentColor] = useState("#16a34a");

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading logo:", file);
    }
  };

  const handleAddUser = (newUser) => {
    const id = Math.max(...users.map((u) => u.id)) + 1;
    setUsers([...users, { ...newUser, id }]);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const tabs = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "users", label: "Users", icon: Users },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-1 py-4 text-sm font-medium border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon size={20} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {activeTab === "company" && (
          <div className="p-6 space-y-6">
            <div className="flex items-start space-x-6">
              <div>
                <img src={companyInfo.logo} alt="Company Logo" className="w-24 h-24 rounded-lg object-cover" />
                <div className="mt-2">
                  <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload size={16} className="mr-2" />
                    Change Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={companyInfo.phone}
                      onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={companyInfo.address}
                    onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={companyInfo.city}
                    onChange={(e) => handleCompanyInfoChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={companyInfo.state}
                    onChange={(e) => handleCompanyInfoChange("state", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={companyInfo.zip}
                    onChange={(e) => handleCompanyInfoChange("zip", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={companyInfo.country}
                    onChange={(e) => handleCompanyInfoChange("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={20} className="mr-2" />
                Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Mail size={20} className="text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-20 p-1 rounded border"
                    />
                    <span className="text-sm text-gray-600">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onSave={handleAddUser} />}
    </div>
  );
}
