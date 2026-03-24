// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./features/auth/Login.jsx";
import Register from "./features/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PublicRoute from "./components/PublicRoutes.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Register */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;