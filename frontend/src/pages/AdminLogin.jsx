import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api.js";
import "../styles/public.css";
import "../styles/admin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await adminLogin(password);
      sessionStorage.setItem("cv_admin_token", access_token);
      navigate("/admin");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Couldn't sign in. Check the password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-panel">
        <h1>Faculty review sign-in</h1>
        <p className="sub">This dashboard is only for authorized staff.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
          <div className="submit-row" style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
        <a href="/">← Back to the complaint form</a>
      </div>
    </div>
  );
}
