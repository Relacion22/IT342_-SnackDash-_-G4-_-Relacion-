import { useState, useEffect } from "react";
import axios from "axios";

export default function MenuDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Meals");
  const [message, setMessage] = useState("");

  // Fetch items when the page loads
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/menu/all");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setMessage("❌ Please fill in all required fields.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/menu/add", {
        name: name,
        price: parseFloat(price),
        category: category,
        isAvailable: true
      });
      setMessage("✅ Menu item added successfully!");
      setName("");
      setPrice("");
      fetchMenu(); // Refresh the list
    } catch (error) {
      setMessage("❌ Failed to add item.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ backgroundColor: "#7A0019", padding: "1rem", color: "white", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2>🍔 Stall Owner Dashboard - Menu Management</h2>
      </header>

      {/* Add Item Form */}
      <div style={{ backgroundColor: "#f3f4f6", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h3>Add New Food Item</h3>
        <form onSubmit={handleAddItem} style={{ display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center" }}>
          <input 
            type="text" placeholder="Food Name (e.g., Burger)" value={name} 
            onChange={(e) => setName(e.target.value)} required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
          />
          <input 
            type="number" step="0.01" placeholder="Price (₱)" value={price} 
            onChange={(e) => setPrice(e.target.value)} required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "100px" }}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "0.5rem", borderRadius: "4px" }}>
            <option value="Meals">Meals</option>
            <option value="Drinks">Drinks</option>
            <option value="Snacks">Snacks</option>
          </select>
          <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#108981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Add Item
          </button>
        </form>
        {message && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>}
      </div>

      {/* Display Menu Items */}
      <div>
        <h3>Current Menu</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#7A0019", color: "white", textAlign: "left" }}>
              <th style={{ padding: "0.75rem" }}>ID</th>
              <th style={{ padding: "0.75rem" }}>Name</th>
              <th style={{ padding: "0.75rem" }}>Category</th>
              <th style={{ padding: "0.75rem" }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "0.75rem" }}>{item.id}</td>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{item.name}</td>
                <td style={{ padding: "0.75rem" }}>{item.category}</td>
                <td style={{ padding: "0.75rem" }}>₱{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
