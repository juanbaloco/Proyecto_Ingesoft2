// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { status } = useSelector((s) => s.auth);
  if (status !== "authenticated") return <Navigate to="/login" replace />;
  return children;
};
