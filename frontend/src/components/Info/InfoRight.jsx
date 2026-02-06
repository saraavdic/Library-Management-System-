import React from 'react';
import ContactForm from './ContactForm';

export default function InfoRight({ form, handleChange, handleSubmit, status }) {
  return (
    <aside className="info-right">
      <ContactForm form={form} handleChange={handleChange} handleSubmit={handleSubmit} status={status} source="website" />    </aside>
  );
}