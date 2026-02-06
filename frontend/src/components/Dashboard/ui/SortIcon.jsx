import React from "react";
import '../../../styles/Dashboard.css';

const SortIcon = ({ column, currentSort }) => {
  if (!currentSort || currentSort.column !== column) return <span className="sort-icon">⇅</span>;
  return <span className="sort-icon">{currentSort.order === 'asc' ? '↑' : '↓'}</span>;
};

export default SortIcon;