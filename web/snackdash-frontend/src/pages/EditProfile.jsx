import React, { useState, useRef } from 'react';
import './StudentDashboard.css';
import { Home, Receipt, User, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { uploadImageToSupabase } from '../lib/storage';

const EditProfile = () => {
  const navigate = useNavigate();
  
  // Read initial values from localStorage to keep it consistent
  const initialCourse = localStorage.getItem('userCourse') || 'BS Information Technology';
  const initialYear = localStorage.getItem('userYear') || '3rd Year';
  const initialImage = localStorage.getItem('userProfileImage') || 'https://via.placeholder.com/150';
  const userName = localStorage.getItem('userName') || 'Mekaela G. Relacion';

  // Form State
  const [course, setCourse] = useState(initialCourse);
  const [yearLevel, setYearLevel] = useState(initialYear);
  const [imagePreview, setImagePreview] = useState(initialImage);
  
  const [imageFile, setImageFile] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = imagePreview; 

      // 1. Upload to Supabase ONLY if they picked a new picture
      if (imageFile) {
        console.log("Uploading to Supabase...");
        finalImageUrl = await uploadImageToSupabase(imageFile, 'profiles'); 
        console.log("Upload successful:", finalImageUrl);
      }

      // 2. Save permanently to Backend Database
      await api.put('/users/profile', {
        course: course,
        yearLevel: yearLevel,
        profileImageUrl: finalImageUrl
      });

      // 3. Save to Local Storage so the Dashboard sees it IMMEDIATELY
      localStorage.setItem('userCourse', course);
      localStorage.setItem('userYear', yearLevel);
      localStorage.setItem('userProfileImage', finalImageUrl);

      alert('Profile saved successfully!');
      navigate('/dashboard'); 

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Check the console.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="student-dashboard-page">
      
      {/* ================= HERO SECTION (RED & WHITE) ================= */}
      <div className="student-dashboard-hero" style={{ background: "linear-gradient(135deg, #7A0019 0%, #a8002b 100%)" }}>
        <div className="student-dashboard-hero-inner">
          <div className="student-dashboard-hero-copy">
            <p className="hero-label" style={{ color: "rgba(255,255,255,0.8)" }}>Profile Settings</p>
            <h1 style={{ color: "white" }}>Manage your account</h1>
            <p className="hero-description" style={{ color: "rgba(255,255,255,0.9)" }}>
              Update your academic details and display picture.
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
                
                <div className="avatar-circle profile-avatar" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
                  <img 
                    src={imagePreview} 
                    alt="Sidebar Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </div>
              <div className="profile-stat">
                <p>Name</p>
                <strong>{userName}</strong>
              </div>
              <div className="profile-stat">
                <p>Course</p>
                <strong>{course}</strong>
              </div>
              <div className="profile-stat">
                <p>Year level</p>
                <strong>{yearLevel}</strong>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button 
                className="nav-link" 
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
              >
                <Home size={18} /> Home
              </button>
              
              <button 
                className="nav-link" 
                onClick={(e) => { e.preventDefault(); navigate('/my-orders'); }}
              >
                <Receipt size={18} /> Orders
              </button>
              
              {/* Active Profile Link styled in Red */}
              <button 
                className="nav-link active" 
                onClick={(e) => { e.preventDefault(); navigate('/student/edit-profile'); }}
                style={{ borderLeft: "4px solid #7A0019", color: "#7A0019", backgroundColor: "#fff1f2" }}
              >
                <User size={18} /> Profile
              </button>
            </nav>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <section className="student-dashboard-content">
            <div className="card" style={{ backgroundColor: "white" }}>
              <div className="card-title" style={{ marginBottom: '2rem' }}>
                <div>
                  <p className="subtitle-muted">Update Information</p>
                  <h2>Edit Profile</h2>
                </div>
                {/* Red Icon Badge */}
                <div className="avatar-circle profile-avatar" style={{ background: '#fff1f2', color: '#7A0019' }}>
                  <User size={20} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Left Side: Avatar Edit */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }}>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      disabled={isSaving}
                      style={{ position: 'absolute', bottom: '5px', right: '5px', background: isSaving ? '#94a3b8' : '#7A0019', color: 'white', border: '3px solid white', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                      <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0' }}>{userName}</h3>
                  {/* Student Badge in Red/Pink */}
                  <span style={{ fontSize: '0.8rem', color: '#7A0019', backgroundColor: '#fff1f2', padding: '4px 12px', borderRadius: '20px', marginTop: '8px', fontWeight: 'bold' }}>Student Account</span>
                </div>

                {/* Right Side: Form Edit */}
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Course / Degree</label>
                      <input 
                        type="text" 
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#7A0019'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Year Level</label>
                      <input 
                        type="text" 
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#7A0019'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                      <button 
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSaving}
                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: isSaving ? '#94a3b8' : '#7A0019', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(122, 0, 25, 0.2)' }}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;