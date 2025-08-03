import React, { useEffect, useState } from "react";
import { Building2, Users, Palette, Database } from "lucide-react";
import Company from "./Company";
import User from "./Users";
import Appearance from "./Appearance";
import { cn } from "@/Components/Util/utils";
import MetaField from "./MetaField";
import Config from "./Config";
import { useSelector } from "react-redux";

const defaultTabs = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "config", label: "Configuration", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
];
export function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [accentColor, setAccentColor] = useState("#16a34a");
  const [tabs, setTabs] = useState(defaultTabs);
  const access = useSelector((state) => state.login.access);

  useEffect(() => {
    if (access) {
      access.includes("admin") &&
        setTabs([...defaultTabs, { id: "users", label: "Users", icon: Users }]);
    }
  }, [access]);

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
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              <tab.icon size={20} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div
        className={`${activeTab === "users" ? "rounded-xl shadow bg-white" : ""}`}
      >
        {activeTab === "company" && <Company />}
        {activeTab === "users" && <User />}
        {activeTab === "appearance" && (
          <Appearance
            accentColor={accentColor}
            setAccentColor={setAccentColor}
          />
        )}
        {activeTab === "config" && <Config />}
      </div>
    </div>
  );
}
