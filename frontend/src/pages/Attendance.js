import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { CLASSES, PageHead, today } from "./shared";
import { useAuth } from "../context/AuthContext";

const statuses = ["Present", "Absent", "OD", "Late"];
const label = { Present: "P", Absent: "A", OD: "OD", Late: "L" };

export default function Attendance() {
  const { user } = useAuth();
  const [date, setDate] = useState(today());
  const [cls, setCls] = useState(user.classAssigned || "");
  const [period, setPeriod] = useState(1);
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const classes = useMemo(() => user.classAssigned ? [user.classAssigned] : CLASSES.filter((c) => !user.department || c.startsWith(user.department)), [user]);
  useEffect(() => { if (cls) api.get("/students", { params: { class: cls } }).then((r) => { setStudents(r.data); setRecords(Object.fromEntries(r.data.map((s) => [s._id, "Present"]))); }); }, [cls]);
  async function submit() {
    await api.post("/attendance/mark", { date, class: cls, period: Number(period), subject, records: students.map((s) => ({ student: s._id, status: records[s._id] || "Present" })) });
    alert("Attendance saved");
  }
  return (
    <>
      <PageHead title="Take Attendance" sub="Mark Present, Absent, OD, or Late by period" action={<button className="btn btn-primary" onClick={submit}>Save Attendance</button>} />
      <div className="cardx p-3 mb-3"><div className="row g-2">
        <div className="col-md-3"><input className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="col-md-3"><select className="form-select" value={cls} onChange={(e) => setCls(e.target.value)}><option value="">Class</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="col-md-2"><select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>{[1,2,3,4,5,6,7,8,9].map((p) => <option key={p}>{p}</option>)}</select></div>
        <div className="col-md-4"><input className="form-control" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      </div></div>
      <div className="cardx p-3 table-responsive"><table className="table align-middle"><thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead><tbody>
        {students.map((s) => <tr key={s._id}><td className="fw-bold">{s.rollNo}</td><td>{s.name}</td><td><div className="d-flex gap-2 flex-wrap">{statuses.map((st) => <button key={st} className={`att-btn att-${st} ${records[s._id] === st ? "shadow" : "opacity-50"}`} onClick={() => setRecords({ ...records, [s._id]: st })}>{label[st]}</button>)}</div></td></tr>)}
      </tbody></table></div>
    </>
  );
}
