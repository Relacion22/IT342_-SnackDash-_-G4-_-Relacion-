import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      setMessage("✅ " + response.data);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      if (error.response) {
        setMessage("❌ " + error.response.data);
      } else {
        setMessage("❌ Cannot connect to server.");
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      {/* Embedded CSS for professional hover/focus states */}
      <style>{`
        .custom-input:focus { outline: 2px solid #7A0019; outline-offset: -1px; background-color: #fff !important; }
        .custom-btn:hover { background-color: #5a0012 !important; transform: translateY(-1px); }
        .custom-btn:active { transform: translateY(0); }
        .tab-btn:hover { color: #111827 !important; }
        .link-btn:hover { text-decoration: underline; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '14px', backgroundColor: '#7A0019', marginBottom: '1.25rem', boxShadow: '0 4px 14px rgba(122, 0, 25, 0.25)' }}>
            <Lock style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.35rem', letterSpacing: '-0.025em' }}>SnackDash</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Welcome back! Please enter your details.</p>
        </div>

        {/* Card Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)', padding: '2.5rem 2rem' }}>

          {/* Segmented Control (Tabs) */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '0.35rem', marginBottom: '2rem' }}>
             <button type="button" onClick={() => setRole("STUDENT")} className="tab-btn" style={{ flex: 1, padding: '0.6rem 0', borderRadius: '8px', border: 'none', background: role === "STUDENT" ? 'white' : 'transparent', color: role === "STUDENT" ? '#111827' : '#64748b', fontWeight: role === "STUDENT" ? '600' : '500', fontSize: '0.875rem', boxShadow: role === "STUDENT" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>Student</button>
             <button type="button" onClick={() => setRole("OWNER")} className="tab-btn" style={{ flex: 1, padding: '0.6rem 0', borderRadius: '8px', border: 'none', background: role === "OWNER" ? 'white' : 'transparent', color: role === "OWNER" ? '#111827' : '#64748b', fontWeight: role === "OWNER" ? '600' : '500', fontSize: '0.875rem', boxShadow: role === "OWNER" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>Stall Owner</button>
             <button type="button" onClick={() => setRole("ADMIN")} className="tab-btn" style={{ flex: 1, padding: '0.6rem 0', borderRadius: '8px', border: 'none', background: role === "ADMIN" ? 'white' : 'transparent', color: role === "ADMIN" ? '#111827' : '#64748b', fontWeight: role === "ADMIN" ? '600' : '500', fontSize: '0.875rem', boxShadow: role === "ADMIN" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>Admin</button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {role === "STUDENT" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="studentId" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Student ID</label>
                <input id="studentId" type="text" placeholder="Enter your student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="custom-input" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid transparent', backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Email Address</label>
              <input id="email" type="email" placeholder="name@cit.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="custom-input" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid transparent', backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Password</label>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="custom-input" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid transparent', backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" className="custom-btn" style={{ width: '100%', padding: '0.875rem', marginTop: '0.75rem', backgroundColor: '#7A0019', color: 'white', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(122, 0, 25, 0.2)' }}>
              Sign In
            </button>
          </form>

          {message && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500', backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2', color: message.includes('✅') ? '#065f46' : '#991b1b', border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}` }}>
              {message}
            </div>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")} className="link-btn" style={{ color: '#7A0019', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}