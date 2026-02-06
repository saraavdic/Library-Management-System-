import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import Hero from "../components/common/Hero";
import "../styles/Status.css";
import BorrowedBookCard from '../components/Status/BorrowedBookCard';
import FineCard from '../components/Status/FineCard';
import HistoryCard from '../components/Status/HistoryCard';



export default function Status() {
  const [borrowed, setBorrowed] = useState([]);
  const [fines, setFines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setBorrowed([]);
          setFines([]);
          setHistory([]);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user.user_id;

        if (!userId) {
          setBorrowed([]);
          setFines([]);
          setHistory([]);
          setLoading(false);
          return;
        }

        // Fetch user details to get full name
        const userRes = await fetch(`http://localhost:8081/api/users/${userId}`);
        let fullName = '';
        if (userRes.ok) {
          const userDetails = await userRes.json();
          fullName = `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim();
        }

        // Fetch borrowed records for the user
        const borrowResponse = await fetch(`http://localhost:8081/api/borrow-records/user/${userId}`);
        if (borrowResponse.ok) {
          const records = await borrowResponse.json();

          // Filter for borrowed or overdue status and transform data
          const transformedBooks = records
            .filter(record => record.status === 'borrowed' || record.status === 'overdue')
            .map(record => {
              const borrowDate = new Date(record.borrow_date);
              const dueDate = new Date(record.due_date);
              const today = new Date();

              // Calculate days left
              const millisecondsPerDay = 24 * 60 * 60 * 1000;
              const daysLeft = Math.ceil((dueDate - today) / millisecondsPerDay);

              // Format due date
              const formattedDue = dueDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });

              // Determine if overdue
              const isOverdue = record.status === 'overdue' || daysLeft < 0;

              return {
                id: record.borrow_id,
                title: record.book_title,
                author: record.author || 'Unknown Author',
                due: formattedDue,
                daysLeft: isOverdue ? 0 : Math.max(daysLeft, 0),
                status: isOverdue ? 'Overdue' : 'Borrowed',
                isOverdue: isOverdue,
              };
            });

          setBorrowed(transformedBooks);
        } else {
          setBorrowed([]);
        }

        // Fetch fines for the user by user ID
        const finesResponse = await fetch(`http://localhost:8081/api/fines/user/${userId}`);
        if (finesResponse.ok) {
          const finesData = await finesResponse.json();
          
          // Transform fines data - filter for unpaid fines only
          const transformedFines = finesData
            .filter(fine => fine.status === 'not paid')
            .map(fine => {
              const amount = parseFloat(fine.amount || 5.00).toFixed(2);
              return {
                id: fine.id,
                amount: `$${amount}`,
                type: fine.type || 'fine',
                status: fine.status,
                reason: fine.book_title || 'Overdue book',
                book_title: fine.book_title,
                user_id: fine.user_id,
                book_id: fine.book_id,
              };
            });

          setFines(transformedFines);
        } else {
          setFines([]);
        }

        // Fetch returned books for history
        const borrowResponse2 = await fetch(`http://localhost:8081/api/borrow-records/user/${userId}`);
        if (borrowResponse2.ok) {
          const allRecords = await borrowResponse2.json();

          // Filter for returned books only (status = 'returned')
          const returnedBooks = allRecords
            .filter(record => record.status === 'returned')
            .map(record => {
              const returnDate = new Date(record.return_date);
              const formattedReturn = returnDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });

              return {
                id: record.borrow_id,
                title: record.book_title,
                author: record.author || 'Unknown Author',
                returned: formattedReturn,
              };
            });

          setHistory(returnedBooks);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setBorrowed([]);
        setFines([]);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="status-container">
      <Navbar />

      <main className="status-main">

 <Hero title="Library Account Status" subtitle="Check your borrowed books, fines, reservations, and history" />
        {/* Borrowed Books */}
        <section className="status-section">
          <h2>Borrowed Books</h2>
          {!loading && (
            <div className="status-grid">
              {borrowed.length === 0 ? (
                <p className="empty-text">You have no borrowed books.</p>
              ) : (
                borrowed.map((book) => (
                  <BorrowedBookCard key={book.id} book={book} />
                ))
              )}
            </div>
          )}
        </section>

        {/* Fines */}
        <section className="status-section">
          <h2>Outstanding Fines</h2>
          {!loading && (
            <div className="status-grid">
              {fines.length === 0 ? (
                <p className="empty-text">You have no outstanding fines.</p>
              ) : (
                fines.map((fine) => (
                  <FineCard key={fine.id} fine={fine} />
                ))
              )}
            </div>
          )}
        </section>



        {/* Borrowing History */}
        <section className="status-section">
          <h2>Borrowing History</h2>
          {!loading && (
            <div className="status-grid">
              {history.length === 0 ? (
                <p className="empty-text">You have no borrowing history.</p>
              ) : (
                history.map((h) => (
                  <HistoryCard key={h.id} entry={h} />
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}