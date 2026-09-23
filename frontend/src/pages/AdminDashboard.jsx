import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Overview from "./admin/Overview.jsx";
import ComplaintsList from "./admin/ComplaintsList.jsx";
import "../styles/admin.css";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();

  function logout() {
    sessionStorage.removeItem("cv_admin_token");
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="wordmark">CampusVoice</div>
        <div className="subtitle">Faculty review dashboard</div>
        <nav className="admin-nav">
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={tab === "complaints" ? "active" : ""}
            onClick={() => setTab("complaints")}
          >
            All complaints
          </button>
        </nav>
        <button className="logout" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        <h1>{tab === "overview" ? "Overview" : "All complaints"}</h1>
        <p className="admin-sub">
          {tab === "overview"
            ? "Aggregated patterns across every anonymous submission."
            : "Review and update the status of individual complaints."}
        </p>

        {tab === "overview" ? <Overview /> : <ComplaintsList />}
      </main>
    </div>
  );
}
