import React from 'react';
import ContactDetails from './ContactDetails';
import LocationMap from './LocationMap';

export default function InfoLeft() {
  return (
    <div className="info-left">
      <ContactDetails />
      <LocationMap />
    </div>
  );
}
