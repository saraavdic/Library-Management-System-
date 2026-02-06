import React from "react";
import '../../../styles/Dashboard.css';

const PaymentFilter = ({ paymentFilters, setPaymentFilters, onReset }) => {
  return (
    <div className="filters-bar">
      <select 
        value={paymentFilters.type} 
        onChange={(e) => setPaymentFilters({ ...paymentFilters, type: e.target.value })} 
        className="filter-select"
      >
        <option value="">All Types</option>
        <option value="membership">Membership</option>
        <option value="fine">Fine</option>
      </select>
      <select 
        value={paymentFilters.status} 
        onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })} 
        className="filter-select"
      >
        <option value="">All Status</option>
        <option value="paid">Paid</option>
        <option value="not paid">Not paid</option>
      
      </select>
      <button 
        className="clear-filters-btn" 
        onClick={() => { setPaymentFilters({ type: '', status: '' }); if (typeof onReset === 'function') onReset(); }}
      >
        Reset
      </button>
    </div>
  );
};

export default PaymentFilter;