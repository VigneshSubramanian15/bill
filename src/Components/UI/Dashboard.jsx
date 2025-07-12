import React, { useEffect, useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRangePicker } from "react-date-range";
import { cn } from "../Util/utils";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useApiRequest } from "../Util/useApiRequest";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

const mockData = {
  recentActivity: [
    {
      id: 1024,
      customer: "XYZ Ltd",
      amount: "$2,400",
      status: "paid",
      date: "2024-03-15",
    },
    {
      id: 1023,
      customer: "ABC Corp",
      amount: "$1,800",
      status: "pending",
      date: "2024-03-14",
    },
    {
      id: 1022,
      customer: "Tech Solutions",
      amount: "$3,200",
      status: "overdue",
      date: "2024-03-12",
    },
    {
      id: 1021,
      customer: "Global Inc",
      amount: "$950",
      status: "paid",
      date: "2024-03-10",
    },
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
      <div
        className={cn(
          "flex items-center text-sm",
          positive ? "text-green-600" : "text-red-600",
        )}
      >
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
    <span
      className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function Dashboard() {
  const login = useSelector((state) => state?.login);
  const [cardInfo, setCardInfo] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const { apiRequest, loading, error } = useApiRequest();

  useEffect(() => {
    const fetchData = async () => {
      if (!login) {
        window.location.href = "/login";
        return;
      }

      try {
        // Format dates for API
        const startDate = dateRange[0].startDate.toISOString().split("T")[0];
        const endDate = dateRange[0].endDate.toISOString().split("T")[0];

        // Fetch total sales data
        const totalSalesResponse = await apiRequest(
          `/api/analytics/totalSales?startDate=${startDate}&endDate=${endDate}`,
        );
        console.log("Total Sales Response:", totalSalesResponse);
        setCardInfo(totalSalesResponse.data);

        // Fetch revenue by date data
        const revenueResponse = await apiRequest(
          `/api/analytics/revenueByDate?startDate=${startDate}&endDate=${endDate}`,
        );
        console.log("Revenue by Date Response:", revenueResponse);
        setRevenueData(revenueResponse.data.revenueData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [login, dateRange]); // Added dateRange to dependencies

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest(".date-picker-container")) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleDateRangeApply = () => {
    setShowDatePicker(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {`Welcome back! Here's what's happening today`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Date Range Picker */}
          <div className="relative date-picker-container">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar size={16} className="mr-2" />
              {dateRange[0].startDate.toLocaleDateString()} -{" "}
              {dateRange[0].endDate.toLocaleDateString()}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="vertical"
                  showDateDisplay={false}
                  rangeColors={["#16a34a"]}
                  editableDateInputs={true}
                />
                <div className="p-3 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDateRangeApply}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link
            href={"/bill/create"}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus color="white" size={20} className="mr-2" />
            Create New Bill
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(cardInfo.totalSales)}
          trend={loading ? "..." : "+12.5%"}
          positive={true}
        />
        <StatCard
          label="Total Bills"
          value={cardInfo.totalBills || 0}
          trend={loading ? "..." : "+8.3%"}
          positive={true}
        />
        <StatCard
          label="Average Bill Amount"
          value={formatCurrency(cardInfo.averageBillAmount)}
          trend={loading ? "..." : "+5.4%"}
          positive={true}
        />
        {/* <StatCard
          label="Date Range"
          value={
            cardInfo.dateRange?.isDefault ? "Last 30 Days" : "Custom Range"
          }
          trend={loading ? "..." : "Selected"}
          positive={true}
        /> */}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trends by Date
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    name === "revenue" ? "Revenue" : "Bill Count",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar
                  dataKey="revenue"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {revenueData.length === 0 && !loading && (
            <div className="flex items-center justify-center h-80 text-gray-500">
              No revenue data available for the selected date range
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center h-80 text-gray-500">
              Loading revenue data...
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {mockData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Bill #{activity.id}
                  </p>
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
