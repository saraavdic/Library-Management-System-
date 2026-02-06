import React, { useState, useEffect } from "react";
import PaymentsTable from '../tables/PaymentsTable';
import PaymentFilter from '../filters/PaymentFilter';
import LoadMoreButton from '../../common/LoadMoreButton';
import '../../../styles/Dashboard.css';

const PaymentsTab = ({ payments, searchQuery, setSearchQuery }) => {
  const [paymentFilters, setPaymentFilters] = useState({ type: '', status: '' });
  const [paymentSort, setPaymentSort] = useState({ column: 'member', order: 'asc' });
  const [isSyncing, setIsSyncing] = useState(false);

  // paging
  const [visibleCount, setVisibleCount] = useState(5);

  // reset visibleCount whenever filters/search/sort or payments change
  useEffect(() => {
    setVisibleCount(5);
  }, [searchQuery, paymentFilters, paymentSort, payments]);

  const handleSyncFines = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('http://localhost:8081/api/fines/sync-overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to sync fines');
      const result = await res.json();
      alert(`✓ Checked ${result.totalOverdue} overdue records.\nCreated ${result.finesCreated} new fines.`);
    } catch (err) {
      console.error('Error syncing fines:', err);
      alert('✗ Error syncing fines: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const getFilteredAndSortedPayments = () => {
    const q = (searchQuery || '').trim().toLowerCase();
    const filterStatus = paymentFilters.status === 'not paid' ? 'pending' : paymentFilters.status;

    let filtered = payments.filter(p => {
      // apply filters first
      if (paymentFilters.type !== '' && p.type !== paymentFilters.type) return false;
      if (paymentFilters.status !== '' && p.status !== filterStatus) return false;

      if (!q) return true;

      // match member, amount, type, or status
      const member = (p.member || '').toString().toLowerCase();
      const type = (p.type || '').toString().toLowerCase();
      const status = (p.status === 'pending' ? 'not paid' : (p.status || '')).toString().toLowerCase();
      const amountStr = (typeof p.amount === 'number' ? p.amount.toFixed(2) : (p.amount || '').toString());
      const qNum = q.replace(/[^0-9.]/g, '');

      return member.includes(q) || type.includes(q) || status.includes(q) || amountStr.includes(q) || (qNum && amountStr.includes(qNum));
    });

    // Detect duplicates and dedupe by `id` to prevent duplicate rows appearing when sorting
    const idCounts = filtered.reduce((acc, p) => {
      const id = p.id ?? `${p.member}-${p.type}-${p.amount}`;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    const dupIds = Object.keys(idCounts).filter(k => idCounts[k] > 1);
    if (dupIds.length) {
      console.warn('Duplicate payment ids detected in PaymentsTab:', dupIds.map(id => ({ id, count: idCounts[id] })));
    }

    const unique = Array.from(new Map(filtered.map(p => [p.id ?? `${p.member}-${p.type}-${p.amount}`, p])).values());

    return [...unique].sort((a, b) => {
      let aVal = a[paymentSort.column];
      let bVal = b[paymentSort.column];

      // handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return paymentSort.order === 'asc' ? 1 : -1;
      if (bVal == null) return paymentSort.order === 'asc' ? -1 : 1;

      // numeric sort when both are numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return paymentSort.order === 'asc' ? (aVal - bVal) : (bVal - aVal);
      }

      // fallback to string comparison (alphabetical) using localeCompare
      const aStr = (aVal == null ? '' : String(aVal)).toLowerCase();
      const bStr = (bVal == null ? '' : String(bVal)).toLowerCase();
      const cmp = aStr.localeCompare(bStr, undefined, { sensitivity: 'base', numeric: false });
      return paymentSort.order === 'asc' ? cmp : -cmp;
    });
  };

  const handlePaymentSort = (column) => {
    setPaymentSort(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Payments & Fines</h2>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search (member, amount, type, status)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="add-btn" 
            onClick={handleSyncFines}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Check for New Fines'}
          </button>
        </div>
      </div>

      <PaymentFilter 
        paymentFilters={paymentFilters} 
        setPaymentFilters={setPaymentFilters} 
        onReset={() => { setPaymentSort({ column: 'member', order: 'asc' }); setVisibleCount(5); }}
      />

      <>
        <PaymentsTable 
          payments={getFilteredAndSortedPayments().slice(0, visibleCount)} 
          paymentSort={paymentSort} 
          handlePaymentSort={handlePaymentSort} 
        />
        {getFilteredAndSortedPayments().length > visibleCount && (
          <LoadMoreButton onClick={() => setVisibleCount(prev => Math.min(prev + 10, getFilteredAndSortedPayments().length))} />
        )}
      </>
    </div>
  );
};

export default PaymentsTab;