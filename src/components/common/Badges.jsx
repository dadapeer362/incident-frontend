import React from "react";
import { cx } from "../../utils/helpers";

export function SeverityBadge({ severity }) {
  const label = String(severity || "").toUpperCase();
  const cls =
    label === "P1"
      ? "border-red-200 bg-red-50 text-red-700"
      : label === "P2"
      ? "border-orange-200 bg-orange-50 text-orange-700"
      : label === "P3"
      ? "border-yellow-200 bg-yellow-50 text-yellow-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {label || "UNKNOWN"}
    </span>
  );
}

export function StatusBadge({ status }) {
  const label = String(status || "").toLowerCase();
  const cls =
    label === "open"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : label === "resolved"
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {label || "unknown"}
    </span>
  );
}
