import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useApiRequest } from "@/Components/Util/useApiRequest";
import { cn } from "@/Components/Util/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function HeaderFooter() {
  const { apiRequest } = useApiRequest();
  const editorRef = useRef(null);
  const [selected, setSelected] = useState("billHeader");
  const [form, setForm] = useState({
    billHeader: { type: "HTML", value: "" },
    billFooter: { type: "HTML", value: "" },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest("/api/company/headerFooter")
      .then((res) => {
        setForm({
          billHeader: res.data.billHeader || { type: "HTML", value: "" },
          billFooter: res.data.billFooter || { type: "HTML", value: "" },
        });
      })
      .catch(() => setError("Failed to load header/footer"))
      .finally(() => setLoading(false));
  }, []);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  function handleSave() {
    setSaving(true);
    setError("");
    const value = editorRef.current?.getValue() || "";
    apiRequest("/api/company/headerFooter", "PUT", {
      [selected]: { type: "HTML", value },
    })
      .then(() => {
        setForm((prev) => ({ ...prev, [selected]: { type: "HTML", value } }));
      })
      .catch((e) => setError("Failed to save. " + (e?.message || "")))
      .finally(() => setSaving(false));
  }

  function handleTab(tab) {
    setSelected(tab);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.setValue(form[tab].value || "");
      }
    }, 0);
  }

  return (
    <div className="mb-6 p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Custom Bill Header/Footer
          </h3>
          <p className="text-sm text-gray-500">
            Edit HTML/Markdown for your bill header or footer. Preview is shown
            below.
          </p>
        </div>
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ml-4"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>
      <div className="flex space-x-2 mb-6">
        <button
          className={cn(
            "px-4 py-2 rounded-lg font-medium focus:outline-none",
            selected === "billHeader"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
          onClick={() => handleTab("billHeader")}
        >
          Header
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-lg font-medium focus:outline-none",
            selected === "billFooter"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
          onClick={() => handleTab("billFooter")}
        >
          Footer
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className={showPreview ? "flex-1 w-1/2" : "w-full"}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTML/Markdown Code
          </label>
          <div className="border rounded-lg overflow-hidden mb-2 w-full">
            <MonacoEditor
              height="240px"
              width="100%"
              language="html"
              defaultValue={form[selected].value}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-2"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
        {showPreview && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="border rounded p-4 mb-2 min-h-[120px]">
              <div
                dangerouslySetInnerHTML={{
                  __html: editorRef.current?.getValue() || form[selected].value,
                }}
              />
            </div>
          </div>
        )}
      </div>
      {loading && <div className="text-gray-500 mt-2">Loading...</div>}
    </div>
  );
}
