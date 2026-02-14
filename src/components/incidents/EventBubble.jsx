import React from "react";
import { cx, formatTime } from "../../utils/helpers";

export function EventBubble({ event }) {
  // BACKEND EVENT FORMAT:
  // { event_id, incident_id, type, payload, created_at }

  const type = event?.type;

  const content =
    event?.payload?.message ||
    event?.payload?.summary ||
    (event?.payload?.tags ? event.payload.tags.join(", ") : null) ||
    JSON.stringify(event?.payload || {});

  const headerCls =
    type === "human_update"
      ? "text-slate-900"
      : type === "ai_tag"
      ? "text-indigo-700"
      : type === "ai_summary"
      ? "text-fuchsia-700"
      : type === "status_change"
      ? "text-emerald-700"
      : "text-slate-700";

  const borderCls =
    type === "human_update"
      ? "border-slate-200 bg-white"
      : type === "ai_tag"
      ? "border-indigo-200 bg-indigo-50/40"
      : type === "ai_summary"
      ? "border-fuchsia-200 bg-fuchsia-50/40"
      : type === "status_change"
      ? "border-emerald-200 bg-emerald-50/40"
      : "border-slate-200 bg-slate-50";

  return (
    <div className={cx("rounded-xl border p-3", borderCls)}>
      <div className="flex items-center justify-between gap-4">
        <div className={cx("text-sm font-semibold", headerCls)}>{type}</div>
        <div className="text-xs text-slate-500">
          {formatTime(event?.created_at)}
        </div>
      </div>
      <div className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
