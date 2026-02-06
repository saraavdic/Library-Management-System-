import React, { useState } from "react";
import ContactForm from "../Info/ContactForm";
import "../../styles/websiteContact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    // Called by ContactForm after successful submit
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus(""), 3000);
    }, 500);
  };

  return (
    <>
      <main className="contact-main">
        <div className="contact-container">
          {/* Page Header */}
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p>Get in touch with us. We'd love to hear from you.</p>
          </div>

          <div className="contact-content">
            {/* Location Section */}
            <div className="location-section">
              <div className="location-card">
                <h2>Our Location</h2>
                <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5593.5347237115075!2d18.30942403643436!3d43.820190192194644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4758ca0bbb37da7b%3A0xa14d6099047dafb9!2sInternational%20University%20of%20Sarajevo!5e0!3m2!1shr!2sba!4v1762443906432!5m2!1shr!2sba"
      width="100%"
      height="300"
      style={{ border: 0, borderRadius: '12px' }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Library Location"
    ></iframe>
                <div className="location-info">
                  <h3>Library Address</h3>
                  <div className="address">
                    <p><strong>123 Main Street</strong></p>
                    <p>Sarajevo, Bosnia and Herzegovina</p>
            
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Send Message Section */}
            <div className="message-section">
                <ContactForm
                  form={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  status={status}
                  source="website"
                />
            </div>
          </div>

          {/* Additional Contact Methods */}
          <div className="contact-methods">
            <h2>Other Ways to Reach Us</h2>
            <div className="method-cards">
              <div className="method-card">
                <div className="method-icon"><img src="/Media/phone-call.png" alt="Phone" style={{ width: '50px', height: '50px' }} /></div>
                <h3>Phone</h3>
                <p>+387 33 555 777</p>
                <small>Mon-Fri: 8AM-6PM</small>
              </div>
              
              <div className="method-card">
                <div className="method-icon"><img src="/Media/email.png" alt="Email" style={{ width: '50px', height: '50px' }} /></div>
                <h3>Email</h3>
                <p>info@library.com</p>
                <small>We'll respond within 24 hours</small>
              </div>
              
              <div className="method-card">
                <div className="method-icon"><img src="/Media/chat.png" alt="Live Chat" style={{ width: '50px', height: '50px' }} /></div>
                <h3>Chat</h3>
                <p>Available on website</p>
                <small>Mon-Fri: 10AM-4PM</small>
              </div>
              
              <div className="method-card">
                <div className="method-icon"><img src="/Media/location-pin.png" alt="Location" style={{ width: '50px', height: '50px' }} /></div>
                <h3>Visit Us</h3>
                <p>123 Main Street</p>
                <small>Walk-ins welcome</small>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Contact;