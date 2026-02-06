import React from 'react';
import '../../styles/contactForm.css';

export default function ContactForm({ form, handleChange, handleSubmit, status, source = 'website' }) {
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Log the data being sent
    console.log('Submitting form with data:', {
      name: form.name,
      email: form.email,
      subject: form.subject || '',
      message: form.message,
      source
    });
    
    // Call parent handleSubmit to set status to "sending"
    handleSubmit(e);
    
    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject || '',
        message: form.message,
        source
      };
      
      console.log('Sending to backend:', payload);
      
      const res = await fetch('http://localhost:8081/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to send message');
      }
      
      const data = await res.json();
      console.log('Message saved successfully:', data);
      
      // Show success alert
      alert('Thank you! Your message has been sent successfully. We will respond within 1-2 business days.');
    } catch (err) {
      console.error('Error sending message:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="form-card">
      <h2>Ask a Question</h2>
      <p className="muted">Send us a message and we will respond within 1-2 business days.</p>

      <form className="contact-form" onSubmit={onSubmit}>
        <label>
          <span className="label-text">Name</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          <span className="label-text">Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          <span className="label-text">Subject</span>
          <input name="subject" value={form.subject} onChange={handleChange} />
        </label>

        <label>
          <span className="label-text">Message</span>
          <textarea name="message" rows="6" value={form.message} onChange={handleChange} required />
        </label>

        <div className="form-actions">
          <button type="submit" className="send-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </div>

        {status === 'success' && <p className="form-success">Message sent successfully! We will respond soon.</p>}
        {status === 'error' && <p className="form-error">Failed to send. Please try again later.</p>}      </form>
    </div>
  );
}