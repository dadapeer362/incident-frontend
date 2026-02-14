import React from "react";
import { motion } from "framer-motion";
import { SeverityBadge, StatusBadge } from "../common/Badges";
import { formatTime } from "../../utils/helpers";

export function IncidentCard({ incident, onOpen }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base md:text-lg font-semibold truncate">
            {incident.title}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Created: {formatTime(incident.created_at)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">Incident ID: {incident.id}</div>
        <button
          onClick={() => onOpen?.(incident)}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Open Room
        </button>
      </div>
    </motion.div>
  );
}
