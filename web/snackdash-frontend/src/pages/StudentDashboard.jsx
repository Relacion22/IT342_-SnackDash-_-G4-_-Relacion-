import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';
import api from '../lib/api';
import { Search, Home, Receipt, User, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Read from localStorage
  const user = {
    name: localStorage.getItem('userName') || 'Mekaela G. Relacion',
    course: localStorage.getItem('userCourse') || 'BS Information Technology',
    year: localStorage.getItem('userYear') || '3rd Year',
    profileImage: localStorage.getItem('userProfileImage') || 'https://via.placeholder.com/150',
    wallet: '₱ 1,250.00',
    level: 'Student',
  };

  const normalizeStudentStall = (stallData) => ({
    ...stallData,
    isOpen: stallData?.isOpen ?? stallData?.open ?? false,
    open: stallData?.open ?? stallData?.isOpen ?? false,
  });

  useEffect(() => {
    const loadStalls = async () => {
      setLoading(true);
      try {
        const response = await api.get('/marketplace/stalls');
        const backendStalls = response.data?.data || [];
        setStalls(Array.isArray(backendStalls) ? backendStalls.map(normalizeStudentStall) : []);
      } catch (error) {
        console.error('Failed to load stalls:', error);
        setStalls([]);
      } finally {
        setLoading(false);
      }
    };

    loadStalls();
    const intervalId = setInterval(loadStalls, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const availableStalls = stalls.filter((stall) => stall.isOpen ?? stall.open);

  const filteredStalls = availableStalls.filter((stall) =>
    stall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stall.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stall.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (stall) => {
    const map = {
      Italian: '🍕',
      American: '🍔',
      Vegan: '🥗',
      Dessert: '🍰',
      'Campus Stall': '🥙',
    };
    return map[stall.category] || '🍽️';
  };

  return (
    <div className="student-dashboard-page">
      <div className="student-dashboard-hero">
        <div className="student-dashboard-hero-inner">
          <div className="student-dashboard-hero-copy">
            <p className="hero-label">Student Hub</p>
            <h1>Good afternoon, {user.name.split(' ')[0]}</h1>
            <p className="hero-description">
              Find the best campus food stalls fast. Only open stalls are shown for a quick ordering experience.
            </p>
          </div>
        </div>
      </div>

      <main className="student-dashboard-main">
        <div className="student-dashboard-layout">
          
          <aside className="student-dashboard-sidebar">
            <div className="sidebar-card sidebar-brand">
              <p className="subtitle-muted">SnackDash</p>
              <h2>CTI - University</h2>
            </div>

            <div className="sidebar-card profile-card">
              <div className="card-title">
                <div>
                  <p className="subtitle-muted">Your profile</p>
                  <h2>Student Info</h2>
                </div>

                {/* ✅ Clickable Profile Image */}
                <div
                  onClick={() => {
                    console.log("Navigating to Edit Profile...");
                    navigate('/student/edit-profile');
                  }}
                  className="avatar-circle profile-avatar cursor-pointer hover:opacity-80 transition"
                  style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}
                >
                  <img
                    src={user.profileImage}
                    alt="Profile"
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

            {/* ✅ UPDATED NAVIGATION WITH DEBUG */}
            <nav className="sidebar-nav">
              <button 
                className="nav-link active" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  console.log("Navigating to Dashboard...");
                  navigate('/dashboard'); 
                }}
              >
                <Home size={18} />
                Home
              </button>

              <button 
                className="nav-link" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  console.log("Navigating to Orders page...");
                  navigate('/my-orders'); 
                }}
              >
                <Receipt size={18} />
                Orders
              </button>

              <button 
                className="nav-link" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  console.log("Navigating to Edit Profile...");
                  navigate('/student/edit-profile'); 
                }}
              >
                <User size={18} />
                Profile
              </button>
            </nav>
          </aside>

          <section className="student-dashboard-content">
            <div className="card hero-card-block">
              <div className="card-title">
                <div>
                  <p className="subtitle-muted">Welcome back</p>
                  <h2>Your campus food map</h2>
                </div>
                <div className="avatar-circle avatar-primary">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <p>Open stalls</p>
                  <strong>{availableStalls.length}</strong>
                </div>
                <div className="stat-card">
                  <p>Estimated delivery</p>
                  <strong>10-15 min</strong>
                </div>
              </div>

              <div className="search-panel">
                <Search size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search open stalls..."
                />
              </div>

              <div className="filter-buttons">
                {['Pizza', 'Burgers', 'Vegan', 'Desserts'].map(tag => (
                  <button key={tag} className="filter-button">{tag}</button>
                ))}
              </div>
            </div>

            <div className="card student-stall-section">
              <div className="card-title">
                <div>
                  <p className="subtitle-muted">Available stalls only</p>
                  <h2>Open Stalls Nearby</h2>
                </div>
                <span className="status-badge">Open now</span>
              </div>

              <div className="student-stall-list">
                {loading ? (
                  <div className="student-stall-card empty-card">Loading stalls...</div>
                ) : filteredStalls.length > 0 ? (
                  filteredStalls.map((stall) => (
                    <div
                      key={stall.id}
                      className="student-stall-card"
                      onClick={() => navigate(`/stalls/${stall.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {stall.imageUrl && (
                        <div style={{ width: "100%", height: "120px", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                          <img
                            src={stall.imageUrl}
                            alt={stall.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}

                      <div className="student-stall-card-top">
                        <div className="student-stall-icon">{getIcon(stall)}</div>
                        <span className="status-badge">Open</span>
                      </div>

                      <h3>{stall.name}</h3>
                      <p>{stall.category || 'Campus Stall'}</p>
                      <p style={{ marginTop: '0.75rem', color: '#64748b' }}>
                        {stall.description || 'Fresh campus food.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="student-stall-card empty-card">
                    No stalls are open right now. Check back soon.
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;