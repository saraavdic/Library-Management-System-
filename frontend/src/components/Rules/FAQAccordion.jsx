import React from 'react';
import FAQItem from './FAQItem';

export default function FAQAccordion({ faq, openFaq, setOpenFaq }) {
  return (
    <div className="faq-list">
      {faq.map((item, i) => (
        <FAQItem key={i} item={item} index={i} isOpen={openFaq === i} onToggle={setOpenFaq} />
      ))}
    </div>
  );
}
