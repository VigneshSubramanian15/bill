import React, { useState, useEffect } from "react";
import { Plus, Search, FileDown, Eye, Pencil, Trash2, Filter, Calendar, ChevronDown } from "lucide-react";
import { cn } from "./../Util/utils";
import { useRouter } from "next/router";
import { ApiRequest } from "../Util/apiRequest";

const StatusBadge = ({ status }) => {
  const styles =
    {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
    }[status] || "";
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const FilterDropdown = ({ label, options }) => {
  return (
    <div className="relative">
      <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
        <span>{label}</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
};

const DeleteConfirmationPopup = ({ bill, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Customer?</h2>
      <p className="text-gray-600 mb-6">Are you sure you want to delete {bill.name}? This action cannot be undone.</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
          Cancel
        </button>
        <button
          onClick={() => onDelete(bill._id)}
          style={{ backgroundColor: "#dc2626" }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export function Bills() {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [deleteBill, setDeleteBill] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await ApiRequest("/api/bills");
        setBills(res.data);
      } catch (err) {
        setError(err.message || "Failed to load bills");
      }
    };
    fetchBills();
  }, []);

  const filteredBills = bills.filter((bill) => {
    const term = searchTerm?.toLowerCase();
    return (
      bill.billNumber?.toLowerCase().includes(term) ||
      (bill.customer && bill.customer.name?.toLowerCase().includes(term))
    );
  });

  const handleExportCSV = () => {
    console.log("Exporting as CSV...");
  };

  const handleExportPDF = () => {
    console.log("Exporting as PDF...");
  };

  const handleDelete = async (id) => {
    await ApiRequest(`${"/api/bills"}/${id}`, "DELETE");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600">Manage and track all your bills</p>
        </div>
        <button
          onClick={() => router.push("/bill/create")}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Bill
        </button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterDropdown label="Status" options={["All", "Paid", "Pending", "Overdue"]} />
              <FilterDropdown label="Payment Type" options={["All", "Credit Card", "Bank Transfer", "PayPal"]} />
              <button className="inline-flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Calendar size={16} />
                <span>Date Range</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileDown size={16} className="mr-1" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileDown size={16} className="mr-1" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.billNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bill.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.total ? `$${Number(bill.total).toFixed(2)}` : "$0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={bill.status || "paid"} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bill.metaData?.date || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/bill/${bill._id}`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/bill/${bill._id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => setDeleteBill(bill)} className="text-gray-600 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {deleteBill && (
        <DeleteConfirmationPopup bill={deleteBill} onClose={() => setDeleteBill(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}
