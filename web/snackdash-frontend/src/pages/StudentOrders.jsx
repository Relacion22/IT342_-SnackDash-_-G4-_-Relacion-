import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, LogOut, ShoppingBag, User } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";
const STATUS_STEPS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function StudentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "STUDENT") {
      navigate("/login");
      return;
    }

    fetchOrders(token);
    const intervalId = setInterval(() => fetchOrders(localStorage.getItem("token")), 5000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      setMessage("Failed to load orders.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <aside style={{ width: "280px", backgroundColor: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#7A0019", margin: "0 0 0.25rem 0" }}>SnackDash</h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: "500" }}>CIT - University</p>
        </div>
        <nav style={{ padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <button onClick={() => navigate("/dashboard")} style={navButton(false)}><LayoutDashboard size={20} />Dashboard</button>
          <button onClick={() => navigate("/my-orders")} style={navButton(true)}><ShoppingBag size={20} />My Orders</button>
          <button style={navButton(false)}><User size={20} />Profile Settings</button>
        </nav>
        <div style={{ padding: "1.5rem 1rem", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ ...navButton(false), color: "#ef4444" }}><LogOut size={20} />Logout</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <h1 style={{ marginTop: 0, color: "#0f172a" }}>My Orders</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>Your orders automatically update while the stall owner processes them.</p>
        {message && <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>{message}</div>}
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", color: "#64748b" }}>You have no orders yet.</div>
          ) : orders.map((order) => (
            <div key={order.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a" }}>{order.stallName}</h3>
                  <p style={{ margin: 0, color: "#64748b" }}>{order.orderNumber}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ display: "block", color: "#7A0019" }}>{formatStatus(order.status)}</strong>
                  <span style={{ color: "#64748b" }}>PHP {parseFloat(order.totalPrice).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {STATUS_STEPS.map((status, index) => {
                  const currentIndex = STATUS_STEPS.indexOf(order.status);
                  const completed = currentIndex >= index;
                  return <div key={status} style={{ flex: 1, height: "10px", borderRadius: "9999px", backgroundColor: completed ? "#7A0019" : "#e2e8f0" }} />;
                })}
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#334155" }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
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

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
