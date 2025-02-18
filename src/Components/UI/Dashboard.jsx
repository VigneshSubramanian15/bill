import React from "react";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../Util/utils";
import Link from "next/link";

const mockData = {
  stats: [
    { label: "Total Revenue", value: "$24,560", trend: "+12.5%", positive: true },
    { label: "Outstanding Bills", value: "$8,230", trend: "+2.3%", positive: false },
    { label: "Paid Bills", value: "$16,330", trend: "+8.3%", positive: true },
    { label: "Overdue Bills", value: "$3,460", trend: "+5.4%", positive: false },
  ],
  recentActivity: [
    { id: 1024, customer: "XYZ Ltd", amount: "$2,400", status: "paid", date: "2024-03-15" },
    { id: 1023, customer: "ABC Corp", amount: "$1,800", status: "pending", date: "2024-03-14" },
    { id: 1022, customer: "Tech Solutions", amount: "$3,200", status: "overdue", date: "2024-03-12" },
    { id: 1021, customer: "Global Inc", amount: "$950", status: "paid", date: "2024-03-10" },
  ],
  revenueData: [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
  ],
};

const StatCard = ({ label, value, trend, positive }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <div className={cn("flex items-center text-sm", positive ? "text-green-600" : "text-red-600")}>
        {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="ml-1">{trend}</span>
      </div>
    </div>
  </div>
);

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

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <Link
          href={"/bill/create"}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create New Bill
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {mockData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">Bill #{activity.id}</p>
                  <p className="text-sm text-gray-600">{activity.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{activity.amount}</p>
                  <StatusBadge status={activity.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
