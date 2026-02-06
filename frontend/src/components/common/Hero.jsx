import React from 'react';
import '../../styles/Hero.css';

export default function Hero({ title, subtitle, className = '', children, actions, image }) {
  return (
    <section className={`hero-section ${className}`.trim()}>
      <div className="hero-content">
        {image && <img src={image} alt="" className="hero-image" />}
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
        {actions && <div className="hero-actions">{actions}</div>}
        {children}
      </div>
    </section>
  );
}
