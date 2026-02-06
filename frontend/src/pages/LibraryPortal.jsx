import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from "../components/common/Hero";
import AnnouncementsSectionPortal from '../components/LibraryPortal/AnnouncementsSectionPortal';
import BorrowedBooksSectionPortal from '../components/LibraryPortal/BorrowedBooksSectionPortal';
import '../styles/LibraryPortal.css';

export default function LibraryPortal() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        setLoading(true);
        
        // Get userId from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setBorrowedBooks([]);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user.user_id;

        if (!userId) {
          setBorrowedBooks([]);
          setLoading(false);
          return;
        }

        // Fetch borrowed records for the user
        const response = await fetch(`http://localhost:8081/api/borrow-records/user/${userId}`);
        if (!response.ok) {
          console.error('Failed to fetch borrowed books');
          setBorrowedBooks([]);
          setLoading(false);
          return;
        }

        const records = await response.json();
        console.log('Fetched borrow records:', records);

        // Filter for borrowed or overdue status and transform data
        const transformedBooks = records
          .filter(record => record.status === 'borrowed' || record.status === 'overdue')
          .map(record => {
            console.log('Processing record:', record);
            const borrowDate = new Date(record.borrow_date);
            const dueDate = new Date(record.due_date);
            const today = new Date();

            // Calculate days left
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const daysLeft = Math.ceil((dueDate - today) / millisecondsPerDay);

            // Calculate progress (0-100%)
            const totalDays = Math.ceil((dueDate - borrowDate) / millisecondsPerDay);
            const daysElapsed = Math.ceil((today - borrowDate) / millisecondsPerDay);
            const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

            // Format due date
            const formattedDue = dueDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });

            return {
              id: record.borrow_id,
              title: record.book_title,
              author: record.author || 'Unknown Author',
              due: formattedDue,
              daysLeft: Math.max(daysLeft, 0),
              progress: Math.round(progress),
              cover: record.cover_image_url || '/Media/placeholder.jpg',
            };
          });

        setBorrowedBooks(transformedBooks);
      } catch (err) {
        console.error('Error fetching borrowed books:', err);
        setBorrowedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  return (
    <div className="portal-container">
      <Navbar />
      <main className="portal-main">
        {/* Hero Section */}
        <Hero title="Welcome to Your Library Portal" subtitle="Manage your borrowed books and stay updated with library announcements" />
        

        {/* Announcements Section */}
        <AnnouncementsSectionPortal />

        {/* Borrowed Books Section */}
        {!loading && <BorrowedBooksSectionPortal books={borrowedBooks} />}
      </main>
    </div>
  );
}