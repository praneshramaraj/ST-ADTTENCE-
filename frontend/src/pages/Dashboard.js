import { useEffect, useState } from "react";
import api from "../utils/api";
import { PageHead, Stat, PercentBar } from "./shared";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [summary, setSummary] = useState({});
  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/attendance/class-summary").then((r) => setSummary(r.data));
  }, []);
  return (
    <>
      <PageHead title="Counsellor Dashboard" sub="Today overview and class alerts" />
      {stats.lowAttendance > 0 && <div className="alert alert-warning fw-bold">Low attendance alert: {stats.lowAttendance} students are below 75%.</div>}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-xl-2"><Stat icon="bi-people" label="Total Students" value={stats.totalStudents} /></div>
        <div className="col-md-4 col-xl-2"><Stat icon="bi-check-circle" label="Present Today" value={stats.presentToday} tone="success" /></div>
        <div className="col-md-4 col-xl-2"><Stat icon="bi-x-circle" label="Absent Today" value={stats.absentToday} tone="danger" /></div>
        <div className="col-md-4 col-xl-2"><Stat icon="bi-briefcase" label="On Duty" value={stats.onDuty} tone="primary" /></div>
        <div className="col-md-4 col-xl-2"><Stat icon="bi-clock" label="Late" value={stats.late} tone="warning" /></div>
        <div className="col-md-4 col-xl-2"><Stat icon="bi-exclamation-triangle" label="Low Attendance" value={stats.lowAttendance} tone="purple" /></div>
      </div>
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="cardx p-4">
            <h5 className="fw-bold mb-3">Today Overview</h5>
            {["present", "absent", "od", "late"].map((k) => <div key={k} className="mb-3"><div className="d-flex justify-content-between text-capitalize fw-bold"><span>{k}</span><span>{summary[k] || 0}</span></div><PercentBar value={summary.total ? Math.round(((summary[k] || 0) / summary.total) * 100) : 0} /></div>)}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="cardx p-4">
            <h5 className="fw-bold mb-3">Class Pulse</h5>
            <div className="d-flex justify-content-between py-3 border-bottom"><span className="text-muted">Coverage today</span><strong>{summary.total ? `${Math.round(((summary.present + summary.od + summary.late) / summary.total) * 100)}%` : "0%"}</strong></div>
            <div className="d-flex justify-content-between py-3 border-bottom"><span className="text-muted">Students needing attention</span><strong>{stats.lowAttendance || 0}</strong></div>
            <div className="d-flex justify-content-between py-3 border-bottom"><span className="text-muted">Absence follow-up queue</span><strong>{stats.absentToday || 0}</strong></div>
            <div className="mt-3 p-3 rounded" style={{ background: "var(--primary-light)" }}>
              <div className="fw-semibold text-primary">Today focus</div>
              <div className="small text-muted mt-1">Prioritize students below 75% and update parent-aware absence notes before the final period.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
