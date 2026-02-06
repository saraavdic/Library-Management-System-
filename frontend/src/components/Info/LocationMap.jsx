import React from 'react';

export default function LocationMap() {
  return (
    <div className="location-card">
      <h3>Location</h3>
      <div className="map-embed" role="region" aria-label="Library location">
        <iframe
          title="Library Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.6423356443433!2d18.306477675666496!3d43.82177774151213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4758ca0bbb37da7b%3A0xa14d6099047dafb9!2sInternational%20University%20of%20Sarajevo!5e0!3m2!1shr!2sba!4v1764340915219!5m2!1shr!2sba"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
