import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { PageHead, PercentBar, Badge } from "./shared";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [att, setAtt] = useState(null);
  useEffect(() => {
    api.get(`/students/${id}`).then((r) => setStudent(r.data));
    api.get(`/attendance/student/${id}`).then((r) => setAtt(r.data));
  }, [id]);
  if (!student) return null;
  return (
    <>
      <PageHead title={student.name} sub={`${student.rollNo} · ${student.class}`} />
      <div className="row g-3">
        <div className="col-lg-4"><div className="cardx p-4"><h5 className="fw-bold">Attendance</h5><div className="display-5 fw-bold">{att?.percentage || 0}%</div><PercentBar value={att?.percentage || 0} /></div></div>
        <div className="col-lg-8"><div className="cardx p-4"><h5 className="fw-bold">Profile</h5><div className="row g-2">{["email", "parentEmail", "phone", "parentPhone", "gender", "batch", "absentReason"].map((k) => <div className="col-md-6" key={k}><small className="text-muted text-uppercase">{k}</small><div className="fw-bold">{student[k] || "-"}</div></div>)}</div></div></div>
        <div className="col-12"><div className="cardx p-3"><table className="table"><thead><tr><th>Date</th><th>Period</th><th>Subject</th><th>Status</th></tr></thead><tbody>{att?.rows?.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.period}</td><td>{r.subject}</td><td><Badge value={r.status === "Absent" ? "Rejected" : "Approved"} /></td></tr>)}</tbody></table></div></div>
      </div>
    </>
  );
}
