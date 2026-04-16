import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock3, ShoppingBag, X } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

export default function StallDetails() {
  const navigate = useNavigate();
  const { stallId } = useParams();
  const [stall, setStall] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [message, setMessage] = useState("");
  const [orderingId, setOrderingId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "STUDENT") {
      navigate("/login");
      return;
    }

    const loadStall = async () => {
      try {
        const [stallResponse, menuResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/marketplace/stalls/${stallId}`),
          axios.get(`${API_BASE_URL}/marketplace/stalls/${stallId}/menu`),
        ]);
        setStall(stallResponse.data);
        setMenuItems(menuResponse.data);
      } catch (error) {
        setMessage("Failed to load stall details.");
      }
    };

    loadStall();
  }, [navigate, stallId]);

  const handleBuy = (menuItemId) => {
    setSelectedItemId(menuItemId);
    setQuantity(1);
    setPaymentMethod("CASH");
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      setOrderingId(selectedItemId);
      await axios.post(
        `${API_BASE_URL}/orders`,
        { menuItemId: selectedItemId, quantity: parseInt(quantity), specialInstructions: `Payment: ${paymentMethod}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowOrderModal(false);
      setMessage("✅ Order placed successfully!");
      setTimeout(() => navigate("/my-orders"), 1500);
    } catch (error) {
      setMessage(typeof error.response?.data === "string" ? error.response.data : "Failed to place order.");
    } finally {
      setOrderingId(null);
    }
  };

  if (!stall) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>Loading stall...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem 3rem", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "#7A0019", fontWeight: 700, cursor: "pointer" }}>
        <ArrowLeft size={18} />
        Back to stalls
      </button>

      <div style={{ backgroundColor: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 10px 30px rgba(15,23,42,0.08)", marginBottom: "2rem" }}>
        <div style={{ height: "280px", backgroundColor: "#e5e7eb" }}>
          {stall.imageUrl ? <img src={stall.imageUrl} alt={stall.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        </div>
        <div style={{ padding: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "#0f172a" }}>{stall.name}</h1>
          <p style={{ margin: "0 0 0.5rem 0", color: "#7A0019", fontWeight: 700 }}>{stall.category || "Food Stall"}</p>
          <p style={{ margin: 0, color: "#64748b", maxWidth: "760px" }}>{stall.description || "No description available yet."}</p>
        </div>
      </div>

      {message && <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>{message}</div>}

      <h2 style={{ margin: "0 0 1rem 0", color: "#0f172a" }}>Available Menu</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {menuItems.map((item) => (
          <div key={item.id} style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
            <div style={{ height: "180px", backgroundColor: "#e5e7eb" }}>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
            <div style={{ padding: "1.25rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a" }}>{item.name}</h3>
              <p style={{ margin: "0 0 0.75rem 0", color: "#64748b", minHeight: "42px" }}>{item.description || "Freshly prepared campus meal."}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#334155", fontSize: "0.95rem" }}>
                <strong>PHP {parseFloat(item.price).toFixed(2)}</strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><Clock3 size={16} />{item.cookingTimeMinutes || 0} min</span>
              </div>
              <button
                disabled={orderingId === item.id || !stall.open}
                onClick={() => handleBuy(item.id)}
                style={{ width: "100%", padding: "0.8rem", border: "none", borderRadius: "12px", backgroundColor: stall.open ? "#7A0019" : "#94a3b8", color: "white", fontWeight: 700, cursor: stall.open ? "pointer" : "not-allowed" }}
              >
                {orderingId === item.id ? "Placing order..." : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <ShoppingBag size={18} />
                    Buy Now
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>Confirm Order</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Quantity Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600 }}>
                Quantity (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(Math.max(e.target.value, 1), 10))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Payment Method Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.75rem", color: "#0f172a", fontWeight: 600 }}>
                Payment Method
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: "0.75rem", cursor: "pointer" }}
                  />
                  <span style={{ color: "#334155" }}>Cash Payment</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: "0.75rem", cursor: "pointer" }}
                  />
                  <span style={{ color: "#334155" }}>Online Payment</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#485563",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#7A0019",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
