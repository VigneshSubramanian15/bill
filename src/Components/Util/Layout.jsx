import React from "react";
// import { Link, Outlet, useLocation } from "react-router-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Bills", path: "/bill" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="lg:hidden no-print fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-600">InvoiceApp</h1>
        </div>

        <div className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location?.pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-colors
                  ${isActive ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"}
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-8 w-full px-4">
          <button
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
            onClick={() => {
              /* Add logout logic */
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6">{/* <Outlet /> */ children}</main>
      </div>
    </div>
  );
}
