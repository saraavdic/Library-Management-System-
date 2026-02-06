import React from 'react';
import Modal from '../common/Modal';
import PaymentMethods from './PaymentMethods';

export default function UniversalModal({
  modalState,
  closeModal,
  totalFines,
  getExtensionPrice,
  calculateNewExpiryDate,
  handlePayFines,
  handleExtensionPayment,
  openModal,
}) {
  if (!modalState || !modalState.isOpen) return null;

  // Use the shared Modal wrapper for structure and accessibility
  return (
    <Modal isOpen={modalState.isOpen} onClose={closeModal} title={
      modalState.type === 'pay' ? 'Pay Fines' : modalState.type === 'extend-options' ? 'Extend Membership' : modalState.type === 'extend-payment' ? 'Confirm Payment' : ''
    }>
      {/* Pay Fines Modal */}
      {modalState.type === 'pay' && (
        <div className="payment-info">
          <p className="payment-amount">
            Total Amount: <strong>${totalFines.toFixed(2)}</strong>
          </p>
          <PaymentMethods onSelect={(method) => handlePayFines(method)} />
        </div>
      )}

      {/* Extend Options Modal - Choose years */}
      {modalState.type === 'extend-options' && (
        <div className="extension-info">
          <p className="extension-subtitle">Extend your membership by 1 year</p>
          <div className="extension-details">
            <p className="extension-cost">Cost: <strong>${getExtensionPrice()}</strong></p>
            <p className="extension-preview">New expiry date: <strong>{calculateNewExpiryDate(1)}</strong></p>
          </div>
          <button className="extension-confirm-btn" onClick={() => openModal('extend-payment', 1)}>
            Continue to Payment
          </button>
          <div className="current-expiry">
            <p>Current expiry: <strong>{calculateNewExpiryDate(0)}</strong></p>
          </div>
        </div>
      )}

      {/* Extend Payment Modal - Select payment method */}
      {modalState.type === 'extend-payment' && (
        <>
          <div className="payment-info">
            <p className="payment-amount">Extension: <strong>{modalState.extensionYears} Year(s)</strong></p>
            <p className="payment-amount">Amount: <strong>${getExtensionPrice(modalState.extensionYears)}</strong></p>
            <p className="extension-preview">New expiry date: <strong>{calculateNewExpiryDate(modalState.extensionYears)}</strong></p>
            <PaymentMethods onSelect={(method) => handleExtensionPayment(method, modalState.extensionYears)} />
          </div>
          <button className="back-btn" onClick={() => openModal('extend-options')}>← Back</button>
        </>
      )}
    </Modal>
  );
}
