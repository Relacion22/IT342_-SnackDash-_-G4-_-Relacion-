import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentOrders from './pages/StudentOrders';
import StallDetails from './pages/StallDetails';
import MenuDashboard from './pages/MenuDashboard';
import CreateStall from './pages/CreateStall';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/my-orders" element={<StudentOrders />} />
        <Route path="/stalls/:stallId" element={<StallDetails />} />
        <Route path="/create-stall" element={<CreateStall />} />
        <Route path="/menu-dashboard" element={<MenuDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
