import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';
import ModalPassword from './ModalPassword';

const NAV_ITEMS = [
  { label: 'Home', path: '/LibraryPortal' },
  { label: 'Status', path: '/status' },
  { label: 'Membership', path: '/membership' },
  { label: 'Catalogue', path: '/catalogue' }, 
  { label: 'Rules & Regulations', path: '/rules' },
  { label: 'Info', path: '/info' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [userId, setUserId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
      setUserName(user.name || '');
      setUserId(user.user_id || user.id || null);
      
      // Fetch user data from backend to get latest profile picture from database
      const fetchUserData = async () => {
        try {
          const userId = user.user_id || user.id;
          if (userId) {
            const resp = await fetch(`/api/users/${userId}`);
            if (resp.ok) {
              const dbUser = await resp.json();
              // Use profile picture from database if available, otherwise use localStorage
              if (dbUser.profile_picture) {
                setProfilePicture(dbUser.profile_picture);
                localStorage.setItem('profilePicture', dbUser.profile_picture);
              } else {
                // If no profile picture in database, try localStorage
                const storedProfilePicture = localStorage.getItem('profilePicture');
                if (storedProfilePicture) {
                  setProfilePicture(storedProfilePicture);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching user profile picture:', err);
          // Fallback to localStorage
          const storedProfilePicture = localStorage.getItem('profilePicture');
          if (storedProfilePicture) {
            setProfilePicture(storedProfilePicture);
          }
        }
      };
      
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const handleScroll = () => {
      if (profileOpen) setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [profileOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  const toggleDarkMode = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSignOut = () => {
    console.log('Signing out...');
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('theme');
    } catch (err) {
      console.warn('Error clearing storage', err);
    }

    setProfileOpen(false);
    navigate('/logged-out', { replace: true });
  };

  const handleChangePassword = () => {
    setPasswordModalOpen(true);
    setProfileOpen(false); // Close profile dropdown when opening password modal
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // Convert file to base64 and store in localStorage + send to backend
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result;
        if (base64String) {
          setProfilePicture(base64String);
          localStorage.setItem('profilePicture', base64String);
          console.log('Profile picture saved locally');
          
          // Send to backend to save/overwrite in database
          if (!userId) {
            console.warn('No userId available, skipping database save');
            return;
          }
          
          try {
            const resp = await fetch(`/api/users/${userId}/profile-picture`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profilePicture: base64String })
            });
            const respData = await resp.json();
            if (!resp.ok) {
              console.error('Failed to save profile picture. Response:', resp.status, respData);
              throw new Error(respData.error || 'Failed to save profile picture to database');
            }
            console.log('Profile picture saved to database (overwriting any existing picture)', respData);
          } catch (err) {
            console.error('Error saving profile picture to database:', err);
            // Still keep the local copy even if backend fails
            alert('Warning: Picture saved locally but failed to save to database: ' + err.message);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      // call backend to remove profile picture
      if (!userId) {
        // fallback: clear local only
        setProfilePicture(null);
        localStorage.removeItem('profilePicture');
        return;
      }

      const resp = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resp.ok) throw new Error('Failed to remove profile picture');
      // success: clear local state/storage and switch to default
      setProfilePicture(null);
      localStorage.removeItem('profilePicture');
      console.log('Profile picture removed');
    } catch (err) {
      console.error('Error removing profile picture', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src="/Media/icons8-library-64.png" alt="Library Logo" />
          <span>City Library</span>
        </Link>
      </div>

      <nav className={`nav-menu ${menuOpen ? 'show' : ''}`}>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-right">
        {userRole !== 'admin' && (
          <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            ☰
          </button>
        )}
        {/* ATTACH REF HERE to detect outside clicks */}
        <div className="profile-container" ref={profileRef}>
          <div className="profile-circle" onClick={toggleProfile}>
            <img
              src={profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
              alt={userName ? `${userName} profile` : 'Default profile'}
              className="profile-picture"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
          {profileOpen && (
            <div className="profile-dropdown">
              <ul className="profile-menu">
                <li>
                  <button className="profile-option" onClick={handleProfilePictureClick}>
                    Add Profile Picture
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </li>
                   <li>
                  <button className="profile-option remove" onClick={handleRemoveProfilePicture}>
                    Remove Profile Picture
                  </button>
                </li>
                <li>
                  <button className="profile-option" onClick={handleChangePassword}>
                    Change Password
                  </button>
                </li>
                <li>
                  <button className="profile-option" onClick={toggleDarkMode}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                <li>
                  <button className="profile-option sign-out" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <span className="welcome-text">Welcome back, {(userName?.split(' ')[0]) || 'Guest'}</span>
      </div>

      <ModalPassword isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </header>
  );
}