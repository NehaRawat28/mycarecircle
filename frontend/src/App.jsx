import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import FamilyMembers from "./pages/FamilyMembers";
import FamilyMemberDetail from "./pages/FamilyMemberDetail";
import Medicines from "./pages/Medicines";
import Appointments from "./pages/Appointments";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/family" element={<FamilyMembers />} />
          <Route path="/family/:id" element={<FamilyMemberDetail />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/emergency" element={<Emergency />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
