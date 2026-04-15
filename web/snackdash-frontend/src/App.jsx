import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard'; // <-- Import it here!
import MenuDashboard from './pages/MenuDashboard'; // <-- Import it here!

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} /> {/* <-- Route it here! */}
        <Route path="/menu-dashboard" element={<MenuDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;