import { useEffect, useState } from "react";
import api from "../utils/api";
import { Badge, CLASSES, PageHead } from "./shared";
import { useAuth } from "../context/AuthContext";

export default function Achievements() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const load = () => api.get("/achievements", { params: { class: classFilter || undefined } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [classFilter]);
  async function review(id, status) {
    const hodRemark = prompt("HOD remark") || "";
    await api.put(`/achievements/${id}/review`, { status, hodRemark });
    load();
  }
  return (
    <>
      <PageHead title="Student Uploads" sub="Review achievement certificates and winning photos" action={<select className="form-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}><option value="">All classes</option>{CLASSES.filter((c) => !user.department || c.startsWith(user.department)).map((c) => <option key={c}>{c}</option>)}</select>} />
      <div className="cardx p-3 table-responsive"><table className="table align-middle"><thead><tr><th>Student</th><th>Class</th><th>Title</th><th>Category</th><th>Files</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {rows.map((r) => <tr key={r._id}><td><div className="fw-bold">{r.student?.name}</div><small>{r.student?.rollNo}</small></td><td>{r.class}</td><td>{r.title}</td><td>{r.category}</td><td>{r.certificateUrl && <a className="btn btn-sm btn-outline me-2" href={r.certificateUrl} target="_blank" rel="noreferrer">Certificate</a>}{r.winningPhotoUrls?.length || 0} photos</td><td><Badge value={r.status} /></td><td>{r.status === "Pending" && <div className="d-flex gap-2"><button className="btn btn-sm btn-success" onClick={() => review(r._id, "Verified")}>Verify</button><button className="btn btn-sm btn-danger" onClick={() => review(r._id, "Rejected")}>Reject</button></div>}</td></tr>)}
      </tbody></table></div>
    </>
  );
}
