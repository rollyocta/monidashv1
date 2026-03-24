import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <p>Loading...</p>;
  if (token) return <Navigate to="/dashboard" />;
  return children;
};

export default PublicRoute;