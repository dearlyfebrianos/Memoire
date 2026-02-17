import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const isAdmin = sessionStorage.getItem("memoire_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}