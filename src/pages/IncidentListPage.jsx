import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cx } from "../utils/helpers";
import { api } from "../utils/api";
import { API_BASE } from "../constants/config";
import { CreateIncidentDialog } from "../components/incidents/CreateIncidentDialog";
import { IncidentCard } from "../components/incidents/IncidentCard";

export function IncidentListPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/incidents");
      setIncidents(data);
    } catch (e) {
      setError(e?.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter((x) => {
      return (
        String(x.id).includes(q) ||
        String(x.title || "").toLowerCase().includes(q) ||
        String(x.status || "").toLowerCase().includes(q) ||
        String(x.severity || "").toLowerCase().includes(q)
      );
    });
  }, [incidents, query]);

  function openRoom(incident) {
    navigate(`/incidents/${incident.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 md:px-8 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-2xl md:text-3xl font-semibold tracking-tight">
              Live Incident Rooms
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Create an incident, then join its room (WebSocket) to post updates
              and receive AI summaries.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className={cx(
                "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium",
                loading ? "opacity-70" : ""
              )}
            >
              <RefreshCw
                className={cx("h-4 w-4", loading ? "animate-spin" : "")}
              />
              Refresh
            </button>
            <CreateIncidentDialog onCreated={load} />
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, id, status, severity..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
          <div className="text-sm text-slate-600 shrink-0">
            {filtered.length} incident{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <div className="font-medium">Backend not reachable</div>
              <div className="mt-1">{error}</div>
              <div className="mt-2 text-xs text-red-700/80">
                Tip: make sure FastAPI is running at {API_BASE}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="h-5 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded mt-2" />
                  <div className="h-4 w-1/3 bg-slate-200 rounded mt-5" />
                  <div className="h-9 w-28 bg-slate-200 rounded-xl mt-4" />
                </div>
              ))
            : filtered.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onOpen={openRoom}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
