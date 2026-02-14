import React, { useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { cx } from "../../utils/helpers";
import { api } from "../../utils/api";

export function CreateIncidentDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const t = title.trim();
    if (!t) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      await api("/incidents", {
        method: "POST",
        body: { title: t, severity },
      });
      setOpen(false);
      setTitle("");
      setSeverity("P2");
      onCreated?.();
    } catch (e) {
      setError(e?.message || "Failed to create incident");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" />
        New Incident
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-[92vw] max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="text-lg font-semibold">Create Incident</div>
            <div className="text-sm text-slate-600 mt-1">
              Start a new incident room.
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Title</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Checkout failing"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Severity</div>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="P1">P1 (Critical)</option>
                  <option value="P2">P2 (High)</option>
                  <option value="P3">P3 (Medium)</option>
                </select>
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>{error}</div>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={loading}
                  className={cx(
                    "rounded-xl bg-black px-4 py-2 text-sm font-medium text-white",
                    loading ? "opacity-70" : ""
                  )}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
