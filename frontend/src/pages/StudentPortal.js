import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import { Badge, PageHead, PercentBar, Stat, statusText } from "./shared";
import { useAuth } from "../context/AuthContext";

function useTab() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("tab") || "dashboard";
}

export default function StudentPortal() {
  const { user } = useAuth();
  const tab = useTab();
  const [att, setAtt] = useState({});
  const [weekTable, setWeekTable] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [ods, setOds] = useState([]);
  const [ach, setAch] = useState([]);
  const [form, setForm] = useState({});
  const [team, setTeam] = useState([]);
  const load = () => {
    if (user.studentRef) api.get(`/attendance/student/${user.studentRef}`).then((r) => setAtt(r.data));
    api.get("/timetable/week").then((r) => setWeekTable(r.data));
    api.get("/leaves").then((r) => setLeaves(r.data));
    api.get("/od").then((r) => setOds(r.data));
    api.get("/achievements").then((r) => setAch(r.data));
  };
  useEffect(() => { load(); }, []);
  async function submitRequest(kind, payload) {
    await api.post(`/${kind}`, payload);
    setForm({});
    load();
  }
  async function submitAchievement(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("isTeamEvent", form.isTeamEvent ? "true" : "false");
    fd.set("teamMembers", JSON.stringify(team));
    await api.post("/achievements", fd, { headers: { "Content-Type": "multipart/form-data" } });
    e.currentTarget.reset();
    setTeam([]);
    load();
  }
  return (
    <>
      <PageHead title="Student Portal" sub="Dashboard, attendance, requests, and achievements" />
      {tab === "dashboard" && <div className="row g-3">
        <div className="col-lg-4"><div className="cardx p-4"><div className="text-muted fw-bold">Attendance Percentage</div><div className="display-4 fw-bold">{att.percentage || 0}%</div><PercentBar value={att.percentage || 0} /><div className="mt-3 fw-bold">{statusText(att.percentage || 0)}</div></div></div>
        <div className="col-lg-8"><div className="row g-3"><div className="col-md-3"><Stat icon="bi-journal" label="Total Classes" value={att.total} /></div><div className="col-md-3"><Stat icon="bi-check" label="Present" value={att.present} tone="success" /></div><div className="col-md-3"><Stat icon="bi-x" label="Absent" value={att.absent} tone="danger" /></div><div className="col-md-3"><Stat icon="bi-briefcase" label="On Duty" value={att.od} tone="primary" /></div></div></div>
        <div className="col-12"><div className="cardx p-3"><h5 className="fw-bold">All-Day Timetable</h5><div className="table-responsive"><table className="table"><thead><tr><th>Day</th><th>Period Details</th></tr></thead><tbody>{weekTable.map((day) => <tr key={day._id || day.day}><td className="fw-bold">{day.day}</td><td>{day.periods?.map((p) => `${p.periodNo}. ${p.subject || "Free"} (${p.startTime}-${p.endTime})`).join("  |  ")}</td></tr>)}</tbody></table></div></div></div>
      </div>}
      {tab === "attendance" && <div className="cardx p-3 table-responsive"><table className="table"><thead><tr><th>Date</th><th>Period</th><th>Subject</th><th>Status</th></tr></thead><tbody>{att.rows?.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.period}</td><td>{r.subject}</td><td>{r.status}</td></tr>)}</tbody></table></div>}
      {tab === "leaves" && <RequestForm title="Submit Leave" rows={leaves} fields={["type", "fromDate", "toDate", "reason", "additionalDetails", "parentsAware"]} form={form} setForm={setForm} onSubmit={() => submitRequest("leaves", form)} />}
      {tab === "od" && <RequestForm title="Submit OD" rows={ods} fields={["event", "purpose", "benefit", "date", "endDate", "venue", "organizedBy"]} form={form} setForm={setForm} onSubmit={() => submitRequest("od", form)} />}
      {tab === "achievements" && <div className="row g-3"><div className="col-lg-4"><form className="cardx p-4" onSubmit={submitAchievement}><h5 className="fw-bold mb-3">Upload Achievement</h5>{["title", "category", "organizer", "achievementType", "eventDate", "description"].map((f) => <input key={f} name={f} className="form-control mb-2" placeholder={f} required={f === "title"} />)}<label className="form-label fw-bold">Certificate</label><input name="certificate" type="file" className="form-control mb-2" /><label className="form-label fw-bold">Winning Photos</label><input name="winningPhotos" type="file" multiple className="form-control mb-2" /><label className="form-check mb-3"><input className="form-check-input" type="checkbox" onChange={(e) => setForm({ ...form, isTeamEvent: e.target.checked })} /> Team event</label><button className="btn btn-primary w-100">Upload</button></form></div><History rows={ach} /></div>}
    </>
  );
}

function RequestForm({ title, fields, form, setForm, onSubmit, rows }) {
  return <div className="row g-3"><div className="col-lg-4"><div className="cardx p-4"><h5 className="fw-bold mb-3">{title}</h5>{fields.map((f) => <input key={f} className="form-control mb-2" type={f.toLowerCase().includes("date") ? "date" : "text"} placeholder={f} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />)}<button className="btn btn-primary w-100" onClick={onSubmit}>Submit</button></div></div><History rows={rows} /></div>;
}

function History({ rows }) {
  return <div className="col-lg-8"><div className="cardx p-3 table-responsive"><table className="table align-middle"><thead><tr><th>Title/Reason</th><th>Date</th><th>Status</th><th>Remark</th></tr></thead><tbody>{rows.map((r) => <tr key={r._id}><td>{r.title || r.reason || r.event}</td><td>{r.fromDate || r.date || r.eventDate}</td><td><Badge value={r.status} /></td><td>{r.hodRemark || r.counsellorRemark || "-"}</td></tr>)}</tbody></table></div></div>;
}
