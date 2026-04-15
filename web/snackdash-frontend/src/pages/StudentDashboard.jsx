import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, ShoppingBag, User, Wallet, Star, LogOut, LayoutDashboard, MapPin } from "lucide-react";

const mockStalls = [
  {
    id: "1",
    name: "Pizza Corner",
    image: "https://images.unsplash.com/photo-1546993641-097e8366bba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlJTIwZm9vZHxlbnwxfHx8fDE3NzI0MDI1OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    status: "Open",
    category: "Italian",
    location: "Main Cafeteria"
  },
  {
    id: "2",
    name: "Burger House",
    image: "https://images.unsplash.com/photo-1656439659132-24c68e36b553?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmYXN0JTIwZm9vZHxlbnwxfHx8fDE3NzI0MzQ4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    status: "Open",
    category: "American",
    location: "East Wing"
  },
  {
    id: "3",
    name: "Sushi Bar",
    image: "https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMGphcGFuZXNlJTIwZm9vZHxlbnwxfHx8fDE3NzIzNjg5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    status: "Closed",
    category: "Japanese",
    location: "Main Cafeteria"
  },
  {
    id: "4",
    name: "Pasta Paradise",
    image: "https://images.unsplash.com/photo-1609166639722-47053ca112ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW4lMjBmb29kfGVufDF8fHx8MTc3MjQyMDk0NHww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    status: "Open",
    category: "Italian",
    location: "West Wing"
  },
  {
    id: "5",
    name: "Taco Fiesta",
    image: "https://images.unsplash.com/photo-1707604341704-74abdc25e52a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWNvcyUyMG1leGljYW4lMjBmb29kfGVufDF8fHx8MTc3MjM2ODcyNXww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.5,
    status: "Open",
    category: "Mexican",
    location: "Student Lounge"
  },
  {
    id: "6",
    name: "Sandwich Shop",
    image: "https://images.unsplash.com/photo-1666819604716-7b60a604bb76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGRlbGklMjBmb29kfGVufDF8fHx8MTc3MjMzNzcwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.4,
    status: "Open",
    category: "Deli",
    location: "Library Cafe"
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [studentName, setStudentName] = useState("Student");

  // Retrieve student name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const filteredStalls = mockStalls.filter((stall) =>
    stall.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stall.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {/* Embedded CSS for beautiful hover animations */}
      <style>{`
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: 12px; color: #64748b; font-weight: 500; transition: all 0.2s ease; cursor: pointer; border: none; background: transparent; width: 100%; text-align: left; font-size: 0.95rem; }
        .sidebar-link:hover { background-color: #f1f5f9; color: #7A0019; }
        .sidebar-link.active { background-color: #fff0f2; color: #7A0019; font-weight: 600; box-shadow: inset 4px 0 0 #7A0019; }
        .stall-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); transition: all 0.3s ease; border: 1px solid #f1f5f9; cursor: pointer; display: flex; flex-direction: column; }
        .stall-card:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05); }
        .search-input:focus { outline: 2px solid #7A0019; outline-offset: -1px; background-color: white; }
      `}</style>

      {/* LEFT SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        
        {/* Logo Area */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#7A0019', margin: '0 0 0.25rem 0', letterSpacing: '-0.025em' }}>SnackDash</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: '500' }}>CIT - University</p>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <p style={{ padding: '0 20px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Menu</p>
          
          <button className={`sidebar-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={20} />
            My Orders
          </button>

          <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20} />
            Profile Settings
          </button>
        </nav>

        {/* Logout Button at bottom */}
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid #f1f5f9' }}>
          <button className="sidebar-link" onClick={() => navigate("/login")} style={{ color: '#ef4444' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        
        {/* Top Header (Greeting + Search) */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.025em' }}>Welcome back, {studentName}! 👋</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>What are you craving today?</p>
          </div>

          {/* Wide Desktop Search Bar */}
          <div style={{ position: 'relative', width: '400px', maxWidth: '100%' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search for pizza, burgers, sushi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '9999px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', fontSize: '0.95rem', transition: 'all 0.2s' }}
            />
          </div>
        </header>

        {/* Highlight Area (Wallet & Banner) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Elegant Wallet Card */}
          <div style={{ background: 'linear-gradient(135deg, #7A0019, #9e0020)', borderRadius: '24px', padding: '2rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '180px', boxShadow: '0 20px 25px -5px rgba(122,0,25,0.2)' }}>
            {/* Background design element */}
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1 }}>
              <Wallet size={180} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Wallet size={20} color="#D4AF37" />
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#f8fafc', margin: 0 }}>Available Balance</p>
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: 0, letterSpacing: '-0.025em' }}>
                <span style={{ fontSize: '2rem', color: '#D4AF37', verticalAlign: 'top', marginRight: '4px' }}>₱</span>
                1,250.00
              </h2>
            </div>
            
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '1rem' }}>
              <button style={{ backgroundColor: '#D4AF37', color: '#7A0019', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>Top Up</button>
              <button style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'} onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}>History</button>
            </div>
          </div>

          {/* Promotional Banner */}
          <div style={{ background: 'linear-gradient(to right, #D4AF37, #eab308)', borderRadius: '24px', padding: '2rem', color: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '180px', boxShadow: '0 10px 15px -3px rgba(212,175,55,0.3)' }}>
             <span style={{ backgroundColor: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', width: 'fit-content', marginBottom: '1rem', textTransform: 'uppercase' }}>Special Offer</span>
             <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>Free Delivery on your first order!</h3>
             <p style={{ margin: 0, fontWeight: '500', opacity: 0.9 }}>Use code <strong>CITFREEDEL</strong> at checkout.</p>
          </div>

        </div>

        {/* Stalls Grid Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Campus Food Stalls</h3>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Showing {filteredStalls.length} stalls</span>
          </div>
          
          {/* The Desktop Grid! */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {filteredStalls.map((stall) => (
              <div key={stall.id} className="stall-card">
                
                {/* Stall Image - Top Half */}
                <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                  <img src={stall.image} alt={stall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Status Badge Over Image */}
                  <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.75rem', fontWeight: '700', padding: '6px 12px', borderRadius: '9999px', backgroundColor: stall.status === 'Open' ? '#dcfce7' : '#f1f5f9', color: stall.status === 'Open' ? '#166534' : '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {stall.status}
                  </span>
                </div>
                
                {/* Stall Info - Bottom Half */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>{stall.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fefce8', padding: '4px 8px', borderRadius: '8px' }}>
                      <Star size={16} fill="#eab308" color="#eab308" />
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#854d0e' }}>{stall.rating}</span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: '#7A0019', fontWeight: '600', margin: '0 0 1rem 0' }}>{stall.category}</p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <MapPin size={16} />
                    <span style={{ fontSize: '0.85rem' }}>{stall.location}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
          
          {filteredStalls.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '20px', color: '#64748b' }}>
               <Search size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
               <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>No stalls found</h3>
               <p>We couldn't find any food stalls matching "{searchQuery}"</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}