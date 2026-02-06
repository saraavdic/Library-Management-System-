import React from 'react';

export default function FAQItem({ item, index, isOpen, onToggle }) {
  return (
    <div className="accordion-item" key={index}>
      <button
        className={`accordion-header ${isOpen ? 'open' : ''}`}
        onClick={() => onToggle(isOpen ? null : index)}
        aria-expanded={isOpen}
      >
        {item.q}
        <span className="chev">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={`accordion-content ${isOpen ? 'show' : ''}`}>
        <p>{item.a}</p>
      </div>
    </div>
  );
}
