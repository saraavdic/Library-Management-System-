import React from "react";
import "../../styles/style.css";

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h4>About</h4>
          <p>
            City Library is your gateway to knowledge, culture, and community. Serving Sarajevo with pride since 1990.
          </p>
        </div>

        <div className="footer-section">
          <h4> Location</h4>
          <div className="footer-contact">
            <div>
              <p>123 Main Street</p>
              <p>Sarajevo, Bosnia</p>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Hours</h4>
          <div className="footer-hours">
            <p>
              <strong>Mon–Fri</strong>
              <span>8:00 AM – 6:00 PM</span>
            </p>
            <p>
              <strong>Saturday</strong>
              <span>10:00 AM – 4:00 PM</span>
            </p>
            <p>
              <strong>Sunday</strong>
              <span>Closed</span>
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h4> Contact</h4>
          <div className="footer-contact">
            <a href="mailto:info@citylibrary.com" style={{ display: 'block' }}>info@citylibrary.com</a>
          </div>
          <div className="footer-contact">
            <a href="tel:+38733555777" style={{ display: 'block' }}>+387 33 555 777</a>
          </div>
          <div className="footer-social">
            <a href="#" title="Facebook" aria-label="Facebook">f</a>
            <a href="#" title="Twitter" aria-label="Twitter">𝕏</a>
            <a href="#" title="Instagram" aria-label="Instagram">📷</a>
            <a href="#" title="LinkedIn" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>

      <div>
        <p>© 2025 City Library. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
      </div>
    </footer>
  );
}
