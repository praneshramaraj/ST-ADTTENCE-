import { useEffect, useState } from "react";
import api from "../utils/api";
import { CLASSES, PageHead } from "./shared";
import { useAuth } from "../context/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = [["08:00","08:40"],["08:40","09:20"],["09:30","10:10"],["10:10","10:50"],["11:30","12:10"],["12:10","12:50"],["12:50","13:30"],["13:30","14:10"],["14:10","14:50"]];

export default function Timetable() {
  const { user } = useAuth();
  const [form, setForm] = useState({ class: user.classAssigned || "", day: "Monday", periods: times.map((t, i) => ({ periodNo: i + 1, startTime: t[0], endTime: t[1], subject: "", staffName: "", type: "Theory" })) });
  const [rows, setRows] = useState([]);
  const classes = user.classAssigned ? [user.classAssigned] : CLASSES.filter((c) => !user.department || c.startsWith(user.department));
  const load = () => api.get("/timetable").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const setP = (i, patch) => setForm({ ...form, periods: form.periods.map((p, x) => x === i ? { ...p, ...patch } : p) });
  async function save() { await api.post("/timetable", form); load(); alert("Timetable saved"); }
  return (
    <>
      <PageHead title="Timetable Editor" sub="Create weekly schedules with SJIT period timings" action={<button className="btn btn-primary" onClick={save}>Save Day</button>} />
      <div className="cardx p-3 mb-3"><div className="row g-2"><div className="col-md-4"><select className="form-select" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}><option>Class</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></div><div className="col-md-4"><select className="form-select" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{days.map((d) => <option key={d}>{d}</option>)}</select></div></div></div>
      <div className="cardx p-3 mb-3 table-responsive"><table className="table align-middle"><thead><tr><th>Period</th><th>Time</th><th>Subject</th><th>Staff</th><th>Type</th></tr></thead><tbody>{form.periods.map((p, i) => <tr key={p.periodNo}><td>{p.periodNo}</td><td>{p.startTime}-{p.endTime}</td><td><input className="form-control" value={p.subject} onChange={(e) => setP(i, { subject: e.target.value })} /></td><td><input className="form-control" value={p.staffName} onChange={(e) => setP(i, { staffName: e.target.value })} /></td><td><select className="form-select" value={p.type} onChange={(e) => setP(i, { type: e.target.value })}><option>Theory</option><option>Lab</option><option>Break</option><option>Free</option></select></td></tr>)}</tbody></table></div>
      <div className="cardx p-3 table-responsive"><table className="table"><thead><tr><th>Class</th><th>Day</th><th>Periods</th></tr></thead><tbody>{rows.map((r) => <tr key={r._id}><td>{r.class}</td><td>{r.day}</td><td>{r.periods.map((p) => `${p.periodNo}:${p.subject || "Free"}`).join(", ")}</td></tr>)}</tbody></table></div>
    </>
  );
}
