import React from "react";

export default function BillMetaField({
  MetaFields,
  MetaFieldValues,
  setMetaFieldValues,
}) {
  return (
    <>
      <hr className="!text-gray-300" />
      <div className="flex justify-center items-center flex-wrap">
        {MetaFields.bill?.map((meta) =>
          meta.dataType === "String" ? (
            <div key={meta.name} className="w-full md:w-1/2 mt-5 px-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {meta.label}
              </label>
              <input
                type="text"
                value={MetaFieldValues[meta.name]}
                onChange={(e) =>
                  setMetaFieldValues((m) => ({
                    ...m,
                    [meta.name]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={meta.label}
              />
            </div>
          ) : meta.dataType === "Number" ? (
            <div key={meta.name} className="w-full md:w-1/2 mt-5 px-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {meta.label}
              </label>
              <input
                type="number"
                value={MetaFieldValues[meta.name]}
                onChange={(e) =>
                  setMetaFieldValues((m) => ({
                    ...m,
                    [meta.name]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={meta.label}
              />
            </div>
          ) : (
            <div key={meta.name} className="w-1/2 mt-3 md:w-1/4 px-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={MetaFieldValues[meta.name]}
                  onChange={(e) =>
                    setMetaFieldValues((m) => ({
                      ...m,
                      [meta.name]: e.target.checked,
                    }))
                  }
                  className="hidden peer"
                />
                <span>
                  {MetaFieldValues[meta.name] ? (
                    <CheckSquare2Icon size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </span>
                <span className="ml-2 text-sm text-gray-700">{meta.label}</span>
              </label>
            </div>
          ),
        )}
      </div>
      <hr className="!text-gray-300" />
    </>
  );
}
