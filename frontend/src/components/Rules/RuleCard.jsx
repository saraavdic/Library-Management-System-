import React from 'react';

export default function RuleCard({ section }) {
  return (
    <article className="rule-card" key={section.id}>
      <h3>{section.title}</h3>
      <ul className="rules-list">
        {section.items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    </article>
  );
}
