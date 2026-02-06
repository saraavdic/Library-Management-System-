import React, { useEffect, useRef } from "react";
import '../../../styles/Dashboard.css';

const MemberFilter = ({ 
  members, 
  memberFilters, 
  setMemberFilters, 
  showYearDropdown, 
  setShowYearDropdown,
  showStatusDropdown,
  setShowStatusDropdown,
  onReset
}) => {
  const yearRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (yearRef.current && !yearRef.current.contains(e.target)) setShowYearDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusDropdown(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [setShowYearDropdown, setShowStatusDropdown]);

  const getUniqueYears = () => {
    const years = members.map(m => {
      try {
        if (!m.joinDate) return null;
        const d = new Date(m.joinDate);
        if (isNaN(d.getTime())) return null;
        return d.getFullYear();
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const handleYearFilter = (year) => {
    setMemberFilters(prev => ({
      ...prev,
      years: prev.years.includes(year) ? prev.years.filter(y => y !== year) : [...prev.years, year]
    }));
  };

  const handleStatusFilter = (status) => {
    setMemberFilters(prev => {
      if (status === 'all') return { ...prev, statuses: ['active', 'inactive'] };
      const next = prev.statuses.includes(status) ? prev.statuses.filter(s => s !== status) : [...prev.statuses, status];
      return { ...prev, statuses: next.length ? next : prev.statuses };
    });
  };

  return (
    <div className="filters-bar">
      <div className="filter-group" ref={yearRef}>
        <label className="filter-label">Join Year</label>
        <div className="dropdown-trigger">
          <button 
            className={`year-btn ${memberFilters.years.length ? 'active' : ''}`} 
            onClick={(e) => { e.stopPropagation(); setShowYearDropdown(s => !s); }}
          >
            {memberFilters.years.length ? `${memberFilters.years.join(', ')}` : 'Select years'}
          </button>
          {showYearDropdown && (
            <div className="dropdown-menu">
              {getUniqueYears().map(year => (
                <label key={year} className="dropdown-item">
                  <input 
                    type="checkbox" 
                    checked={memberFilters.years.includes(year)} 
                    onChange={() => handleYearFilter(year)} 
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filter-group" ref={statusRef}>
        <label className="filter-label">Status</label>
        <div className="dropdown-trigger">
          <button 
            className="status-btn" 
            onClick={(e) => { e.stopPropagation(); setShowStatusDropdown(s => !s); }}
          >
            {memberFilters.statuses.length === 2 ? 'Active & Inactive' : memberFilters.statuses[0]}
          </button>
          {showStatusDropdown && (
            <div className="dropdown-menu">
              <label className="dropdown-item">
                <input 
                  type="checkbox" 
                  checked={memberFilters.statuses.includes('active')} 
                  onChange={() => handleStatusFilter('active')} 
                />
                <span>Active</span>
              </label>
              <label className="dropdown-item">
                <input 
                  type="checkbox" 
                  checked={memberFilters.statuses.includes('inactive')} 
                  onChange={() => handleStatusFilter('inactive')} 
                />
                <span>Inactive</span>
              </label>
              <button 
                className="dropdown-reset" 
                onClick={() => setMemberFilters({ years: [], statuses: ['active', 'inactive'] })}
              >
                All
              </button>
            </div>
          )}
        </div>
      </div>

      <button 
        className="clear-filters-btn" 
        onClick={() => { setMemberFilters({ years: [], statuses: ['active', 'inactive'] }); if (typeof onReset === 'function') onReset(); }}
      >
        Reset
      </button>
    </div>
  );
};

export default MemberFilter;