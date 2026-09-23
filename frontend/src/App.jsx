import { Routes, Route, Navigate } from "react-router-dom";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import TrackComplaint from "./pages/TrackComplaint.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function RequireAdmin({ children }) {
  const token = sessionStorage.getItem("cv_admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ComplaintForm />} />
      <Route path="/track" element={<TrackComplaint />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
