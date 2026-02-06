import React from 'react';
import PDFItem from './PDFItem';

export default function PDFList() {
  const files = [
    {
      title: 'Library Rules',
      desc: 'Overview of borrowing & return rules',
      href: '/docs/library-rules.pdf',
    },
    {
      title: 'Library Laws',
      desc: 'Relevant local library law excerpts',
      href: '/docs/library-laws.pdf',
    },
    {
      title: 'Regulations',
      desc: 'Administrative regulations and policies',
      href: '/docs/library-regulations.pdf',
    },
  ];

  return (
    <div className="pdf-list">
      {files.map((f, i) => (
        <PDFItem key={i} title={f.title} desc={f.desc} href={f.href} />
      ))}
    </div>
  );
}
