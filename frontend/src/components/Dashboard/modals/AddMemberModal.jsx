import React from "react";
import Modal from '../../common/Modal';
import '../../../styles/Dashboard.css';

const AddMemberModal = ({ showAddModal, formData, setFormData, onClose, onSave }) => {
  return (
    <Modal 
      isOpen={showAddModal} 
      onClose={onClose} 
      title="Add New Member"
      actions={
        <>
          <button className="save-btn" onClick={onSave}>Add Member</button>
          <button className="clear-filters-btn" onClick={() => { setFormData({}); onClose(); }}>Cancel</button>
        </>
      }
    >
      <label>
        <span className="label-text">First name</span>
        <input
          type="text"
          placeholder="First name"
          value={formData.first_name || ''}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
      </label>
      <label>
        <span className="label-text">Last name</span>
        <input
          type="text"
          placeholder="Last name"
          value={formData.last_name || ''}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        />
      </label>
      <label>
        <span className="label-text">Email</span>
        <input
          type="email"
          placeholder="Email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </label>
    </Modal>
  );
};

export default AddMemberModal;