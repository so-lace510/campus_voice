import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { fetchAnalytics } from "../../api.js";

const CHART_COLORS = ["#285c53", "#b8892b", "#6b4478", "#a6432f", "#1c2340", "#8f6a1f"];

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(() => setError("Couldn't load analytics right now."));
  }, []);

  if (error) return <p className="form-error" style={{ marginTop: 24 }}>{error}</p>;
  if (!data) return <p className="admin-sub">Loading analytics…</p>;

  if (data.total_complaints === 0) {
    return (
      <div className="empty-state">
        No complaints submitted yet. Once students start submitting, an
        overview and recommendations will appear here.
      </div>
    );
  }

  return (
    <>
      <div className="kpi-row">
        <div className="kpi">
          <div className="value">{data.total_complaints}</div>
          <div className="label">Total complaints</div>
        </div>
        <div className="kpi">
          <div className="value">{data.new_count}</div>
          <div className="label">Awaiting review</div>
        </div>
        <div className="kpi">
          <div className="value">{data.in_review_count}</div>
          <div className="label">In review</div>
        </div>
        <div className="kpi">
          <div className="value">{data.resolved_count}</div>
          <div className="label">Resolved</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="panel">
          <h3>Complaints by category</h3>
          <div style={{ height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_category} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#285c53" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Last 30 days</h3>
          <div style={{ height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcd6c4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={4}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis allowDecimals={false} width={30} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#b8892b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel memo-panel">
        <h3>Recommendations for the faculty board</h3>
        <ul>
          {data.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {data.top_keywords.length > 0 && (
        <div className="panel" style={{ marginTop: 24 }}>
          <h3>Words that come up most</h3>
          <div className="keyword-row">
            {data.top_keywords.map((k) => (
              <span className="keyword-chip" key={k.word}>
                {k.word}
                <span className="n">{k.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
