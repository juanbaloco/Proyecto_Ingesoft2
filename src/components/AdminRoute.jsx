import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }) => {
  const { status, role } = useSelector((s) => s.auth);

  if (status !== "authenticated") {
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
