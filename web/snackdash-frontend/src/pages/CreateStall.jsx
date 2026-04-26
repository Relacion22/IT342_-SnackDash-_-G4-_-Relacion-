import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Store, MapPin, Loader2 } from 'lucide-react';
import { uploadImageToSupabase } from '../lib/storage';
import api from '../lib/api';

const CreateStall = () => {
  const navigate = useNavigate();
  const [stallName, setStallName] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stallName || !imageFile) return alert('Please provide a stall name and an image.');

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImageToSupabase(imageFile, 'stalls');

      const stallData = {
        name: stallName,
        category: 'Campus Stall',
        description: location || 'Campus food stall',
        imageUrl,
        isOpen: true,
      };

      await api.post('/stall/create', stallData);

      navigate('/menu-dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data || 'Failed to create stall. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #fff4f5 50%, #feecef 100%)',
      padding: '2.5rem 1.5rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    },
    card: {
      width: '100%',
      maxWidth: '900px',
      backgroundColor: '#ffffff',
      border: '1px solid #f5d7d9',
      borderRadius: '32px',
      boxShadow: '0 30px 70px rgba(122, 0, 25, 0.14)',
      overflow: 'hidden',
    },
    header: {
      backgroundColor: '#7A0019',
      color: 'white',
      padding: '3rem 2rem',
    },
    headerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    iconWrapper: {
      width: '4rem',
      height: '4rem',
      borderRadius: '1.5rem',
      backgroundColor: 'rgba(255,255,255,0.12)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: 'inset 0 0 12px rgba(0,0,0,0.08)',
    },
    ownerLabel: {
      fontSize: '0.8rem',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: '#ffd9db',
      marginBottom: '0.65rem',
    },
    title: {
      fontSize: '2.75rem',
      lineHeight: 1.05,
      margin: 0,
      fontWeight: 700,
    },
    headerText: {
      maxWidth: '34rem',
      fontSize: '0.98rem',
      lineHeight: 1.7,
      color: '#fee2e2',
      margin: 0,
    },
    body: {
      padding: '2.5rem 2rem',
    },
    form: {
      display: 'grid',
      gap: '1.75rem',
    },
    fieldGroup: {
      display: 'grid',
      gap: '0.75rem',
    },
    label: {
      color: '#7A0019',
      fontWeight: 700,
      fontSize: '0.95rem',
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      borderRadius: '24px',
      border: '1px solid #f2c2c6',
      backgroundColor: '#fffaf9',
      padding: '1rem 1rem 1rem 3.2rem',
      fontSize: '0.95rem',
      color: '#221d1d',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9f2937',
    },
    bannerBox: {
      position: 'relative',
      borderRadius: '28px',
      border: '2px dashed #f4c4c6',
      backgroundColor: '#fff1f2',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      overflow: 'hidden',
    },
    bannerText: {
      color: '#88131b',
      fontWeight: 700,
      fontSize: '1rem',
    },
    bannerNote: {
      color: '#9f2937',
      fontSize: '0.85rem',
      marginTop: '0.5rem',
    },
    fileButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.85rem 1.2rem',
      borderRadius: '999px',
      border: '1px solid #7A0019',
      backgroundColor: '#ffffff',
      color: '#7A0019',
      fontWeight: 700,
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    button: {
      width: '100%',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '1rem 1.2rem',
      borderRadius: '28px',
      border: 'none',
      backgroundColor: '#7A0019',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 18px 30px rgba(122,0,25,0.2)',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
    notice: {
      borderRadius: '28px',
      border: '1px solid #fde6e7',
      backgroundColor: '#fff4f5',
      padding: '1.4rem',
      color: '#7a0019',
      boxShadow: '0 8px 20px rgba(122,0,25,0.08)',
    },
    noticeTitle: {
      margin: 0,
      fontWeight: 700,
    },
    noticeText: {
      margin: '0.75rem 0 0',
      lineHeight: 1.78,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerRow}>
            <div style={styles.iconWrapper}>
              <Store size={28} />
            </div>
            <div>
              <div style={styles.ownerLabel}>Stall Owner</div>
              <h1 style={styles.title}>Register Your Stall</h1>
            </div>
          </div>
          <p style={styles.headerText}>Create your stall profile with a bold banner image and tell students where they can find you.</p>
        </div>

        <div style={styles.body}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stall Banner Image</label>
              <div style={styles.bannerBox}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, borderRadius: '28px' }} />
                ) : null}
                <UploadCloud size={32} style={{ color: '#7A0019', marginBottom: '1rem' }} />
                <div style={styles.bannerText}>{imagePreview ? 'Change your stall image' : 'Upload a stall banner'}</div>
                <label htmlFor="file-upload" style={styles.fileButton}>
                  {imagePreview ? 'Change Image' : 'Choose File'}
                  <input id="file-upload" name="file-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </label>
                <div style={styles.bannerNote}>PNG, JPG up to 5MB</div>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stall Name</label>
              <div style={styles.inputWrapper}>
                <Store size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  placeholder="e.g. Pizza Corner"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Location / Booth Number</label>
              <div style={styles.inputWrapper}>
                <MapPin size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Canteen Booth 4"
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                backgroundColor: isSubmitting ? '#5e0016' : '#7A0019',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
              }}
            >
              {isSubmitting ? <Loader2 size={18} /> : null}
              {isSubmitting ? 'Processing...' : 'Register Stall'}
            </button>
          </form>

          <div style={styles.notice}>
            <p style={styles.noticeTitle}>What happens next?</p>
            <p style={styles.noticeText}>Your stall profile will be created immediately and should appear on the student dashboard once it is saved. Keep the stall banner bright and the description clear for better visibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStall;
