import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, MapPin, Star } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!userRole || userRole !== "STUDENT" || !token) {
      navigate("/login");
      return;
    }

    setStudentName(localStorage.getItem("userName") || "Student");
    fetchStalls(token);
  }, [navigate]);

  const fetchStalls = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/marketplace/stalls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStalls(response.data);
    } catch (error) {
      setMessage("Failed to load campus stalls.");
    }
  };

  const filteredStalls = stalls.filter((stall) => {
    const query = searchQuery.toLowerCase();
    return (
      stall.name.toLowerCase().includes(query) ||
      (stall.category || "").toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <aside style={{ width: "280px", backgroundColor: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#7A0019", margin: "0 0 0.25rem 0" }}>SnackDash</h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: "500" }}>CIT - University</p>
        </div>

        <nav style={{ padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <button onClick={() => navigate("/dashboard")} style={navButton(true)}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => navigate("/my-orders")} style={navButton(false)}>
            <ShoppingBag size={20} />
            My Orders
          </button>
          <button style={navButton(false)}>
            <User size={20} />
            Profile Settings
          </button>
        </nav>

        <div style={{ padding: "1.5rem 1rem", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={{ ...navButton(false), color: "#ef4444" }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Welcome back, {studentName}!</h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", margin: 0 }}>Browse live stalls and order directly from campus vendors.</p>
          </div>

          <div style={{ position: "relative", width: "400px", maxWidth: "100%" }}>
            <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search stalls or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "9999px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", fontSize: "0.95rem" }}
            />
          </div>
        </header>

        {message && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>Campus Food Stalls</h3>
          <span style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: "500" }}>Showing {filteredStalls.length} stalls</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {filteredStalls.map((stall) => (
            <button
              key={stall.id}
              onClick={() => navigate(`/stalls/${stall.id}`)}
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 12px rgba(15,23,42,0.06)", textAlign: "left", padding: 0, cursor: "pointer" }}
            >
              <div style={{ position: "relative", height: "190px", backgroundColor: "#e5e7eb" }}>
                {stall.imageUrl ? (
                  <img src={stall.imageUrl} alt={stall.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No image</div>
                )}
                <span style={{ position: "absolute", top: "14px", right: "14px", fontSize: "0.75rem", fontWeight: "700", padding: "6px 12px", borderRadius: "9999px", backgroundColor: stall.open ? "#dcfce7" : "#e5e7eb", color: stall.open ? "#166534" : "#475569" }}>
                  {stall.open ? "Open" : "Closed"}
                </span>
              </div>

              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0, color: "#0f172a" }}>{stall.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#fef3c7", padding: "4px 8px", borderRadius: "8px" }}>
                    <Star size={16} fill="#eab308" color="#eab308" />
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#854d0e" }}>4.8</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#7A0019", fontWeight: "600", margin: "0 0 0.75rem 0" }}>{stall.category || "Food Stall"}</p>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 1rem 0", minHeight: "42px" }}>{stall.description || "No description available yet."}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "0.9rem" }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: "0.85rem" }}>Campus Stall</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function navButton(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    borderRadius: "12px",
    color: active ? "#7A0019" : "#64748b",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    border: "none",
    background: active ? "#fff0f2" : "transparent",
    width: "100%",
    textAlign: "left",
    fontSize: "0.95rem",
    boxShadow: active ? "inset 4px 0 0 #7A0019" : "none",
  };
}
