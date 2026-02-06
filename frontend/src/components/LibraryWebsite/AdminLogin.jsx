import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // noop for parity with public login
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Call admin login endpoint (hidden)
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.username, password: formData.password })
      });

      const data = await resp.json();
      console.log('Admin login response status:', resp.status);
      console.log('Admin login response data:', data);
      if (!resp.ok || !data.success) {
        const errorMsg = data.error || 'Invalid username or password';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const user = data.user;
      // Store user info and token in localStorage (exclude password)
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          user_id: user.user_id,
          email: user.email,
          name: user.first_name ? (user.first_name + (user.last_name ? (' ' + user.last_name) : '') ) : user.email,
          role: user.role,
          profile_picture: user.profile_picture || null
        }));
        if (user.profile_picture) {
          localStorage.setItem('profilePicture', user.profile_picture);
        } else {
          localStorage.removeItem('profilePicture');
        }
      } catch (err) {
        console.warn('Could not persist user to localStorage', err);
      }

      // Ensure theme is set to light on login and apply immediately
      try {
        localStorage.setItem('theme', 'light');
        document.body.classList.add('light-mode');
      } catch (err) {
        console.warn('Could not persist theme to localStorage', err);
      }

      const successMsg = `Welcome back, ${user.first_name || 'Admin'}!`;
      setSuccess(successMsg);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      const errorMsg = 'Login failed. Please try again.';
      setError(errorMsg);
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="login-main">
        <div className="login-container">
          <div className="login-grid">
            <div className="login-card">
              <h2>Admin Sign In</h2>
              <p className="login-subtitle">Please sign in to your admin account</p>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Email</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      aria-describedby="toggle-password"
                    />
                    <button
                      type="button"
                      id="toggle-password"
                      className="password-toggle"
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={toggleShowPassword}
                    >
                      <img
                        src={showPassword ? "/Media/eye.png" : "/Media/eyebrow.png"}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    Remember me
                  </label>
                  <a href="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="demo-hint">Demo: admin/admin123</p>
            </div>

            <aside className="login-aside" aria-hidden="true">
              <img src="/Media/login-picture.jpg" alt="Library" />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminLogin;