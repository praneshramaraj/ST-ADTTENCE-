export const CLASSES = ["IT-A", "IT-B", "IT-C", "IT-D", "ECE-A", "ECE-B", "CSE-A", "CSE-B", "AIDS-A", "AIDS-B", "AIDS-C", "AIML-A", "MECH-A"];
export const today = () => new Date().toISOString().slice(0, 10);
export const pctClass = (p) => (p >= 75 ? "bar-green" : p >= 60 ? "bar-yellow" : "bar-red");
export const statusText = (p) => (p >= 75 ? "Good Standing" : p >= 60 ? "At Risk" : "Low - Act Now");

export function Stat({ icon, label, value, tone = "primary" }) {
  return (
    <div className="cardx stat-card">
      <div className={`stat-icon icon-${tone}`}><i className={`bi ${icon}`} /></div>
      <div><div className="stat-value">{value ?? 0}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

export function Badge({ value }) {
  return <span className={`badge-soft badge-${value}`}>{value === "CounsellorApproved" ? "Awaiting HOD" : value}</span>;
}

export function PageHead({ title, sub, action }) {
  return <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"><div><h1 className="page-title">{title}</h1>{sub && <p className="page-subtitle">{sub}</p>}</div>{action}</div>;
}

export function PercentBar({ value }) {
  return <div className="bar"><span className={pctClass(value)} style={{ width: `${Math.min(100, value || 0)}%` }} /></div>;
}
