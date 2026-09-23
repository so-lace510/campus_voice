import { useEffect, useState } from "react";
import PublicNav from "../components/PublicNav.jsx";
import { submitComplaint, fetchCategories } from "../api.js";
import "../styles/public.css";

const FALLBACK_CATEGORIES = [
  "Lecturers & Teaching",
  "Facilities",
  "Course Registration",
  "Harassment & Welfare",
  "Exams & Grading",
  "Other",
];

const MAX_LEN = 4000;

export default function ComplaintForm() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length) setCategories(list);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (department.trim().length < 2) {
      setError("Let us know which department this is about.");
      return;
    }
    if (!category) {
      setError("Pick the category that fits best.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Add a few more details so this can actually be acted on.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitComplaint({
        department: department.trim(),
        category,
        message: message.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something went wrong sending this. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setResult(null);
    setDepartment("");
    setCategory("");
    setMessage("");
  }

  return (
    <div className="public-page">
      <PublicNav />
      <main className="hero-wrap">
        <div className="hero-copy">
          <h1>Say what needs to change.</h1>
          <p className="lede">
            CampusVoice collects what students are really experiencing —
            without your name attached to it — and turns it into
            recommendations your faculty can act on.
          </p>

          <dl className="assurance">
            <dt>Nothing identifies you</dt>
            <dd>
              We don't ask for your name, matric number, email, or device
              information. There's nothing here to trace back to you.
            </dd>
            <dt>You can still follow up</dt>
            <dd>
              After you submit, you'll get a tracking code. Use it on the
              "Track a complaint" page to see if it's been reviewed —
              no login needed.
            </dd>
            <dt>It feeds real analysis</dt>
            <dd>
              Faculty administrators see aggregated patterns and
              recommendations, not a name attached to a story.
            </dd>
          </dl>
        </div>

        <div className="form-panel">
          {result ? (
            <div className="success-panel">
              <h2>Sent — thank you.</h2>
              <p className="form-sub">
                Save this code. It's the only way to check on this
                complaint later, and we have no other way to find it for
                you.
              </p>
              <span className="code">{result.tracking_code}</span>
              <p className="code-hint">
                Nothing else about this submission is linked to you. If
                you want to report something else, you can start a new,
                separate complaint below.
              </p>
              <div className="submit-row">
                <button type="button" className="btn-primary" onClick={resetForm}>
                  Submit another complaint
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2>Tell us what happened</h2>
              <p className="form-sub">
                Be as specific as you can — course codes, dates, or
                recurring patterns all help.
              </p>

              <div className="field">
                <label htmlFor="department">
                  Department or unit
                  <span className="hint"> — e.g. Computer Science</span>
                </label>
                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Which department is this about?"
                  maxLength={120}
                />
              </div>

              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Choose the closest fit</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="message">What's going on</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) =>
                    e.target.value.length <= MAX_LEN && setMessage(e.target.value)
                  }
                  placeholder="Describe the issue. The more concrete, the more useful this is."
                />
                <span className="char-count">
                  {message.length} / {MAX_LEN}
                </span>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="submit-row">
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send complaint"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <p className="admin-footnote">
        Faculty staff — <a href="/admin/login">sign in to the review dashboard</a>
      </p>
    </div>
  );
}
