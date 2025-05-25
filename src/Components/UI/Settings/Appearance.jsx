import React from "react";

const Appearance = ({ setAccentColor, accentColor }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Theme Customization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
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
  );
};

export default Appearance;
