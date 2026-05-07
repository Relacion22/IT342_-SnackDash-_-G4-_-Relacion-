import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- UPDATED VERTICAL SLICE IMPORTS ---
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import StudentDashboard from './features/student/StudentDashboard';
import StudentOrders from './features/student/StudentOrders';
import StallDetails from './features/vendor/StallDetails';
import MenuDashboard from './features/vendor/MenuDashboard';
import CreateStall from './features/vendor/CreateStall';

// --- STANDARD IMPORTS ---
import AdminDashboard from './pages/AdminDashboard';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/edit-profile" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentOrders />
          </ProtectedRoute>
        } />
        <Route path="/stalls/:stallId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StallDetails />
          </ProtectedRoute>
        } />

        {/* Owner Routes */}
        <Route path="/create-stall" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <CreateStall />
          </ProtectedRoute>
        } />
        <Route path="/menu-dashboard" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <MenuDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;