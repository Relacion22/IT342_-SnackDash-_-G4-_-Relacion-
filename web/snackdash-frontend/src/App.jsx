import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentOrders from './pages/StudentOrders';
import StallDetails from './pages/StallDetails';
import MenuDashboard from './pages/MenuDashboard';
import CreateStall from './pages/CreateStall';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EditProfile from './pages/EditProfile';

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
