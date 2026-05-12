import { useEffect, useState } from "react";
import api from "../utils/api";
import { PageHead } from "./shared";

const keys = ["leaveSubmitted", "leaveApprovedCounsellor", "leaveApprovedHOD", "leaveRejected", "odApproved", "absentAlert", "lowAttendanceWarning"];

export default function EmailSettings() {
  const [settings, setSettings] = useState({});
  useEffect(() => { api.get("/email/settings").then((r) => setSettings(r.data)); }, []);
  async function save(next = settings) { const { data } = await api.put("/email/settings", next); setSettings(data); }
  return (
    <>
      <PageHead title="Email Settings" sub="Toggle branded alert templates" action={<button className="btn btn-primary" onClick={() => save()}>Save</button>} />
      <div className="cardx p-4">{keys.map((k) => <label key={k} className="d-flex align-items-center justify-content-between py-3 border-bottom"><span className="fw-bold">{k.replace(/([A-Z])/g, " $1")}</span><input className="form-check-input fs-5" type="checkbox" checked={!!settings[k]} onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })} /></label>)}</div>
    </>
  );
}
