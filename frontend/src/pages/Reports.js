import { useEffect, useState } from "react";
import api from "../utils/api";
import { CLASSES, PageHead, PercentBar } from "./shared";
import { useAuth } from "../context/AuthContext";

export default function Reports() {
  const { user } = useAuth();
  const [cls, setCls] = useState(user.classAssigned || "");
  const [rows, setRows] = useState([]);
  const classes = user.classAssigned ? [user.classAssigned] : CLASSES.filter((c) => !user.department || c.startsWith(user.department));
  const load = () => api.get("/attendance/report", { params: { class: cls || undefined } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  return (
    <>
      <PageHead title="Attendance Reports" sub="Student-wise attendance percentage counts Present, OD, and Late as attended" />
      <div className="cardx p-3 mb-3 d-flex gap-2"><select className="form-select" style={{ maxWidth: 240 }} value={cls} onChange={(e) => setCls(e.target.value)}><option value="">All classes</option>{classes.map((c) => <option key={c}>{c}</option>)}</select><button className="btn btn-primary" onClick={load}>Load</button></div>
      <div className="cardx p-3 table-responsive"><table className="table align-middle"><thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Total</th><th>Present</th><th>Absent</th><th>OD</th><th>Late</th><th>%</th></tr></thead><tbody>
        {rows.map((r) => <tr key={r.student._id}><td className="fw-bold">{r.student.rollNo}</td><td>{r.student.name}</td><td>{r.student.class}</td><td>{r.total}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.od}</td><td>{r.late}</td><td style={{ minWidth: 140 }}><div className="fw-bold">{r.percentage}%</div><PercentBar value={r.percentage} /></td></tr>)}
      </tbody></table></div>
    </>
  );
}
