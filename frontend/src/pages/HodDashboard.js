import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../utils/api";
import { CLASSES, PageHead, Stat, PercentBar } from "./shared";
import { useAuth } from "../context/AuthContext";

export default function HodDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [comparison, setComparison] = useState([]);
  const [logs, setLogs] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const classes = CLASSES.filter((c) => !user.department || c.startsWith(user.department));
  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/attendance/cross-comparison").then((r) => setComparison(r.data));
  }, []);
  useEffect(() => {
    api.get("/attendance/logs", { params: { class: classFilter || undefined } }).then((r) => setLogs(r.data));
  }, [classFilter]);
  return (
    <>
      <PageHead title="HOD Dashboard" sub="Department overview, approvals, and cross-class comparison" />
      <div className="row g-3 mb-4">
        <div className="col-md"><Stat icon="bi-grid" label="Total Classes" value={stats.totalClasses} /></div>
        <div className="col-md"><Stat icon="bi-people" label="Total Students" value={stats.totalStudents} tone="success" /></div>
        <div className="col-md"><Stat icon="bi-envelope" label="Pending Leaves HOD" value={stats.pendingLeavesHod} tone="warning" /></div>
        <div className="col-md"><Stat icon="bi-briefcase" label="Pending ODs HOD" value={stats.pendingOdsHod} tone="purple" /></div>
        <div className="col-md"><Stat icon="bi-exclamation-triangle" label="Low Attendance" value={comparison.filter((c) => c.percentage < 75).length} tone="danger" /></div>
      </div>
      <div className="row g-3">
        <div className="col-xl-7"><div className="cardx p-4"><h5 className="fw-bold mb-3">Cross-Class Attendance</h5><div style={{ height: 320 }}><ResponsiveContainer><BarChart data={comparison}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class" /><YAxis domain={[0, 100]} /><Tooltip /><ReferenceLine y={75} stroke="#c81e1e" strokeDasharray="4 4" /><Bar dataKey="percentage" fill="#1a56db" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div></div>
        <div className="col-xl-5"><div className="cardx p-4"><h5 className="fw-bold mb-3">Class Summary</h5>{comparison.map((c) => <div key={c.class} className="mb-3"><div className="d-flex justify-content-between fw-bold"><span>{c.class}</span><span>{c.percentage}%</span></div><PercentBar value={c.percentage} /></div>)}</div></div>
        <div className="col-12"><div className="cardx p-3 table-responsive"><div className="d-flex justify-content-between align-items-center gap-3 mb-3"><h5 className="fw-bold mb-0">Attendance Logs</h5><select className="form-select" style={{ maxWidth: 220 }} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}><option value="">All classes</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></div><table className="table"><thead><tr><th>Date</th><th>Class</th><th>Period</th><th>Subject</th><th>Marked By</th><th>Locked</th></tr></thead><tbody>{logs.map((l) => <tr key={l._id}><td>{l.date}</td><td>{l.class}</td><td>{l.period}</td><td>{l.subject}</td><td>{l.markedBy?.name}</td><td>{l.isLocked ? "Yes" : "No"}</td></tr>)}</tbody></table></div></div>
      </div>
    </>
  );
}
