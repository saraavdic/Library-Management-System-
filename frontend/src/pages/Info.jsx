import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import InfoLeft from '../components/Info/InfoLeft';
import InfoRight from '../components/Info/InfoRight';
import '../styles/Info.css';
import Hero from '../components/common/Hero';

export default function Info() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
    
      // await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });

      // Simulate success
      await new Promise((r) => setTimeout(r, 700));
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="info-container">
      <Navbar />
      <main className="info-main">
        <Hero title="Contact & Info" subtitle="Get in touch with the library — questions, requests, or directions." />

        <section className="info-grid">
          <InfoLeft />
          <InfoRight form={form} handleChange={handleChange} handleSubmit={handleSubmit} status={status} />
        </section>
      </main>
    </div>
  );
}