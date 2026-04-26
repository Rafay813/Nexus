// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider }   from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute     from "./components/Shared/ProtectedRoute";

import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage   from "./pages/ProfilePage";
import MeetingPage   from "./pages/MeetingPage";
import VideoCallPage from "./pages/VideoCallPage";
import DocumentsPage from "./pages/DocumentsPage";
import PaymentPage   from "./pages/PaymentPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1e293b",
                color:      "#f1f5f9",
                border:     "1px solid #334155",
                borderRadius: "10px",
                fontSize:   "14px",
              },
              success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />

          <Routes>
            {/* ── Public ── */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Protected ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile"   element={<ProfilePage />} />
              <Route path="/meetings"  element={<MeetingPage />} />
              <Route path="/videocall" element={<VideoCallPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/payment"   element={<PaymentPage />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;