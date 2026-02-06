import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from "../components/common/Hero";
import '../styles/Rules.css';
import RuleCard from '../components/Rules/RuleCard';
import FAQAccordion from '../components/Rules/FAQAccordion';
import PDFList from '../components/Rules/PDFList';

const RULE_SECTIONS = [
  {
    id: 'borrowing',
    title: 'Borrowing Rules',
    items: [
      'Members may borrow up to 2 physical books at a time.',
      'Loan period is 14 days for all members.',
      'High-demand items may have shorter loan periods.',
      'Bring your membership ID when collecting reserved items.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Renewals',
    items: [
      'Returns can be made at the front desk or via the 24/7 book drop outside the main entrance.',
      'Renewals are available online (if no holds) or at the desk. Each item can be renewed twice by default.',
      'Overdue items accrue fines as listed below and block future borrowing until cleared.',
    ],
  },
  {
    id: 'fines',
    title: 'Fines & Charges',
    items: [
      'Overdue fines: $2 per item (capped at replacement cost).',
      'Damaged or lost items: charged at replacement cost plus a processing fee.',
      'Fines and fees must be cleared to resume borrowing privileges.',
    ],
  },
  {
    id: 'conduct',
    title: 'Acceptable Conduct',
    items: [
      'Maintain a quiet environment in reading/study areas; mobile phones on silent.',
      'Food is allowed only in designated areas; beverages must be in spill-proof containers.',
      'Respect staff requests and library property.',
      'Abusive behaviour may lead to suspension of membership.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    items: [
      'We store borrowing history and preferences to provide personalized recommendations.',
      'Personal data is handled per our privacy policy. Requests to view or delete data can be made at the desk.',
      'When you like/dislike items (catalogue), it affects your recommendation profile.',
    ],
  },
];

const FAQ = [
  {
    q: 'How do I extend membership?',
    a: 'Use the “Extend” option in your Membership page or contact the desk. Extensions are subject to item holds and maximum renewal limits.',
  },
  {
    q: 'Can I request a book the library does not own?',
    a: 'Yes — use the acquisition request form available at the front desk or via contact us via email or phone number.',
  },
  {
    q: 'What payment methods are accepted for fines?',
    a: 'We accept cash at the desk and card payments online. See the payment section in your Membership page for details.',
  },
];

export default function Rules() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="rules-container">
      <Navbar />
      <main className="rules-main">
        <Hero title="Rules & Regulations" subtitle="Guidelines to ensure a safe, fair, and welcoming library for everyone." />

        <section className="rules-grid">
          <div className="rules-column">
            {RULE_SECTIONS.map((section) => (
              <RuleCard key={section.id} section={section} />
            ))}
          </div>

          <aside className="rules-side">

            <div className="faq-panel">
              <h4>FAQ</h4>
              <FAQAccordion faq={FAQ} openFaq={openFaq} setOpenFaq={setOpenFaq} />
            </div>

            <div className="policy-panel">
              <h4>Documents</h4>
              <PDFList />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}