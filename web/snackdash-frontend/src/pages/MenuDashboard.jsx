import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Trash2, Edit2, Upload, Power } from "lucide-react";
import { uploadImageToSupabase } from "../lib/storage";

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
  const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'menu', 'add-item', 'order-history'
  const [completedOrders, setCompletedOrders] = useState([]);

  const normalizeStall = (stallData) => {
    if (!stallData) return stallData;
    return {
      ...stallData,
      isOpen: stallData.isOpen ?? stallData.open ?? false,
      open: stallData.open ?? stallData.isOpen ?? false,
    };
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!userRole || userRole !== "OWNER") {
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    const bootstrap = async () => {
      try {
        setLoadingStall(true);
        const stallResponse = await api.get('/stall/my-stall');
        let stallData = stallResponse.data?.data ?? stallResponse.data;

        // If no stall exists, redirect to create stall
        if (!stallData || (typeof stallData === 'string' && stallData.includes('null'))) {
          navigate("/create-stall");
          return;
        }

        stallData = normalizeStall(stallData);
        setStall(stallData);
        
        // Load menu and orders with error handling
        try {
          await fetchMenu();
        } catch (menuError) {
          console.warn("Failed to load menu:", menuError);
          setMenuItems([]);
        }
        
        try {
          await fetchOrders();
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
    
    // Set up intervals for refreshing
    const ordersIntervalId = setInterval(() => {
      fetchOrders().catch(err => console.warn("Periodic fetch orders failed:", err));
    }, 3000);
    
    const stallRefreshId = setInterval(async () => {
      try {
        const stallResponse = await api.get('/stall/my-stall');
        const stallData = stallResponse.data?.data ?? stallResponse.data;
        if (stallData) {
          setStall(normalizeStall(stallData));
        }
      } catch (error) {
        console.warn("Failed to refresh stall status:", error);
      }
    }, 3000);
    
    return () => {
      clearInterval(ordersIntervalId);
      clearInterval(stallRefreshId);
    };
  }, [navigate]);

  const fetchMenu = async () => {
    try {
      const response = await api.get('/menu/all');
      const data = response.data?.data ?? response.data;
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Menu fetch error:", error);
      throw error;
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/owner');
      const data = response.data?.data ?? response.data;
      setOwnerOrders(Array.isArray(data) ? data : []);
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
        await api.put(`/menu/${editing}`, payload);
        setMessage("✅ Menu item updated successfully.");
      } else {
        await api.post('/menu/add', payload);
        setMessage("✅ Menu item added successfully.");
      }

      resetForm();
      await fetchMenu();
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
      await api.delete(`/menu/${id}`);
      setMessage("Menu item deleted successfully.");
      await fetchMenu();
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
      const response = await api.put(`/orders/${orderId}/status`, { status });
      const messageText = response.data?.message || response.data || "Order updated.";
      setMessage("✅ " + messageText);
      await fetchOrders();
      // Redirect to orders list tab after accepting
      if (status === "PREPARING") {
        setActiveTab("orders");
      }
    } catch (error) {
      const backendMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Failed to update order.";
      setMessage("❌ " + backendMessage);
    }
  };

  const handleToggleStallStatus = async () => {
    try {
      const response = await api.put('/stall/toggle-status');
      const stallData = normalizeStall(response.data?.data ?? response.data);
      if (stallData) {
        setStall(stallData);
        setMessage(`✅ Stall is now ${stallData.isOpen ? "OPEN" : "CLOSED"}`);
      } else {
        setMessage(`✅ Stall status toggled successfully.`);
      }
    } catch (error) {
      console.error("Toggle stall status error:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Failed to update stall status.";
      setMessage("❌ " + errorMsg);
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
    return <div style={loadingStyle}>Loading owner dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "280px", backgroundColor: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0, padding: "2rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#7A0019", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "2rem", fontWeight: 700, overflow: "hidden", position: "relative" }}>
            {stall?.imageUrl ? (
              <img src={stall.imageUrl} alt={stall?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              stall?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.1rem" }}>{stall?.name}</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>{stall?.category || "Campus Stall"}</p>
          <button onClick={handleToggleStallStatus} style={{ marginTop: "1rem", padding: "0.6rem 1rem", backgroundColor: (stall?.isOpen ?? stall?.open) ? "#ef4444" : "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%" }}>
            <Power size={16} />
            {(stall?.isOpen ?? stall?.open) ? "Close Stall" : "Open Stall"}
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <button onClick={() => setActiveTab("orders")} style={tabNavButton(activeTab === "orders")}>Incoming Orders</button>
          <button onClick={() => setActiveTab("menu")} style={tabNavButton(activeTab === "menu")}>Current Menu</button>
          <button onClick={() => setActiveTab("add-item")} style={tabNavButton(activeTab === "add-item")}>Add Item</button>
          <button onClick={() => setActiveTab("order-history")} style={tabNavButton(activeTab === "order-history")}>Order History</button>
        </nav>

        <div style={{ paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ ...tabNavButton(false), color: "#ef4444", width: "100%" }}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem 3rem", overflowY: "auto" }}>
        {message && <div style={{ marginBottom: "1rem", padding: "1rem 1.1rem", borderRadius: "18px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}>{message}</div>}

        {/* Incoming Orders Tab */}
        {activeTab === "orders" && (
          <section>
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Management</p>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.8rem" }}>Incoming Orders</h2>
            </div>
            {ownerOrders.length === 0 ? (
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", color: "#64748b", textAlign: "center" }}>No student orders yet.</div>
            ) : ownerOrders.map((order) => (
              <div key={order.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a" }}>{order.orderNumber}</h3>
                    <p style={{ margin: 0, color: "#64748b" }}>{formatStatus(order.status)}</p>
                  </div>
                  <strong style={{ color: "#7A0019" }}>PHP {parseFloat(order.totalPrice).toFixed(2)}</strong>
                </div>
                <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#334155" }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {order.status === "PENDING" && <button onClick={() => handleStatusUpdate(order.id, "PREPARING")} style={actionTabButton()}>Accept Order</button>}
                  {order.status === "PREPARING" && <button onClick={() => handleStatusUpdate(order.id, "READY")} style={actionTabButton()}>Mark Ready</button>}
                  {order.status === "READY" && <button onClick={() => handleStatusUpdate(order.id, "COMPLETED")} style={actionTabButton()}>Complete</button>}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Current Menu Tab */}
        {activeTab === "menu" && (
          <section>
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Management</p>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.8rem" }}>Current Menu ({menuItems.length} items)</h2>
            </div>
            {menuItems.length === 0 ? (
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", color: "#64748b", textAlign: "center" }}>No menu items yet. Add your first item to get started.</div>
            ) : (
              <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeadRow}>
                      <th style={thStyle}>Item</th>
                      <th style={thStyle}>Category</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Time</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id} style={tableRow}>
                        <td style={tdStyle}>
                          <div style={itemCell}>
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={itemImage} />}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>{item.category}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>PHP {parseFloat(item.price).toFixed(2)}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{item.cookingTimeMinutes} min</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <div style={actionRow}>
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
        )}

        {/* Add Item Tab */}
        {activeTab === "add-item" && (
          <section>
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>{editing ? "Editing" : "New"}</p>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.8rem" }}>{editing ? "Update Menu Item" : "Add New Menu Item"}</h2>
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 12px rgba(15,23,42,0.06)", maxWidth: "600px" }}>
              <form onSubmit={handleAddItem}>
                <div style={formGrid}>
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
                  {imagePreview && <img src={imagePreview} alt="Food preview" style={{ width: "100%", maxWidth: "320px", height: "180px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "0.75rem" }} />}
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1.2rem", border: "2px dashed #d1d5db", borderRadius: "12px", cursor: "pointer", backgroundColor: "#f8fafc", marginBottom: "0.75rem" }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    <div style={{ textAlign: "center", color: "#475569" }}><Upload size={20} style={{ marginBottom: "0.4rem" }} /><div>Upload menu image</div></div>
                  </label>
                  <input type="url" placeholder="Or paste an image URL" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button type="submit" style={primaryButton}>{editing ? "Update Item" : "Add Item"}</button>
                  {editing && <button type="button" onClick={resetForm} style={secondaryButton}>Cancel</button>}
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Order History Tab */}
        {activeTab === "order-history" && (
          <section>
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Records</p>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.8rem" }}>Order History</h2>
            </div>
            {ownerOrders.filter(o => o.status === "COMPLETED").length === 0 ? (
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", color: "#64748b", textAlign: "center" }}>No completed orders yet.</div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {ownerOrders.filter(o => o.status === "COMPLETED").map((order) => (
                  <div key={order.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a" }}>{order.orderNumber}</h3>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Completed</p>
                      </div>
                      <strong style={{ color: "#7A0019" }}>PHP {parseFloat(order.totalPrice).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#334155", fontSize: "0.95rem" }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span>PHP {parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function tabNavButton(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: active ? "#7A0019" : "#64748b",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    border: "none",
    background: active ? "#fff0f2" : "transparent",
    width: "100%",
    textAlign: "left",
    fontSize: "0.95rem",
    boxShadow: active ? "inset 4px 0 0 #7A0019" : "none",
    transition: "all 0.2s ease"
  };
}

function actionTabButton() {
  return {
    padding: "0.7rem 1.2rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#7A0019",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem"
  };
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
const thStyle = { padding: "0.95rem 0.95rem", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: "0.95rem" };
const tdStyle = { padding: "0.95rem 0.95rem", borderBottom: "1px solid #e5e7eb", color: "#475569", fontSize: "0.95rem" };

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: "Inter, system-ui, sans-serif",
  paddingBottom: "3rem"
};

const heroWrapper = {
  background: "linear-gradient(180deg, #7A0019 0%, #5e0017 100%)",
  padding: "2rem 1rem 3rem",
  display: "flex",
  justifyContent: "center"
};

const heroCard = {
  width: "min(1200px, 100%)",
  background: "#ffffff",
  borderRadius: "28px",
  padding: "2rem",
  boxShadow: "0 32px 80px rgba(15, 23, 42, 0.12)",
  display: "flex",
  justifyContent: "space-between",
  gap: "2rem",
  alignItems: "flex-start"
};

const heroLabel = {
  margin: 0,
  color: "#7A0019",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  fontSize: "0.78rem",
  fontWeight: 700
};

const heroTitle = {
  margin: "0.8rem 0 1rem",
  fontSize: "clamp(2rem, 3vw, 2.6rem)",
  lineHeight: 1.05,
  color: "#0f172a"
};

const heroDescription = {
  margin: 0,
  maxWidth: "42rem",
  color: "#475569",
  lineHeight: 1.7,
  fontSize: "1rem"
};

const heroMetrics = {
  display: "grid",
  gap: "1rem",
  width: "min(320px, 100%)"
};

const metricCard = {
  padding: "1rem 1.2rem",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: "0.35rem"
};

const metricLabel = {
  margin: 0,
  fontSize: "0.78rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.12em"
};

const metricValue = {
  margin: 0,
  fontSize: "1.55rem",
  fontWeight: 700,
  color: "#0f172a"
};

const statusPillLight = {
  alignSelf: "center",
  padding: "0.6rem 1rem",
  borderRadius: "999px",
  backgroundColor: "#eef2ff",
  color: "#4338ca",
  fontSize: "0.88rem",
  fontWeight: 700
};

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  fontSize: "1rem"
};

const mainStyle = {
  width: "min(1200px, calc(100% - 2rem))",
  margin: "0 auto",
  transform: "translateY(-3rem)",
  position: "relative",
  zIndex: 1
};

const stallPreviewSection = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.8fr",
  gap: "1.5rem",
  marginBottom: "1.5rem"
};

const stallPreviewCard = {
  position: "relative",
  borderRadius: "24px",
  overflow: "hidden",
  minHeight: "280px",
  backgroundColor: "#f8fafc",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)"
};

const stallImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const stallImagePlaceholder = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  padding: "2rem",
  color: "#6b7280"
};

const stallOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.52))"
};

const stallLabel = {
  position: "absolute",
  bottom: "1.5rem",
  left: "1.5rem",
  right: "1.5rem",
  color: "white",
  zIndex: 2,
  display: "grid",
  gap: "0.5rem"
};

const smallBadge = {
  display: "inline-flex",
  padding: "0.45rem 0.85rem",
  borderRadius: "999px",
  backgroundColor: "rgba(255,255,255,0.16)",
  color: "rgba(255,255,255,0.92)",
  fontSize: "0.78rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase"
};

const stallName = {
  margin: 0,
  fontSize: "1.95rem",
  lineHeight: 1.05
};

const stallDescription = {
  margin: 0,
  color: "rgba(255,255,255,0.9)",
  lineHeight: 1.6
};

const stallInfoSection = {
  display: "grid",
  gap: "1rem"
};

const infoCard = {
  backgroundColor: "#ffffff",
  padding: "1.25rem",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)"
};

const infoTitle = {
  margin: 0,
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "#64748b"
};

const infoText = {
  margin: "0.75rem 0 0",
  color: "#334155",
  lineHeight: 1.75
};

const infoStatus = {
  margin: "0.75rem 0 0",
  fontSize: "1rem",
  fontWeight: 700
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "1.5rem"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  padding: "1.75rem",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e2e8f0"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  alignItems: "flex-start",
  marginBottom: "1rem"
};

const sectionLabel = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: "0.16em"
};

const sectionTitle = {
  margin: "0.5rem 0 0",
  fontSize: "1.35rem",
  color: "#0f172a"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
  marginBottom: "1rem"
};

const messageStyle = {
  marginBottom: "1rem",
  padding: "1rem 1.1rem",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#0f172a"
};

const emptyText = {
  color: "#64748b",
  lineHeight: 1.7
};

const orderCard = {
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "1rem",
  marginBottom: "1rem",
  backgroundColor: "#ffffff"
};

const orderTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  marginBottom: "0.85rem"
};

const orderTitle = {
  display: "block",
  fontSize: "1rem",
  fontWeight: 700,
  color: "#0f172a"
};

const orderStatus = {
  color: "#64748b",
  fontSize: "0.9rem",
  marginTop: "0.35rem"
};

const orderTotal = {
  color: "#0f172a"
};

const orderItems = {
  display: "grid",
  gap: "0.5rem"
};

const orderItemRow = {
  display: "flex",
  justifyContent: "space-between",
  color: "#475569",
  fontSize: "0.95rem"
};

const orderButtons = {
  display: "flex",
  justifyContent: "flex-start",
  gap: "0.65rem",
  flexWrap: "wrap",
  marginTop: "1rem"
};

const actionButton = {
  padding: "0.65rem 1rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#7A0019",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const tableHeadRow = {
  backgroundColor: "#f8fafc"
};

const tableRow = {
  borderBottom: "1px solid #e5e7eb"
};

const itemCell = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
};

const itemImage = {
  width: "44px",
  height: "44px",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid #e5e7eb"
};

const actionRow = {
  display: "flex",
  justifyContent: "center",
  gap: "0.5rem",
  flexWrap: "wrap"
};
