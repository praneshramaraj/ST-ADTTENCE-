import { useEffect, useState } from "react";
import api from "../utils/api";
import { Badge, CLASSES, PageHead } from "./shared";
import { useAuth } from "../context/AuthContext";

export default function Requests({ kind }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const load = () => api.get(`/${kind}`, { params: { class: classFilter || undefined } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [kind, classFilter]);
  async function act(id, level, status) {
    const remark = prompt("Remark") || "";
    await api.put(`/${kind}/${id}/${level}`, { status, remark });
    load();
  }
  const title = kind === "leaves" ? "Leave Requests" : "OD Requests";
  return (
    <>
      <PageHead title={title} sub="Two-stage counsellor and HOD approval flow" action={user.role === "hod" && <select className="form-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}><option value="">All classes</option>{CLASSES.filter((c) => !user.department || c.startsWith(user.department)).map((c) => <option key={c}>{c}</option>)}</select>} />
      <div className="cardx p-3 table-responsive"><table className="table align-middle"><thead><tr><th>Student</th><th>Class</th><th>Dates</th><th>Details</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {rows.map((r) => <tr key={r._id}><td><div className="fw-bold">{r.student?.name}</div><small>{r.student?.rollNo}</small></td><td>{r.student?.class}</td><td>{kind === "leaves" ? `${r.fromDate} to ${r.toDate}` : `${r.date}${r.endDate ? ` to ${r.endDate}` : ""}`}</td><td>{kind === "leaves" ? `${r.type}: ${r.reason}` : `${r.event}: ${r.purpose}`}</td><td><Badge value={r.status} /></td><td>
          {user.role !== "hod" && r.status === "Pending" && <div className="d-flex gap-2"><button className="btn btn-sm btn-success" onClick={() => act(r._id, "counsellor", "Approved")}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => act(r._id, "counsellor", "Rejected")}>Reject</button></div>}
          {user.role === "hod" && r.status === "CounsellorApproved" && <div className="d-flex gap-2"><button className="btn btn-sm btn-success" onClick={() => act(r._id, "hod", "Approved")}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => act(r._id, "hod", "Rejected")}>Reject</button></div>}
        </td></tr>)}
      </tbody></table></div>
    </>
  );
}
