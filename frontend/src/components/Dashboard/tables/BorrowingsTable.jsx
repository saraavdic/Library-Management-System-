import React from "react";
import '../../../styles/Dashboard.css';
import SortIcon from '../ui/SortIcon';

const BorrowingsTable = ({ borrowings, borrowSearch, borrowSort, handleBorrowSort, onReturnBorrowing }) => {
  const filteredBorrowings = borrowings.filter(b => {
    const q = borrowSearch.trim().toLowerCase();
    if (!q) return true;
    return b.member.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || (b.email || '').toLowerCase().includes(q);
  });

  return (
    <>
      <h3>Logged Borrowings</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleBorrowSort('member')}>
                User <SortIcon column="member" currentSort={borrowSort} />
              </th>
              <th className="sortable" onClick={() => handleBorrowSort('email')}>
                Email <SortIcon column="email" currentSort={borrowSort} />
              </th>
              <th className="sortable" onClick={() => handleBorrowSort('title')}>
                Book <SortIcon column="title" currentSort={borrowSort} />
              </th>
              <th className="sortable" onClick={() => handleBorrowSort('author')}>
                Author <SortIcon column="author" currentSort={borrowSort} />
              </th>
              <th className="sortable" onClick={() => handleBorrowSort('borrowDate')}>
                Borrow Date <SortIcon column="borrowDate" currentSort={borrowSort} />
              </th>
              <th className="sortable" onClick={() => handleBorrowSort('dueDate')}>
                Due Date <SortIcon column="dueDate" currentSort={borrowSort} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBorrowings.map((b, i) => (
              <tr key={b.id ?? `${b.userId || b.member}-${i}`}>
                <td>{b.member}</td>
                <td>{b.email}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.borrowDate || ''}</td>
                <td>{b.dueDate || ''}</td>
                <td>
                  <button className="delete-btn" onClick={() => onReturnBorrowing(b.id)}>Returned</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BorrowingsTable;