import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <p>Loading...</p>;
  if (!token) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;