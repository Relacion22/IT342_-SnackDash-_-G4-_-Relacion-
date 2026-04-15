import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload } from "lucide-react";
import { getStorageConfigError, uploadImageToSupabase } from "../lib/storage";

export default function CreateStall() {
  const navigate = useNavigate();
  const [stallName, setStallName] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStall, setCheckingStall] = useState(true);

  useEffect(() => {
    const checkOwnerSession = async () => {
      const userRole = localStorage.getItem("userRole");
      const token = localStorage.getItem("token");

      if (!userRole || userRole !== "OWNER" || !token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/stall/my-stall", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          localStorage.setItem("stallId", response.data.id);
          localStorage.setItem("stallName", response.data.name);
          navigate("/menu-dashboard");
          return;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      } finally {
        setCheckingStall(false);
      }
    };

    checkOwnerSession();
  }, [navigate]);

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setImagePreview(url || null);
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setImageFile(file);
    setImageUrl("");
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleCreateStall = async (e) => {
    e.preventDefault();

    if (!stallName.trim()) {
      setMessage("Please enter a stall name.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      let finalImageUrl = imageUrl || "";

      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile, "stalls");
      } else if (!finalImageUrl) {
        const storageError = getStorageConfigError();
        if (storageError) {
          setMessage(storageError);
        }
      }

      const payload = {
        name: stallName,
        category,
        description: description || "",
        imageUrl: finalImageUrl,
      };

      const response = await axios.post("http://localhost:8080/api/stall/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Stall created successfully. Redirecting...");
      localStorage.setItem("stallId", response.data.id);
      localStorage.setItem("stallName", response.data.name);

      setTimeout(() => {
        navigate("/menu-dashboard");
      }, 1200);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setMessage("Your session expired. Please sign in again.");
        setTimeout(() => navigate("/login"), 1200);
      } else if (error.response?.data) {
        setMessage(typeof error.response.data === "string" ? error.response.data : "Failed to create stall.");
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage("Failed to create stall. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingStall) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <p style={{ color: "#4b5563", fontSize: "1rem" }}>Loading stall setup...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "#7A0019", color: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>Create Your Stall</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Set up your food stall before adding menu items.</p>
        </div>

        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <form onSubmit={handleCreateStall}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>
                Stall Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Joe's Burgers, Maria's Kitchen"
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box", fontFamily: "inherit" }}
              >
                <option>Fast Food</option>
                <option>Italian</option>
                <option>Asian</option>
                <option>American</option>
                <option>Mexican</option>
                <option>Desserts</option>
                <option>Beverages</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>
                Description
              </label>
              <textarea
                placeholder="Tell customers about your stall..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>
                Stall Image
              </label>

              {imagePreview && (
                <div style={{ marginBottom: "1rem" }}>
                  <img src={imagePreview} alt="Stall preview" style={{ maxWidth: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", border: "2px solid #d1d5db" }} />
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", border: "2px dashed #d1d5db", borderRadius: "6px", cursor: "pointer", backgroundColor: "#f3f4f6", transition: "all 0.2s" }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  <div style={{ textAlign: "center" }}>
                    <Upload size={24} style={{ marginRight: "0.5rem", display: "inline" }} />
                    <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>Click to upload an image</p>
                  </div>
                </label>
              </div>

              <div>
                <label style={{ fontSize: "0.9rem", color: "#6b7280", display: "block", marginBottom: "0.5rem" }}>
                  Or paste image URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                  Uploaded files go to Supabase bucket <strong>stall-image</strong>.
                </p>
              </div>
            </div>

            {message && (
              <div style={{ padding: "1rem", marginBottom: "1.5rem", borderRadius: "6px", backgroundColor: message.toLowerCase().includes("success") ? "#d1fae5" : "#fee2e2", color: message.toLowerCase().includes("success") ? "#065f46" : "#991b1b", fontSize: "0.9rem" }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", backgroundColor: "#7A0019", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#5a0012")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#7A0019")}
            >
              {loading ? "Creating Stall..." : "Create Stall"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
