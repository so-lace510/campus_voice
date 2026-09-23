import { useState } from "react";
import PublicNav from "../components/PublicNav.jsx";
import { trackComplaint } from "../api.js";
import "../styles/public.css";

function statusSlug(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function TrackComplaint() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!code.trim()) {
      setError("Enter the tracking code you were given at submission.");
      return;
    }
    setLoading(true);
    try {
      const data = await trackComplaint(code.trim());
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.status === 404
          ? "No complaint matches that code. Double-check it and try again."
          : "Something went wrong looking that up."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-page">
      <PublicNav />
      <main className="hero-wrap" style={{ display: "block" }}>
        <div className="track-panel">
          <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Track a complaint</h1>
          <p className="lede" style={{ marginBottom: 32 }}>
            Enter the code you received when you submitted. This works
            without any login — it's the only key that maps to your
            complaint.
          </p>

          <form onSubmit={handleSubmit} className="form-panel" noValidate>
            <div className="field">
              <label htmlFor="code">Tracking code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. 61804D95"
                maxLength={16}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="submit-row">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Looking up…" : "Check status"}
              </button>
            </div>
          </form>

          {result && (
            <div className="form-panel" style={{ marginTop: 24 }}>
              <span className={`status-badge status-${statusSlug(result.status)}`}>
                {result.status}
              </span>
              <p style={{ marginTop: 16, color: "var(--ink-soft)" }}>
                Submitted {new Date(result.created_at).toLocaleDateString()}
                {" · "}
                Last updated {new Date(result.updated_at).toLocaleDateString()}
              </p>
              {result.admin_note && (
                <div style={{ marginTop: 18 }}>
                  <strong>Note from the review team</strong>
                  <p style={{ marginTop: 6 }}>{result.admin_note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
