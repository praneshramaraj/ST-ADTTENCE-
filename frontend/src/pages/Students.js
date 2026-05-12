import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { CLASSES, PageHead } from "./shared";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ gender: "Other", batch: "2024-2028" });
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const load = () => api.get("/students", { params: { search, class: classFilter || undefined } }).then((r) => setStudents(r.data.filter(Boolean)));
  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [classFilter]);
  async function add(e) {
    e.preventDefault();
    await api.post("/students", form);
    setForm({ gender: "Other", batch: "2024-2028" });
    load();
  }
  async function bulk() {
    await api.post("/students/bulk", { class: form.class });
    load();
  }
  async function login(id) {
    await api.post("/auth/create-student-login", { studentId: id });
    alert("Student login created with password student@123");
  }
  return (
    <>
      <PageHead title="Student Management" sub="Search, add, bulk load, and create student logins" />
      <div className="row g-3">
        <div className="col-xl-4">
          <form className="cardx p-4" onSubmit={add}>
            <h5 className="fw-bold mb-3">Add Student</h5>
            {["rollNo", "name", "email", "parentEmail", "phone", "parentPhone", "batch"].map((f) => <input key={f} className="form-control mb-2" placeholder={f} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={["rollNo", "name"].includes(f)} />)}
            <select className="form-select mb-2" value={form.class || ""} required onChange={(e) => setForm({ ...form, class: e.target.value })}><option value="">Class</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
            <select className="form-select mb-3" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select>
            <div className="d-flex gap-2"><button className="btn btn-primary flex-fill">Add</button><button type="button" className="btn btn-outline" onClick={bulk}>Bulk 60</button></div>
          </form>
        </div>
        <div className="col-xl-8">
          <div className="cardx p-3">
            <div className="d-flex gap-2 mb-3">
              <select className="form-select" style={{ maxWidth: 180 }} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="">All classes</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className="form-control" placeholder="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn btn-primary" onClick={load}>Search</button>
            </div>
            <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Email</th><th></th></tr></thead><tbody>
              {students.map((s) => <tr key={s._id}><td className="fw-bold">{s.rollNo}</td><td><Link to={`/students/${s._id}`}>{s.name}</Link></td><td>{s.class}</td><td>{s.email}</td><td><button className="btn btn-sm btn-outline" onClick={() => login(s._id)}>Create Login</button></td></tr>)}
            </tbody></table></div>
          </div>
        </div>
      </div>
    </>
  );
}
