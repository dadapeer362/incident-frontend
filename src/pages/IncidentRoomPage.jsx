import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Send, ArrowLeft, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cx, formatTime } from "../utils/helpers";
import { api } from "../utils/api";
import { WS_BASE } from "../constants/config";
import { SeverityBadge, StatusBadge } from "../components/common/Badges";
import { EventBubble } from "../components/incidents/EventBubble";

export function IncidentRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wsStatus, setWsStatus] = useState("disconnected"); // disconnected | connecting | connected
  const wsRef = useRef(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadFromRest() {
    setError("");
    setLoading(true);
    try {
      const data = await api(`/incidents/${id}`);
      setIncident(data);
      setTimeline(data.timeline || []);
    } catch (e) {
      setError(e?.message || "Failed to load incident");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 150);
    }
  }

  // Load incident from REST once
  useEffect(() => {
    loadFromRest();
  }, [id]);

  // WebSocket connect
  useEffect(() => {
    if (!id) return;

    setWsStatus("connecting");

    const ws = new WebSocket(`${WS_BASE}/ws/incidents/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
    };

    ws.onerror = () => {
      setWsStatus("disconnected");
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        // initial state
        if (data.type === "initial_state") {
          setIncident(data.incident);
          setTimeline(data.timeline || []);
          setTimeout(scrollToBottom, 50);
          return;
        }

        // timeline event
        if (data.type === "timeline_event") {
          const ev = data.event;
          setTimeline((prev) => [...prev, ev]);
          setTimeout(scrollToBottom, 50);

          // status change update
          if (ev?.type === "status_change") {
            const txt =
              ev?.payload?.status || ev?.payload?.message || JSON.stringify(ev?.payload || {});
            if (String(txt).toLowerCase().includes("resolved")) {
              setIncident((prev) => (prev ? { ...prev, status: "resolved" } : prev));
            }
          }
          return;
        }

        // system / error
        if (data.type === "system" || data.type === "error") {
          console.log("WS:", data.message);
          return;
        }
      } catch (e) {
        console.log("WS parse error:", e);
      }
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [id]);

  async function sendUpdate() {
    const msg = text.trim();
    if (!msg) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected yet.");
      return;
    }

    try {
      setSending(true);

      // backend expects: { "message": "..." }
      wsRef.current.send(JSON.stringify({ message: msg }));

      setText("");
    } finally {
      setSending(false);
    }
  }

  const canSend = incident?.status !== "resolved";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 md:px-8 py-4 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
              wsStatus === "connected"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : wsStatus === "connecting"
                ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            {wsStatus === "connected" ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            {wsStatus}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-slate-600">Loading incident...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : incident ? (
          <>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xl md:text-2xl font-semibold">
                    {incident.title}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Incident ID: {incident.id}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Created: {formatTime(incident.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">Live Room</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Send an update. Backend will emit AI tag + AI summary events.
                  </div>
                </div>
                <button
                  onClick={loadFromRest}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload
                </button>
              </div>

              <div className="mt-4 h-[55vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                {timeline.length === 0 ? (
                  <div className="text-sm text-slate-500">No events yet.</div>
                ) : (
                  timeline.map((e, idx) => (
                    <EventBubble key={e?.event_id || idx} event={e} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    canSend
                      ? "Type an incident update..."
                      : "Incident is resolved. Updates disabled."
                  }
                  disabled={!canSend}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendUpdate();
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <button
                  onClick={sendUpdate}
                  disabled={!canSend || sending}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white",
                    (!canSend || sending) ? "opacity-60" : ""
                  )}
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>

              {!canSend ? (
                <div className="mt-3 text-sm text-slate-600">
                  This incident is resolved, so the backend stops processing new
                  updates.
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
