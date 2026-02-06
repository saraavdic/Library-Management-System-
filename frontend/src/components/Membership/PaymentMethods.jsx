import React from 'react';

export default function PaymentMethods({ onSelect }) {
  return (
    <div className="payment-methods">
      <button className="payment-method" onClick={() => onSelect('Credit Card')}>Credit Card</button>
      <button className="payment-method" onClick={() => onSelect('Bank Transfer')}>Bank Transfer</button>
      <button className="payment-method" onClick={() => onSelect('Digital Wallet')}>Digital Wallet</button>
    </div>
  );
}
