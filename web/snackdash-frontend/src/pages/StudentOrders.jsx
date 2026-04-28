import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ShoppingBag, X, DollarSign, Home, Receipt, User } from "lucide-react";
import './StudentDashboard.css'; 

const STATUS_STEPS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function StudentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Syncing user data from localStorage
  const user = {
    name: localStorage.getItem('userName') || 'Mekaela G. Relacion',
    course: localStorage.getItem('userCourse') || 'BS Information Technology',
    year: localStorage.getItem('userYear') || '3rd Year',
    profileImage: localStorage.getItem('userProfileImage') || 'https://via.placeholder.com/150',
  };

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
    <div className="student-dashboard-page">
      {/* ================= HERO SECTION (RED & WHITE) ================= */}
      <div className="student-dashboard-hero" style={{ background: "linear-gradient(135deg, #7A0019 0%, #a8002b 100%)" }}>
        <div className="student-dashboard-hero-inner">
          <div className="student-dashboard-hero-copy">
            <p className="hero-label" style={{ color: "rgba(255,255,255,0.8)" }}>Order Tracking</p>
            <h1 style={{ color: "white" }}>My Orders</h1>
            <p className="hero-description" style={{ color: "rgba(255,255,255,0.9)" }}>
              Track your food orders in real-time and view your campus order history.
            </p>
          </div>
        </div>
      </div>

      <main className="student-dashboard-main">
        <div className="student-dashboard-layout">
          
          {/* ================= SIDEBAR ================= */}
          <aside className="student-dashboard-sidebar">
            <div className="sidebar-card sidebar-brand">
              <p className="subtitle-muted" style={{ color: "#7A0019", fontWeight: "bold" }}>SnackDash</p>
              <h2>CTI - University</h2>
            </div>

            <div className="sidebar-card profile-card">
              <div className="card-title">
                <div>
                  <p className="subtitle-muted">Your profile</p>
                  <h2>Student Info</h2>
                </div>
                
                <div 
                  className="avatar-circle profile-avatar cursor-pointer hover:opacity-80 transition" 
                  onClick={() => navigate('/student/edit-profile')}
                  style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}
                >
                  <img 
                    src={user.profileImage} 
                    alt="Sidebar Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </div>

              <div className="profile-stat">
                <p>Name</p>
                <strong>{user.name}</strong>
              </div>
              <div className="profile-stat">
                <p>Course</p>
                <strong>{user.course}</strong>
              </div>
              <div className="profile-stat">
                <p>Year level</p>
                <strong>{user.year}</strong>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button 
                className="nav-link" 
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
              >
                <Home size={18} /> Home
              </button>
              
              {/* Active styling in your CSS might need to be adjusted to red if it defaults to teal, 
                  but inline we ensure the text focus remains sharp */}
              <button 
                className="nav-link active" 
                onClick={(e) => { e.preventDefault(); navigate('/my-orders'); }}
                style={{ borderLeft: "4px solid #7A0019", color: "#7A0019", backgroundColor: "#fff1f2" }}
              >
                <Receipt size={18} /> Orders
              </button>
              
              <button 
                className="nav-link" 
                onClick={(e) => { e.preventDefault(); navigate('/student/edit-profile'); }}
              >
                <User size={18} /> Profile
              </button>
            </nav>
          </aside>

          {/* ================= ORDER LIST CONTENT ================= */}
          <section className="student-dashboard-content">
            <div className="card" style={{ backgroundColor: "white" }}>
              <div className="card-title" style={{ marginBottom: '2rem' }}>
                <div>
                  <p className="subtitle-muted">Real-time status</p>
                  <h2>Order History & Tracking</h2>
                </div>
                {/* Red Icon Badge */}
                <div className="avatar-circle profile-avatar" style={{ background: '#fff1f2', color: '#7A0019' }}>
                  <Receipt size={20} />
                </div>
              </div>

              {message && (
                <div style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                  {message}
                </div>
              )}

              <div style={{ display: "grid", gap: "1.5rem" }}>
                {orders.length === 0 ? (
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "4rem 2rem", color: "#64748b", textAlign: "center", border: "2px dashed #e2e8f0" }}>
                    <ShoppingBag size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: "600" }}>You have no orders yet.</p>
                    <button 
                      onClick={() => navigate("/dashboard")} 
                      style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#7A0019", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, boxShadow: "0 4px 6px rgba(122, 0, 25, 0.2)" }}
                    >
                      Browse Stalls
                    </button>
                  </div>
                ) : orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)} 
                    style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s ease" }} 
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#7A0019"} 
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                      <div>
                        <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a", fontSize: "1.2rem", fontWeight: "bold" }}>{order.stallName}</h3>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Order: {order.orderNumber}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {/* Red Status Badge */}
                        <div style={{ display: "inline-block", backgroundColor: "#7A0019", color: "white", padding: "0.4rem 0.8rem", borderRadius: "6px", fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {formatStatus(order.status)}
                        </div>
                        <p style={{ margin: 0, color: "#0f172a", fontWeight: 800, fontSize: "1.2rem" }}>₱{parseFloat(order.totalPrice).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress Bar (Red & Gray) */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      {STATUS_STEPS.map((status, index) => {
                        const currentIndex = STATUS_STEPS.indexOf(order.status);
                        const completed = currentIndex >= index;
                        return (
                          <div key={status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: "100%", height: "4px", borderRadius: "4px", backgroundColor: completed ? "#7A0019" : "#cbd5e1", marginBottom: "0.5rem" }} />
                            <span style={{ fontSize: "0.65rem", color: completed ? "#0f172a" : "#64748b", textAlign: "center", fontWeight: completed ? "700" : "500" }}>{status}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ backgroundColor: "#fafafa", borderRadius: "8px", padding: "1rem", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "grid", gap: "0.75rem" }}>
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#334155", fontSize: "0.95rem" }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                            </div>
                            <span style={{ fontWeight: 600 }}>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ================= ORDER RECEIPT MODAL (RED & WHITE) ================= */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={() => setSelectedOrder(null)}>
          <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "2.5rem", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "bold" }}>Order Details</p>
                <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#0f172a", fontWeight: "900" }}>{selectedOrder.stallName}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "#fff1f2", border: "none", cursor: "pointer", color: "#7A0019", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ffe4e6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff1f2"}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Order #</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{selectedOrder.orderNumber}</p>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Status</p>
                <div style={{ display: "inline-block", color: "#7A0019", fontWeight: 800, fontSize: "1.1rem" }}>{formatStatus(selectedOrder.status)}</div>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "#0f172a", fontWeight: 700 }}>Order Items</p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {selectedOrder.items.map((item) => (
                  <div key={`${selectedOrder.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.95rem" }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>{item.name}</span>
                      <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>Qty: {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount Red Block */}
            <div style={{ backgroundColor: "#7A0019", borderRadius: "16px", padding: "1.5rem", color: "white", marginBottom: "2rem", boxShadow: "0 10px 25px rgba(122, 0, 25, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DollarSign size={20} />
                  <span style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "bold" }}>Total Amount</span>
                </div>
                <span style={{ fontSize: "1.8rem", fontWeight: 900 }}>₱{parseFloat(selectedOrder.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: "100%", padding: "1rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: "1rem", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}>
              Close Receipt
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