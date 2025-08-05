import React, { useState, useEffect } from "react";
import { Mail, Plus, Trash2, Edit3, Phone } from "lucide-react";
import { cn } from "../../Util/utils";
import { useApiRequest } from "@/Components/Util/useApiRequest";

const Users = () => {
  const { apiRequest } = useApiRequest();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Fetch users from API
  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const data = await apiRequest(`/api/auth/user?${queryParams}`);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreateUser = async (userData) => {
    try {
      const data = await apiRequest("/api/auth/user", "POST", userData);
      setShowAddUser(false);
      fetchUsers(); // Refresh the list
      alert("User created successfully!");
    } catch (err) {
      alert(err.message || "Failed to create user");
      console.error("Error creating user:", err);
    }
  };

  // Update user
  const handleUpdateUser = async (userData) => {
    try {
      const data = await apiRequest("/api/auth/user", "PUT", {
        userId: selectedUser.id,
        ...userData,
      });
      setShowEditUser(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
      alert("User updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update user");
      console.error("Error updating user:", err);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const data = await apiRequest(
        `/api/auth/user?userId=${selectedUser.id}`,
        "DELETE",
      );
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
      alert("User deleted successfully!");
    } catch (err) {
      alert(err.message || "Failed to delete user");
      console.error("Error deleting user:", err);
    }
  };

  const UserFormModal = ({ onClose, onSave, user = null, isEdit = false }) => {
    const [formData, setFormData] = useState({
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      password: "",
      access: user?.access || ["user"],
      isActive: user?.isActive !== undefined ? user.isActive : true,
      metaFields: user?.metaFields || {},
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
      const newErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      }

      if (!isEdit && !formData.password.trim()) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        // Remove password from update if it's empty
        const submitData = { ...formData };
        if (isEdit && !submitData.password.trim()) {
          delete submitData.password;
        }
        onSave(submitData);
      }
    };

    const handleAccessChange = (accessLevel) => {
      const newAccess = formData.access.includes(accessLevel)
        ? formData.access.filter((a) => a !== accessLevel)
        : [...formData.access, accessLevel];
      setFormData({ ...formData, access: newAccess });
    };

    return (
      <div className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                  errors.name ? "border-red-300" : "border-gray-300",
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                  errors.email ? "border-red-300" : "border-gray-300",
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                  errors.phoneNumber ? "border-red-300" : "border-gray-300",
                )}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {!isEdit && "*"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  isEdit ? "Leave blank to keep current password" : ""
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                  errors.password ? "border-red-300" : "border-gray-300",
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Levels
              </label>
              <div className="space-y-2">
                {["user", "admin", "manager"].map((accessLevel) => (
                  <label key={accessLevel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.access.includes(accessLevel)}
                      onChange={() => handleAccessChange(accessLevel)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {accessLevel}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {isEdit && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active User</span>
                </label>
              </div>
            )}

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
                {isEdit ? "Update User" : "Add User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ onClose, onConfirm, user }) => {
    return (
      <div className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl w-full max-w-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm Delete
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete user &quot;{user?.name}&quot;?
              This action will deactivate the user account.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ isActive }) => {
    const styles = isActive
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

    return (
      <span
        className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const AccessBadges = ({ access }) => {
    if (!access || access.length === 0) return null;

    const colorMap = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      user: "bg-gray-100 text-gray-700",
    };

    return (
      <div className="flex flex-wrap gap-1">
        {access.map((role, index) => (
          <span
            key={index}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              colorMap[role] || "bg-gray-100 text-gray-700",
            )}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access
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
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail size={14} className="mr-1" />
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone size={14} className="mr-1" />
                        {user.phoneNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <AccessBadges access={user.access} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge isActive={user.isActive} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditUser(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit user"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => fetchUsers(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalUsers} total users)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddUser && (
        <UserFormModal
          onClose={() => setShowAddUser(false)}
          onSave={handleCreateUser}
          isEdit={false}
        />
      )}

      {showEditUser && selectedUser && (
        <UserFormModal
          onClose={() => {
            setShowEditUser(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
          user={selectedUser}
          isEdit={true}
        />
      )}

      {showDeleteConfirm && selectedUser && (
        <DeleteConfirmModal
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;
