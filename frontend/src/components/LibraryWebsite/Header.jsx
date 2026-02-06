import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleNavLinkClick = () => setMenuOpen(false);

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* overlay */}
      <div
        className={`menu-overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <header>
        <div className="header-left">
          <div className="logo">
            <Link to="/" className="logo-link" onClick={handleNavLinkClick}>
              <img src="/Media/icons8-library-64.png" alt="Library Logo" />
              <span>City Library</span>
            </Link>
          </div>
          <div className="contact-info">
            <p>CONTACT US</p>
            <p>info@citylibrary.com | +387 33 555 777</p>
          </div>
        </div>

        <nav ref={navRef} className={menuOpen ? "show" : ""}>
          <ul>
            <li><Link to="/" onClick={handleNavLinkClick}>Home</Link></li>
            <li><Link to="/login" onClick={handleNavLinkClick}>Sign In</Link></li>
            <li><Link to="/contact" onClick={handleNavLinkClick}>Contact</Link></li>
          </ul>
        </nav>

        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </header>
    </>
  );
}
