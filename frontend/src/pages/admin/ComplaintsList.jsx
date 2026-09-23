import { useEffect, useState } from "react";
import { fetchComplaints, updateComplaint } from "../../api.js";

const STATUSES = ["New", "In review", "Resolved"];
const CATEGORIES = [
  "Lecturers & Teaching",
  "Facilities",
  "Course Registration",
  "Harassment & Welfare",
  "Exams & Grading",
  "Other",
];

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();
      const data = await fetchComplaints(params);
      setComplaints(data);
    } catch (err) {
      setError("Couldn't load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  async function handleStatusChange(id, status) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    try {
      await updateComplaint(id, { status });
    } catch (err) {
      load();
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <>
      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search complaint text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" type="submit" style={{ padding: "9px 18px" }}>
          Search
        </button>
      </form>

      {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

      {!loading && complaints.length === 0 ? (
        <div className="empty-state">No complaints match these filters.</div>
      ) : (
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Department</th>
              <th>Category</th>
              <th>Message</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td className="tracking-code">{c.tracking_code}</td>
                <td>{c.department}</td>
                <td>{c.category}</td>
                <td className="complaint-message">{c.message}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                <td>
                  <select
                    className="status-select"
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
