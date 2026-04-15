import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2, Edit2, Upload } from "lucide-react";
import { uploadImageToSupabase } from "../lib/storage";

const API_BASE_URL = "http://localhost:8080/api";

export default function MenuDashboard() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [ownerOrders, setOwnerOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [category, setCategory] = useState("Meals");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [stall, setStall] = useState(null);
  const [loadingStall, setLoadingStall] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!userRole || userRole !== "OWNER") {
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    const bootstrap = async () => {
      try {
        const stallResponse = await axios.get(`${API_BASE_URL}/stall/my-stall`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If no stall exists, redirect to create stall
        if (!stallResponse.data || (typeof stallResponse.data === 'string' && stallResponse.data.includes('null'))) {
          navigate("/create-stall");
          return;
        }

        setStall(stallResponse.data);
        
        // Load menu and orders with error handling
        try {
          await fetchMenu(token);
        } catch (menuError) {
          console.warn("Failed to load menu:", menuError);
          setMenuItems([]);
        }
        
        try {
          await fetchOrders(token);
        } catch (ordersError) {
          console.warn("Failed to load orders:", ordersError);
          setOwnerOrders([]);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 
                        (typeof error.response?.data === 'string' ? error.response?.data : null) ||
                        error.message || 
                        "Unknown error";
        console.error("Dashboard error:", errorMsg);
        setMessage("Failed to load owner dashboard: " + errorMsg);
      } finally {
        setLoadingStall(false);
      }
    };

    bootstrap();
    const intervalId = setInterval(() => fetchOrders(localStorage.getItem("token")), 5000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchMenu = async (token = localStorage.getItem("token")) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data || []);
    } catch (error) {
      console.error("Menu fetch error:", error);
      throw error;
    }
  };

  const fetchOrders = async (token = localStorage.getItem("token")) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwnerOrders(response.data || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
      throw error;
    }
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setImagePreview(url || null);
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl("");
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name || !price || !cookingTime) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let finalImageUrl = imageUrl || "";

      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToSupabase(imageFile, "food image");
          console.log("✅ Image URL set to:", finalImageUrl);
        } catch (imgError) {
          console.error("Image upload error:", imgError);
          setMessage("⚠️ Image upload failed: " + imgError.message + "\nContinuing without image...");
          // Continue without image, don't fail the whole request
        }
      }

      const payload = {
        name,
        price: parseFloat(price),
        cookingTimeMinutes: parseInt(cookingTime, 10),
        category,
        description: description || "",
        imageUrl: finalImageUrl,
        isAvailable: true,
      };

      if (editing) {
        await axios.put(`${API_BASE_URL}/menu/${editing}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✅ Menu item updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/menu/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✅ Menu item added successfully.");
      }

      resetForm();
      await fetchMenu(token);
    } catch (error) {
      console.error("Add item error:", error.response?.data || error.message);
      const errorMsg = 
        (typeof error.response?.data === "string" && error.response.data) ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to save item.";
      setMessage("❌ " + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Menu item deleted successfully.");
      await fetchMenu(token);
    } catch {
      setMessage("Failed to delete item.");
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setPrice(item.price);
    setCookingTime(item.cookingTimeMinutes);
    setCategory(item.category || "Meals");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setImagePreview(item.imageUrl || null);
    setImageFile(null);
    setEditing(item.id);
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders(token);
    } catch (error) {
      setMessage(typeof error.response?.data === "string" ? error.response.data : "Failed to update order.");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCookingTime("");
    setDescription("");
    setCategory("Meals");
    setImageUrl("");
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
  };

  if (loadingStall) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>Loading owner dashboard...</div>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1280px", margin: "0 auto", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <header style={{ backgroundColor: "#7A0019", padding: "1.5rem", color: "white", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.8rem" }}>Stall Owner Dashboard</h2>
        <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>{stall ? `Managing ${stall.name}` : "Manage menu items and incoming orders"}</p>
      </header>

      {message && (
        <div style={{ marginBottom: "1rem", padding: "0.9rem 1rem", borderRadius: "10px", backgroundColor: message.toLowerCase().includes("success") ? "#d1fae5" : "#fee2e2", color: message.toLowerCase().includes("success") ? "#065f46" : "#991b1b" }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        <section style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>{editing ? "Edit Food Item" : "Add New Food Item"}</h3>
          <form onSubmit={handleAddItem}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Food Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price (PHP) *</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cooking Time *</label>
                <input type="number" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                  <option value="Meals">Meals</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Food Image</label>
              {imagePreview && <img src={imagePreview} alt="Food preview" style={{ width: "100%", maxWidth: "320px", height: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "0.75rem" }} />}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1.2rem", border: "2px dashed #d1d5db", borderRadius: "8px", cursor: "pointer", backgroundColor: "#f8fafc", marginBottom: "0.75rem" }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                <div style={{ textAlign: "center", color: "#4b5563" }}><Upload size={20} style={{ marginBottom: "0.4rem" }} /><div>Upload menu image</div></div>
              </label>
              <input type="url" placeholder="Or paste an image URL" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" style={primaryButton}>{editing ? "Update Item" : "Add Item"}</button>
              {editing && <button type="button" onClick={resetForm} style={secondaryButton}>Cancel</button>}
            </div>
          </form>
        </section>

        <section style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>Incoming Orders</h3>
          {ownerOrders.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No student orders yet.</p>
          ) : ownerOrders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div style={{ color: "#64748b", fontSize: "0.9rem" }}>{formatStatus(order.status)}</div>
                </div>
                <strong>PHP {parseFloat(order.totalPrice).toFixed(2)}</strong>
              </div>
              {order.items.map((item) => (
                <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginBottom: "0.35rem" }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
                {order.status === "PENDING" && <button onClick={() => handleStatusUpdate(order.id, "PREPARING")} style={primaryButton}>Accept Order</button>}
                {order.status === "PREPARING" && <button onClick={() => handleStatusUpdate(order.id, "READY")} style={primaryButton}>Mark Ready</button>}
                {order.status === "READY" && <button onClick={() => handleStatusUpdate(order.id, "COMPLETED")} style={primaryButton}>Complete Order</button>}
              </div>
            </div>
          ))}
        </section>
      </div>

      <section style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Current Menu ({menuItems.length} items)</h3>
        {menuItems.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No menu items yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Cooking Time</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }} />}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>{item.category}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>PHP {parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{item.cookingTimeMinutes} min</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button onClick={() => handleEdit(item)} style={smallBlueButton}><Edit2 size={16} /> Edit</button>
                        <button onClick={() => handleDelete(item.id)} style={smallRedButton}><Trash2 size={16} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const labelStyle = { display: "block", marginBottom: "0.5rem", fontWeight: "500" };
const inputStyle = { width: "100%", padding: "0.7rem", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" };
const primaryButton = { padding: "0.7rem 1.2rem", backgroundColor: "#7A0019", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const secondaryButton = { padding: "0.7rem 1.2rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const smallBlueButton = { padding: "0.45rem 0.8rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" };
const smallRedButton = { padding: "0.45rem 0.8rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" };
const thStyle = { padding: "0.75rem", textAlign: "left" };
const tdStyle = { padding: "0.75rem" };
