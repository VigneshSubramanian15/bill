import React, { useState } from "react";
import { Building2, Users, Palette } from "lucide-react";
import Company from "./Company";
// import Users from "./Users";
// import Appearance from "./Appearance";
import { cn } from "@/Components/Util/utils";

const tabs = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [accentColor, setAccentColor] = useState("#16a34a");

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
        {activeTab === "company" && <Company />}
        {/* {activeTab === "users" && <Users />}
        {activeTab === "appearance" && <Appearance accentColor={accentColor} setAccentColor={setAccentColor} />} */}
      </div>
    </div>
  );
}
