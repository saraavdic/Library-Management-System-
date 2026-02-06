import React from 'react';

export default function ContactDetails() {
  return (
    <div className="contact-card">
      <h2>Contact Details</h2>
      <p className="muted">We’re here to help. Reach out any time during desk hours.</p>

      <div className="contact-item">
        <strong>Address</strong>
        <p>123 Main Street, Sarajevo, Bosnia and Herzegovina</p>
      </div>

      <div className="contact-item">
        <strong>Phone</strong>
        <p><a href="tel:+38733555777">+387 33 555 777</a></p>
      </div>

      <div className="contact-item">
        <strong>Email</strong>
        <p><a href="mailto:info@citylibrary.com">info@citylibrary.com</a></p>
      </div>

      <div className="contact-item">
        <strong>Desk Hours</strong>
        <p>Mon–Fri 08 :00–18:00 • Sat 10:00–16:00 • Sun Closed</p>
      </div>
    </div>
  );
}
