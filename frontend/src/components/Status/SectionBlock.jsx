import React from 'react';

export default function SectionBlock({ title, children }) {
  return (
    <section className="status-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
