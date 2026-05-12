import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = {
  counsellor: [
    ["Dashboard", "/dashboard", "bi-speedometer2"],
    ["Take Attendance", "/attendance", "bi-calendar-check"],
    ["Students", "/students", "bi-people"],
    ["Timetable", "/timetable", "bi-table"],
    ["Leave Requests", "/leaves", "bi-envelope-open"],
    ["OD Requests", "/od", "bi-briefcase"],
    ["Reports", "/reports", "bi-bar-chart"]
  ],
  hod: [
    ["HOD Dashboard", "/hod", "bi-speedometer"],
    ["Students", "/students", "bi-people"],
    ["Student Uploads", "/achievements", "bi-trophy"],
    ["Leave Requests", "/leaves", "bi-envelope-open"],
    ["OD Requests", "/od", "bi-briefcase"],
    ["Reports", "/reports", "bi-bar-chart"],
    ["Email Settings", "/email-settings", "bi-gear"]
  ],
  student: [
    ["Dashboard", "/student", "bi-house"],
    ["My Attendance", "/student?tab=attendance", "bi-calendar2-check"],
    ["My Leaves", "/student?tab=leaves", "bi-envelope"],
    ["My OD", "/student?tab=od", "bi-briefcase"],
    ["My Achievements", "/student?tab=achievements", "bi-trophy"]
  ]
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = nav[user.role] || [];
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <img src="/st_college_logo.png?v=2" alt="ST" />
          <div>
            <div className="brand-title">{user.role === "student" ? "Student Portal" : "ST Attendance"}</div>
            <div className="brand-sub">SJIT, Chennai - 119</div>
          </div>
        </div>
        <nav className="nav-list">
          {items.map(([label, to, icon]) => (
            <NavLink key={label} to={to} className={({ isActive }) => `nav-item ${isActive || location.pathname + location.search === to ? "active" : ""}`}>
              <i className={`bi ${icon}`} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user.name}</strong>
            <span className="text-muted ms-2">{user.role.toUpperCase()} {user.classAssigned || user.department || ""}</span>
          </div>
          <button className="btn btn-outline" onClick={logout}><i className="bi bi-box-arrow-right me-2" />Logout</button>
        </header>
        <div className="page">{children}</div>
      </main>
    </>
  );
}
