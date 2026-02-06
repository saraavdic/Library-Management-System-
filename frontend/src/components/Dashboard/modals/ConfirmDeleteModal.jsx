import React from "react";
import Modal from '../../common/Modal';
import '../../../styles/Dashboard.css';

const ConfirmDeleteModal = ({ id, onConfirm, onCancel, deleting, error }) => {
  return (
    <Modal 
      isOpen={id != null} 
      onClose={onCancel} 
      title="Confirm Action"
      actions={
        <>
          <button className="delete-btn" onClick={onConfirm} disabled={deleting || !!error}>
            {deleting ? 'Applying…' : 'Yes, confirm'}
          </button>
          <button className="clear-filters-btn" onClick={onCancel} disabled={deleting}>Cancel</button>
        </>
      }
    >
      {error ? (
        <p style={{ color: '#ff6b6b', fontWeight: 600 }}>{error}</p>
      ) : (
        <p>Are you sure you want to deactivate/delete? This action cannot be undone.</p>
      )}
    </Modal>
  );
};

export default ConfirmDeleteModal;