import React from "react";
import '../../../styles/Dashboard.css';
import SortIcon from '../ui/SortIcon';

const PaymentsTable = ({ payments, paymentSort, handlePaymentSort }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => handlePaymentSort('member')}>
              Member <SortIcon column="member" currentSort={paymentSort} />
            </th>
            <th className="sortable" onClick={() => handlePaymentSort('amount')}>
              Amount <SortIcon column="amount" currentSort={paymentSort} />
            </th>
            <th className="sortable" onClick={() => handlePaymentSort('type')}>
              Type <SortIcon column="type" currentSort={paymentSort} />
            </th>
            <th className="sortable" onClick={() => handlePaymentSort('status')}>
              Status <SortIcon column="status" currentSort={paymentSort} />
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.member}</td>
              <td>${(payment.amount || 0).toFixed(2)}</td>
              <td>{payment.type}</td>
              <td><span className={`status ${payment.status}`}>{payment.status === 'pending' ? 'not paid' : payment.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;

