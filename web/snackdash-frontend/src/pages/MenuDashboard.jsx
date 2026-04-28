import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Trash2, Edit2, Upload, Power, Store, UtensilsCrossed, ListOrdered, Plus, Receipt, User, Clock, CheckCircle } from "lucide-react";
import { uploadImageToSupabase } from "../lib/storage";
import './StudentDashboard.css'; 

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
  const [activeTab, setActiveTab] = useState("orders"); 

  const ownerName = localStorage.getItem('userName') || 'Stall Owner';

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
    if (!userRole || userRole !== "OWNER") {
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    const bootstrap = async () => {
      try {
        setLoadingStall(true);
        const stallResponse = await api.get('/stall/my-stall');
        let stallData = stallResponse.data?.data ?? stallResponse.data;

        if (!stallData || (typeof stallData === 'string' && stallData.includes('null'))) {
          navigate("/create-stall");
          return;
        }

        stallData = normalizeStall(stallData);
        setStall(stallData);
        
        try { await fetchMenu(); } catch (e) { setMenuItems([]); }
        try { await fetchOrders(); } catch (e) { setOwnerOrders([]); }
      } catch (error) {
        setMessage("Failed to load owner dashboard.");
      } finally {
        setLoadingStall(false);
      }
    };

    bootstrap();
    
    const ordersIntervalId = setInterval(() => {
      fetchOrders().catch(err => console.warn("Periodic fetch orders failed:", err));
    }, 3000);
    
    const stallRefreshId = setInterval(async () => {
      try {
        const stallResponse = await api.get('/stall/my-stall');
        const stallData = stallResponse.data?.data ?? stallResponse.data;
        if (stallData) setStall(normalizeStall(stallData));
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
    const response = await api.get('/menu/all');
    const data = response.data?.data ?? response.data;
    setMenuItems(Array.isArray(data) ? data : []);
  };

  const fetchOrders = async () => {
    const response = await api.get('/orders/owner');
    const data = response.data?.data ?? response.data;
    setOwnerOrders(Array.isArray(data) ? data : []);
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url); setImagePreview(url || null); setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file); setImageUrl(""); setImagePreview(URL.createObjectURL(file));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name || !price || !cookingTime) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      let finalImageUrl = imageUrl || "";
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToSupabase(imageFile, "food image");
        } catch (imgError) {
          setMessage("⚠️ Image upload failed. Continuing without image...");
        }
      }

      const payload = {
        name, price: parseFloat(price), cookingTimeMinutes: parseInt(cookingTime, 10),
        category, description: description || "", imageUrl: finalImageUrl, isAvailable: true,
      };

      if (editing) {
        await api.put(`/menu/${editing}`, payload);
        setMessage("✅ Menu item updated successfully.");
      } else {
        await api.post('/menu/add', payload);
        setMessage("✅ Menu item added successfully.");
      }

      resetForm(); setActiveTab("menu"); await fetchMenu();
    } catch (error) {
      setMessage("❌ Failed to save item.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      setMessage("✅ Menu item deleted successfully.");
      await fetchMenu();
    } catch { setMessage("❌ Failed to delete item."); }
  };

  const handleEdit = (item) => {
    setName(item.name); setPrice(item.price); setCookingTime(item.cookingTimeMinutes);
    setCategory(item.category || "Meals"); setDescription(item.description || "");
    setImageUrl(item.imageUrl || ""); setImagePreview(item.imageUrl || null);
    setImageFile(null); setEditing(item.id); setActiveTab("add-item"); 
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setMessage(`✅ Order marked as ${status}.`);
      await fetchOrders();
    } catch (error) { setMessage("❌ Failed to update order."); }
  };

  const handleToggleStallStatus = async () => {
    try {
      const response = await api.put('/stall/toggle-status');
      const stallData = normalizeStall(response.data?.data ?? response.data);
      if (stallData) {
        setStall(stallData);
        setMessage(`✅ Stall is now ${stallData.isOpen ? "OPEN" : "CLOSED"}`);
      }
    } catch (error) { setMessage("❌ Failed to update stall status."); }
  };

  const resetForm = () => {
    setName(""); setPrice(""); setCookingTime(""); setDescription("");
    setCategory("Meals"); setImageUrl(""); setImageFile(null);
    setImagePreview(null); setEditing(null);
  };

  if (loadingStall) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>Loading dashboard...</div>;
  }

  const getNavStyle = (tabName) => ({
    ...(activeTab === tabName && { borderLeft: "4px solid #7A0019", color: "#7A0019", backgroundColor: "#fff1f2" })
  });

  return (
    <div className="student-dashboard-page">
      <div className="student-dashboard-hero" style={{ background: "linear-gradient(135deg, #7A0019 0%, #a8002b 100%)" }}>
        <div className="student-dashboard-hero-inner">
          <div className="student-dashboard-hero-copy">
            <p className="hero-label" style={{ color: "rgba(255,255,255,0.8)" }}>Stall Management</p>
            <h1 style={{ color: "white" }}>Welcome, {ownerName.split(' ')[0]}</h1>
            <p className="hero-description" style={{ color: "rgba(255,255,255,0.9)" }}>
              Manage your stall's menu, track live orders, and update your store settings.
            </p>
          </div>
        </div>
      </div>

      <main className="student-dashboard-main">
        <div className="student-dashboard-layout">
          
          {/* ================= SIDEBAR ================= */}
          <aside className="student-dashboard-sidebar">
            <div className="sidebar-card sidebar-brand">
              <p className="subtitle-muted" style={{ color: "#7A0019", fontWeight: "bold" }}>SnackDash Partner</p>
              <h2>CTI - University</h2>
            </div>

            <div className="sidebar-card profile-card">
              <div className="card-title">
                <div>
                  <p className="subtitle-muted">Your Stall</p>
                  <h2>{stall?.name || "My Stall"}</h2>
                </div>
                <div className="avatar-circle profile-avatar" style={{ padding: 0, overflow: 'hidden', background: 'transparent', border: '2px solid #e2e8f0' }}>
                  {stall?.imageUrl ? (
                    <img src={stall.imageUrl} alt="Stall Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Store size={20} color="#7A0019" />
                  )}
                </div>
              </div>

              <div className="profile-stat">
                <p>Owner</p>
                <strong>{ownerName}</strong>
              </div>
              <div className="profile-stat">
                <p>Status</p>
                <strong style={{ color: (stall?.isOpen ?? stall?.open) ? "#22c55e" : "#ef4444" }}>
                  {(stall?.isOpen ?? stall?.open) ? "OPEN" : "CLOSED"}
                </strong>
              </div>
              
              <button 
                onClick={handleToggleStallStatus} 
                style={{ marginTop: "1rem", padding: "0.6rem 1rem", backgroundColor: (stall?.isOpen ?? stall?.open) ? "#ef4444" : "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", transition: "all 0.2s" }}
              >
                <Power size={16} />
                {(stall?.isOpen ?? stall?.open) ? "Close Stall" : "Open Stall"}
              </button>
            </div>

            <nav className="sidebar-nav">
              <button className="nav-link" onClick={() => setActiveTab("orders")} style={getNavStyle("orders")}>
                <ListOrdered size={18} /> Live Orders
              </button>
              <button className="nav-link" onClick={() => setActiveTab("menu")} style={getNavStyle("menu")}>
                <UtensilsCrossed size={18} /> Menu Items
              </button>
              <button className="nav-link" onClick={() => { resetForm(); setActiveTab("add-item"); }} style={getNavStyle("add-item")}>
                <Plus size={18} /> Add Item
              </button>
              <button className="nav-link" onClick={() => setActiveTab("order-history")} style={getNavStyle("order-history")}>
                <Receipt size={18} /> Order History
              </button>
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                <button className="nav-link" onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ color: "#ef4444" }}>
                  Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <section className="student-dashboard-content">
            
            {message && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem 1.2rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                {message}
              </div>
            )}

            {/* TAB: LIVE ORDERS */}
            {activeTab === "orders" && (
              <div className="card" style={{ backgroundColor: "white", border: "none" }}>
                <div className="card-title" style={{ marginBottom: '2rem' }}>
                  <div>
                    <p className="subtitle-muted">Kitchen Queue</p>
                    <h2>Live Incoming Orders</h2>
                  </div>
                  <div className="avatar-circle profile-avatar" style={{ background: '#fff1f2', color: '#7A0019' }}>
                    <Clock size={20} />
                  </div>
                </div>

                {ownerOrders.filter(o => o.status !== "COMPLETED").length === 0 ? (
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "4rem 2rem", color: "#64748b", textAlign: "center", border: "2px dashed #e2e8f0" }}>
                    <CheckCircle size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: "600" }}>Kitchen is clear.</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Waiting for new student orders.</p>
                  </div>
                ) : ownerOrders.filter(o => o.status !== "COMPLETED").map((order) => (
                  <div key={order.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 8px 16px rgba(15,23,42,0.04)" }}>
                    
                    {/* ================= NEW: STUDENT PROFILE ROW ================= */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                      <img 
                        src={order.studentImage || "https://via.placeholder.com/150"} 
                        alt="Student Profile" 
                        style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} 
                      />
                      <div>
                        <p style={{ margin: "0 0 0.2rem 0", fontWeight: "bold", color: "#0f172a", fontSize: "1.05rem" }}>
                          {order.studentName || "Student Name Pending..."}
                        </p>
                        <span style={{ fontSize: "0.75rem", color: "#7A0019", backgroundColor: "#fff1f2", padding: "3px 10px", borderRadius: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
                          {order.studentCourse || "Course"} • {order.studentYear || "Year"}
                        </span>
                      </div>
                    </div>
                    {/* ================= END STUDENT PROFILE ROW ================= */}

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a", fontWeight: "bold" }}>Order #{order.orderNumber}</h3>
                        <p style={{ margin: 0, color: "#64748b", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Status: <span style={{color: "#7A0019"}}>{order.status}</span></p>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: "1.3rem" }}>₱{parseFloat(order.totalPrice).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#334155", fontWeight: "600" }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {order.status === "PENDING" && <button onClick={() => handleStatusUpdate(order.id, "PREPARING")} style={primaryBtn}>Accept & Prepare</button>}
                      {order.status === "PREPARING" && <button onClick={() => handleStatusUpdate(order.id, "READY")} style={primaryBtn}>Mark as Ready</button>}
                      {order.status === "READY" && <button onClick={() => handleStatusUpdate(order.id, "COMPLETED")} style={{...primaryBtn, backgroundColor: "#10b981", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)"}}>Hand to Student (Complete)</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: MENU LIST */}
            {activeTab === "menu" && (
               // ... [Menu Code remains identical to previous message] ...
               <div className="card" style={{ backgroundColor: "white", border: "none" }}>
                <div className="card-title" style={{ marginBottom: '2rem' }}>
                  <div>
                    <p className="subtitle-muted">Catalog</p>
                    <h2>Current Menu Items ({menuItems.length})</h2>
                  </div>
                  <button 
                    onClick={() => { resetForm(); setActiveTab("add-item"); }}
                    style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {menuItems.length === 0 ? (
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "4rem 2rem", color: "#64748b", textAlign: "center", border: "2px dashed #e2e8f0" }}>
                      <UtensilsCrossed size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                      <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: "600" }}>Your menu is empty.</p>
                    </div>
                  ) : menuItems.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {item.imageUrl ? (
                           <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                           <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><UtensilsCrossed size={24} /></div>
                        )}
                        <div>
                          <h4 style={{ margin: "0 0 0.25rem 0", color: "#0f172a", fontSize: "1.1rem", fontWeight: "bold" }}>{item.name}</h4>
                          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>{item.category} • {item.cookingTimeMinutes} mins</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <span style={{ fontWeight: 800, color: "#7A0019", fontSize: "1.1rem" }}>₱{parseFloat(item.price).toFixed(2)}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(item)} style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} style={{ padding: '0.5rem', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '6px', color: '#e11d48', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADD / EDIT ITEM */}
            {activeTab === "add-item" && (
              // ... [Add Item Code remains identical to previous message] ...
              <div className="card" style={{ backgroundColor: "white", border: "none" }}>
                 <div className="card-title" style={{ marginBottom: '2rem' }}>
                  <div>
                    <p className="subtitle-muted">{editing ? "Editing Catalog" : "New Addition"}</p>
                    <h2>{editing ? "Update Menu Item" : "Add Menu Item"}</h2>
                  </div>
                </div>

                <form onSubmit={handleAddItem} style={{ maxWidth: "700px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Food Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A0019'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Price (₱) *</label>
                      <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A0019'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Cooking Time (mins) *</label>
                      <input type="number" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A0019'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A0019'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}>
                        <option value="Meals">Meals</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Desserts">Desserts</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = '#7A0019'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <label style={labelStyle}>Food Image</label>
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: "100%", maxWidth: "320px", height: "180px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1rem" }} />}
                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", border: "2px dashed #cbd5e1", borderRadius: "12px", cursor: "pointer", backgroundColor: "#f8fafc", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#7A0019"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                      <Upload size={24} color="#64748b" style={{ marginBottom: "0.5rem" }} />
                      <span style={{ color: "#475569", fontWeight: "600" }}>Click to upload an image</span>
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button type="submit" style={primaryBtn}>{editing ? "Save Changes" : "Create Item"}</button>
                    {editing && <button type="button" onClick={() => {resetForm(); setActiveTab("menu");}} style={secondaryBtn}>Cancel</button>}
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ORDER HISTORY */}
            {activeTab === "order-history" && (
              <div className="card" style={{ backgroundColor: "white", border: "none" }}>
                <div className="card-title" style={{ marginBottom: '2rem' }}>
                  <div>
                    <p className="subtitle-muted">Records</p>
                    <h2>Order History</h2>
                  </div>
                </div>

                {ownerOrders.filter(o => o.status === "COMPLETED").length === 0 ? (
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "4rem 2rem", color: "#64748b", textAlign: "center", border: "2px dashed #e2e8f0" }}>
                    <Receipt size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: "600" }}>No completed orders yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {ownerOrders.filter(o => o.status === "COMPLETED").map((order) => (
                      <div key={order.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
                        
                        {/* ================= NEW: STUDENT PROFILE ROW (HISTORY) ================= */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                          <img 
                            src={order.studentImage || "https://via.placeholder.com/150"} 
                            alt="Student Profile" 
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} 
                          />
                          <div>
                            <p style={{ margin: "0 0 0.1rem 0", fontWeight: "bold", color: "#0f172a", fontSize: "0.95rem" }}>
                              {order.studentName || "Student Name Pending..."}
                            </p>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600" }}>
                              {order.studentCourse || "Course"} • {order.studentYear || "Year"}
                            </span>
                          </div>
                        </div>
                        {/* ================= END STUDENT PROFILE ROW ================= */}

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                          <div>
                            <h3 style={{ margin: "0 0 0.35rem 0", color: "#0f172a", fontWeight: "bold" }}>Order #{order.orderNumber}</h3>
                            <p style={{ margin: 0, color: "#10b981", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>✓ Completed</p>
                          </div>
                          <strong style={{ color: "#0f172a", fontSize: "1.2rem" }}>₱{parseFloat(order.totalPrice).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: "grid", gap: "0.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.menuItemId}`} style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.95rem" }}>
                              <span>{item.quantity}x {item.name}</span>
                              <span>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </section>
        </div>
      </main>
    </div>
  );
}

// Global UI Button Styles
const primaryBtn = {
  padding: "0.75rem 1.5rem", backgroundColor: "#7A0019", color: "white", border: "none",
  borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 6px rgba(122, 0, 25, 0.2)",
};
const secondaryBtn = {
  padding: "0.75rem 1.5rem", backgroundColor: "#f1f5f9", color: "#475569", border: "none",
  borderRadius: "8px", cursor: "pointer", fontWeight: "bold",
};
const labelStyle = { display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#334155", fontSize: "0.9rem" };
const inputStyle = { width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" };