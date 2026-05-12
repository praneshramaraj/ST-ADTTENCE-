import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Requests from "./pages/Requests";
import Reports from "./pages/Reports";
import HodDashboard from "./pages/HodDashboard";
import Achievements from "./pages/Achievements";
import Timetable from "./pages/Timetable";
import EmailSettings from "./pages/EmailSettings";
import StudentPortal from "./pages/StudentPortal";

function homeFor(user) {
  if (!user) return "/login";
  if (user.role === "hod") return "/hod";
  if (user.role === "student") return "/student";
  return "/dashboard";
}

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={homeFor(user)} /> : <Login />} />
        <Route path="/dashboard" element={<Protected roles={["counsellor"]}><Dashboard /></Protected>} />
        <Route path="/attendance" element={<Protected roles={["counsellor", "hod"]}><Attendance /></Protected>} />
        <Route path="/students" element={<Protected roles={["counsellor", "hod"]}><Students /></Protected>} />
        <Route path="/students/:id" element={<Protected roles={["counsellor", "hod", "student"]}><StudentDetail /></Protected>} />
        <Route path="/leaves" element={<Protected roles={["counsellor", "hod"]}><Requests kind="leaves" /></Protected>} />
        <Route path="/od" element={<Protected roles={["counsellor", "hod"]}><Requests kind="od" /></Protected>} />
        <Route path="/reports" element={<Protected roles={["counsellor", "hod"]}><Reports /></Protected>} />
        <Route path="/hod" element={<Protected roles={["hod"]}><HodDashboard /></Protected>} />
        <Route path="/achievements" element={<Protected roles={["hod"]}><Achievements /></Protected>} />
        <Route path="/timetable" element={<Protected roles={["counsellor", "hod"]}><Timetable /></Protected>} />
        <Route path="/email-settings" element={<Protected roles={["hod"]}><EmailSettings /></Protected>} />
        <Route path="/student" element={<Protected roles={["student"]}><StudentPortal /></Protected>} />
        <Route path="*" element={<Navigate to={homeFor(user)} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
