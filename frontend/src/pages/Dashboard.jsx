import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import MembersTab from '../components/Dashboard/tabs/MembersTab';
import BooksTab from '../components/Dashboard/tabs/BooksTab';
import PaymentsTab from '../components/Dashboard/tabs/PaymentsTab';
import BorrowingsTab from '../components/Dashboard/tabs/BorrowingsTab';
import AnnouncementsTab from '../components/Dashboard/tabs/AnnouncementsTab';
import MessagesTab from '../components/Dashboard/tabs/MessagesTab';
import Hero from '../components/common/Hero';
import '../styles/Dashboard.css';



// payments will be loaded from backend fines

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [borrowSearch, setBorrowSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const mRes = await fetch('http://localhost:8081/api/members');
        const bRes = await fetch('http://localhost:8081/api/catalogue/books');
        const brRes = await fetch('http://localhost:8081/api/borrow-records');
        const fRes = await fetch('http://localhost:8081/api/fines');

        // helper to detect admin-like accounts
        const isAdminName = (name) => {
          if (!name) return false;
          const n = name.toString().trim().toLowerCase();
          return /^admin\b/.test(n) || n === 'admin admin';
        };
        
        if (mRes.ok) {
          const mData = await mRes.json();
          if (mounted) {
            // Support both legacy `id/name` and new `user_id/first_name,last_name` shapes
            const validMembers = mData.filter(m => {
              const id = m.user_id || m.id;
              const hasName = (m.first_name && m.last_name) || m.name;
              const nameStr = m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim();
              return id && hasName && m.email && !isAdminName(nameStr);
            }).map(m => {
              const id = m.user_id || m.id;
              const name = m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim();
              return {
                id,
                name,
                email: m.email,
                joinDate: m.joinDate ? (m.joinDate.split ? m.joinDate.split('T')[0] : m.joinDate) : '',
                status: m.status || 'active'
              };
            });
            setMembers(validMembers);
          }
        }
        if (bRes.ok) {
          const bData = await bRes.json();
          if (mounted) setBooks(bData.map(b => ({ id: b.id, title: b.title, author: b.author, genre: b.genre || b.category_name, copies: b.total_copies || 1, available: b.total_copies || 1 })));
        }
        if (brRes.ok) {
          const brData = await brRes.json();
          if (mounted) {
            const mapped = brData.map(r => ({
              id: r.borrow_id || r.id,
              userId: r.user_id,
              member: r.member_name || `${r.first_name} ${r.last_name}` || r.name,
              email: r.email,
              title: r.book_title || r.title,
              author: r.author,
              // ensure dates are YYYY-MM-DD strings (strip time if present)
              borrowDate: r.borrow_date && r.borrow_date.split ? r.borrow_date.split('T')[0] : r.borrow_date,
              dueDate: r.due_date && r.due_date.split ? r.due_date.split('T')[0] : r.due_date,
              returnDate: r.return_date && r.return_date.split ? r.return_date.split('T')[0] : r.return_date,
              status: r.status
            }));
            // only records that are not returned (borrowed or overdue) and exclude admin accounts
            setBorrowings(mapped.filter(b => b.status !== 'returned' && !isAdminName(b.member)));
          }
        }
        if (fRes.ok) {
          const fData = await fRes.json();
          if (mounted) setPayments(fData.filter(f => !isAdminName(f.member_name)).map((f, idx) => ({ id: f.id ?? `${f.member_name}-${f.type}-${f.amount}-${idx}`, member: f.member_name, amount: parseFloat(f.amount) || 0, type: f.type, dueDate: new Date().toISOString().split('T')[0], status: f.status === 'paid' ? 'paid' : 'pending' })));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard-main">
        <Hero title="Admin Dashboard" subtitle="Manage library operations, members, books, and payments" />

        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => { setActiveTab('members'); setSearchQuery(''); }}>
            Members
          </button>
          <button className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`} onClick={() => { setActiveTab('books'); setSearchQuery(''); }}>
            Books
          </button>
          <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}>
            Payments & Fines
          </button>
          <button className={`tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`} onClick={() => { setActiveTab('borrowings'); setBorrowSearch(''); }}>
            Borrowings
          </button>
          <button className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
            Announcements
          </button>
          <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            Messages
          </button>
        </div>

        {/* Members Tab Component */}
        {activeTab === 'members' && (
          <MembersTab members={members} setMembers={setMembers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {/* Books Tab Component */}
        {activeTab === 'books' && (
          <BooksTab books={books} setBooks={setBooks} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {/* Payments Tab Component */}
        {activeTab === 'payments' && (
          <PaymentsTab payments={payments} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {/* Borrowings Tab Component */}
        {activeTab === 'borrowings' && (
          <BorrowingsTab members={members} books={books} setBooks={setBooks} borrowings={borrowings} setBorrowings={setBorrowings} borrowSearch={borrowSearch} setBorrowSearch={setBorrowSearch} />
        )}

        {/* Announcements Tab Component */}
        {activeTab === 'announcements' && (
          <AnnouncementsTab />
        )}

        {/* Messages Tab Component */}
        {activeTab === 'messages' && (
          <MessagesTab />
        )}
      </main>
    </div>
  );
}