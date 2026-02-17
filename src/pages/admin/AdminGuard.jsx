import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../data/auth";

export default function AdminGuard({ children }) {
  if (!isLoggedIn()) return <Navigate to="/admin" replace />;
  return children;
}