import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const next = (u) => (u.role === "hod" ? "/hod" : u.role === "student" ? "/student" : "/dashboard");
const normalizeRoll = (v) => v.split("@")[0].toUpperCase().trim();

export default function Login() {
  const [tab, setTab] = useState("staff");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (tab === "staff") {
        const user = await login(form.login, form.password);
        navigate(next(user));
      } else {
        const user = await login(normalizeRoll(form.rollNo || ""), form.password);
        navigate(next(user));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to continue");
    }
  }

  function fillStaff(loginValue, password) {
    setTab("staff");
    setError("");
    setForm({ ...form, login: loginValue, password });
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="text-center mb-4">
          <img className="logo-lg mb-3" src="/st_college_logo.png?v=2" alt="ST" />
          <h1 className="h3 fw-bold mb-1">St Attendance</h1>
          <div className="text-muted fw-semibold">We Make You Shine</div>
        </div>
        <div className="login-tabs mb-4">
          <button type="button" className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>Staff</button>
          <button type="button" className={tab === "student" ? "active" : ""} onClick={() => setTab("student")}>Student</button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {tab === "staff" ? (
          <>
            <label className="form-label fw-bold">Email</label>
            <input className="form-control mb-3" required value={form.login || ""} onChange={(e) => setForm({ ...form, login: e.target.value })} />
            <label className="form-label fw-bold">Password</label>
            <input className="form-control mb-3" type="password" required value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div className="d-grid gap-2 mb-4">
              <button type="button" className="btn btn-outline" onClick={() => fillStaff("hod@college.edu", "hod@sjit")}>
                <i className="bi bi-person-badge me-2" />HOD Login
              </button>
              <button type="button" className="btn btn-outline" onClick={() => fillStaff("it-a@college.edu", "sjit@321")}>
                <i className="bi bi-person-workspace me-2" />Counsellor Login
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="form-label fw-bold">Roll Number</label>
            <input className="form-control mb-3 text-uppercase" required value={form.rollNo || ""} onChange={(e) => setForm({ ...form, rollNo: normalizeRoll(e.target.value) })} />
            <label className="form-label fw-bold">Password</label>
            <input className="form-control mb-4" type="password" required value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="btn btn-outline w-100 mb-4" onClick={() => { setTab("student"); setForm({ ...form, rollNo: "24ITA001", password: "student@123" }); }}>
              <i className="bi bi-person me-2" />Sample Student Login
            </button>
          </>
        )}
        <button className="btn btn-primary w-100 py-2">Sign In</button>
      </form>
    </div>
  );
}
