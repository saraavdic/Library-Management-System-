import React, { useState, useEffect } from "react";
import MembersTable from '../tables/MembersTable';
import MemberFilter from '../filters/MemberFilter';
import AddMemberModal from '../modals/AddMemberModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import Modal from '../../common/Modal';
import LoadMoreButton from '../../common/LoadMoreButton';
import '../../../styles/Dashboard.css';

const MembersTab = ({ members, setMembers, searchQuery, setSearchQuery }) => {
  const [formData, setFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [membersWithMembership, setMembersWithMembership] = useState([]);

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationLink, setActivationLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [memberFilters, setMemberFilters] = useState({ years: [], statuses: ['active', 'inactive'] });
  const [memberSort, setMemberSort] = useState({ column: 'name', order: 'asc' });

  // paging for table
  const [visibleCount, setVisibleCount] = useState(5);

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Enrich members with membership data
  useEffect(() => {
    async function enrichMembers() {
      try {
        const enriched = await Promise.all(
          members.map(async (member) => {
            try {
              const res = await fetch(`http://localhost:8081/api/membership/${member.id}`);
              if (res.ok) {
                const membership = await res.json();
                return {
                  ...member,
                  joinDate: membership.start_date ? membership.start_date.split('T')[0] : member.joinDate
                };
              }
            } catch (err) {
              console.error(`Failed to fetch membership for user ${member.id}:`, err);
            }
            return member;
          })
        );
        setMembersWithMembership(enriched);
      } catch (err) {
        console.error('Failed to enrich members:', err);
        setMembersWithMembership(members);
      }
    }

    if (members.length > 0) {
      enrichMembers();
    } else {
      setMembersWithMembership([]);
    }
  }, [members]);

  const getFilteredAndSortedMembers = () => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = membersWithMembership.filter(m => {
      const year = new Date(m.joinDate).getFullYear();
      const yearMatch = memberFilters.years.length === 0 || memberFilters.years.includes(year);
      const statusMatch = memberFilters.statuses.includes(m.status);
      const searchMatch = q === '' || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return yearMatch && statusMatch && searchMatch;
    });

    return [...filtered].sort((a, b) => {
      let aVal = a[memberSort.column];
      let bVal = b[memberSort.column];
      if (memberSort.column === 'joinDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return memberSort.order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  // reset visible count when filters/search/sort or members change
  useEffect(() => {
    setVisibleCount(5);
  }, [searchQuery, memberFilters, memberSort, membersWithMembership]);

  const handleAddMember = async () => {
    const first_name = (formData.first_name || '').trim();
    const last_name = (formData.last_name || '').trim();
    const email = (formData.email || '').trim();
    if (!first_name || !last_name || !email) {
      alert('Please provide first name, last name and email.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Call backend admin endpoint
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ first_name, last_name, email })
      });
      const body = await res.json();
      if (!res.ok) {
        alert(body.error || 'Failed to add member');
        return;
      }

      
      if (body.activationLink) {
        setActivationLink(body.activationLink);
        setShowActivationModal(true);
      } else {
        alert('Invitation sent successfully');
      }

      // Optionally refresh members list from server if needed
      setFormData({});
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to invite member', err);
      alert('Failed to invite member');
    }
  };

  const copyActivationLink = async () => {
    try {
      await navigator.clipboard.writeText(activationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const el = document.getElementById('activation-link-input');
      if (el) {
        el.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('Failed to copy activation link', err);
      }
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      const res = await fetch(`http://localhost:8081/api/members/${id}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const error = await res.json();
        alert(`Cannot deactivate: ${error.error}`);
        return;
      }
      // Update member status to inactive instead of removing
      setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'inactive' } : m));
    } catch (err) {
      console.error('Failed to deactivate member', err);
      alert('Failed to deactivate member');
    }
  };

  const handleMemberSort = (column) => {
    setMemberSort(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <>
      <div className="tab-content">
        <div className="content-header">
          <h2>Member Management</h2>
          <div className="header-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search table (name or email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="add-btn" onClick={() => { setFormData({}); setShowAddModal(true); }}>
              Add Member
            </button>
          </div>
        </div>

        <MemberFilter 
          members={membersWithMembership}
          memberFilters={memberFilters}
          setMemberFilters={setMemberFilters}
          showYearDropdown={showYearDropdown}
          setShowYearDropdown={setShowYearDropdown}
          showStatusDropdown={showStatusDropdown}
          setShowStatusDropdown={setShowStatusDropdown}
          onReset={() => { setMemberSort({ column: 'name', order: 'asc' }); setVisibleCount(5); }}
        />

        <>
          <MembersTable 
            members={getFilteredAndSortedMembers().slice(0, visibleCount)} 
            memberSort={memberSort} 
            handleMemberSort={handleMemberSort}
            onDeleteMember={handleDeleteMember}
          />
          {getFilteredAndSortedMembers().length > visibleCount && (
            <LoadMoreButton onClick={() => setVisibleCount(prev => Math.min(prev + 10, getFilteredAndSortedMembers().length))} />
          )}
        </>
      </div>

      <Modal
        isOpen={showActivationModal}
        onClose={() => { setShowActivationModal(false); setActivationLink(''); setCopied(false); }}
        title="Invitation Sent"
        size="sm"
        actions={
          <>
            <button className="btn" onClick={() => { copyActivationLink(); }}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowActivationModal(false); setActivationLink(''); setCopied(false); }}>
              Close
            </button>
          </>
        }
      >
        <p>Activation link:</p>
        <input
          id="activation-link-input"
          type="text"
          readOnly
          value={activationLink}
          onFocus={(e) => e.target.select()}
          style={{ width: '100%' }}
        />
      </Modal>

      <AddMemberModal
        showAddModal={showAddModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />
    </>
  );
};

export default MembersTab;