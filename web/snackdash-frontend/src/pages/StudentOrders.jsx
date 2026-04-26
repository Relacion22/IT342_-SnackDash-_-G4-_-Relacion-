import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ShoppingBag, X, Clock3, DollarSign } from "lucide-react";
const STATUS_STEPS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function StudentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "STUDENT") {
      navigate("/login");
      return;
    }

    fetchOrders();
    const intervalId = setInterval(() => fetchOrders(), 5000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      const ordersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setOrders(ordersData);
    } catch (error) {
      console.error("Orders fetch error:", error);
      setMessage("Failed to load orders.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: "linear-gradient(135deg, #7A0019 0%, #a8002b 100%)", backgroundImage: "linear-gradient(135deg, #7A0019 0%, #a8002b 100%)", padding: "3rem 3rem", color: "white", marginBottom: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Tracking</p>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2.2rem", fontWeight: 800 }}>My Orders</h1>
          <p style={{ margin: 0, fontSize: "1rem", opacity: 0.95 }}>Track your food orders in real-time as the stall owner prepares them.</p>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 3rem 3rem" }}>
        {message && <div style={{ marginBottom: "1rem", padding: "1rem 1.1rem", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>{message}</div>}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {orders.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "3rem", color: "#64748b", textAlign: "center", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
              <ShoppingBag size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontSize: "1.1rem", margin: 0 }}>You have no orders yet.</p>
              <button onClick={() => navigate("/dashboard")} style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#7A0019", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                Browse Stalls
              </button>
            </div>
          ) : orders.map((order) => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 12px rgba(15,23,42,0.06)", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.3s ease", transform: "scale(1)" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a", fontSize: "1.2rem" }}>{order.stallName}</h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>{order.orderNumber}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-block", backgroundColor: "#7A0019", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}>{formatStatus(order.status)}</div>
                  <p style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: "1.1rem" }}>PHP {parseFloat(order.totalPrice).toFixed(2)}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {STATUS_STEPS.map((status, index) => {
                  const currentIndex = STATUS_STEPS.indexOf(order.status);
                  const completed = currentIndex >= index;
                  return (
                    <div key={status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "100%", height: "6px", borderRadius: "9999px", backgroundColor: completed ? "#7A0019" : "#e2e8f0", marginBottom: "0.5rem" }} />
                      <span style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>{status}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "1rem", marginTop: "1.5rem" }}>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#334155" }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
          <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "2.5rem", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Details</p>
                <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#0f172a" }}>{selectedOrder.stallName}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#64748b", padding: 0 }}>
                <X size={28} />
              </button>
            </div>

            {/* Order Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Order Number</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{selectedOrder.orderNumber}</p>
              </div>
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Status</p>
                <div style={{ display: "inline-block", backgroundColor: "#7A0019", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem" }}>{formatStatus(selectedOrder.status)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Order Progress</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {STATUS_STEPS.map((status, index) => {
                  const currentIndex = STATUS_STEPS.indexOf(selectedOrder.status);
                  const completed = currentIndex >= index;
                  return (
                    <div key={status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: completed ? "#7A0019" : "#e2e8f0", marginBottom: "0.5rem" }} />
                      <span style={{ fontSize: "0.65rem", color: "#64748b", textAlign: "center", fontWeight: 500 }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Section */}
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Order Items</p>
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0", display: "grid", gap: "1rem" }}>
                {selectedOrder.items.map((item) => (
                  <div key={`${selectedOrder.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.95rem" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>{item.name}</span>
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Qty: {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: "#7A0019" }}>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div style={{ backgroundColor: "#7A0019", borderRadius: "16px", padding: "1.5rem", color: "white", marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <DollarSign size={20} />
                  <span style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount</span>
                </div>
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>PHP {parseFloat(selectedOrder.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            {/* Close Button */}
            <button onClick={() => setSelectedOrder(null)} style={{ width: "100%", padding: "1rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: "1rem", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
