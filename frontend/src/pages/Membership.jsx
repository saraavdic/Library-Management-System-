import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import Hero from "../components/common/Hero";
import "../styles/Membership.css";
import MembershipCard from '../components/Membership/MembershipCard';
import FinesSection from '../components/Membership/FinesSection';
import UniversalModal from '../components/Membership/UniversalModal';

export default function Membership() {
  const [fines, setFines] = useState([]);

  const [membershipInfo, setMembershipInfo] = useState({
    status: "Active",
    issued: "",
    expiry: "",
    daysLeft: 0,
    memberName: "",
    memberEmail: "",
    membershipId: null,
  });

  useEffect(() => {
    async function loadMembership() {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const userObj = JSON.parse(stored);
        const userId = userObj.user_id || userObj.userId || userObj.id;
        if (!userId) return;

        const base = 'http://localhost:8081';

        // Fetch user details and membership info
        const [userRes, membershipRes] = await Promise.all([
          fetch(`${base}/api/users/${userId}`),
          fetch(`${base}/api/membership/${userId}`)
        ]);

        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();

        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const membershipData = membershipRes.ok ? await membershipRes.json() : null;

        const formatDate = d => {
          if (!d) return 'N/A';
          const date = new Date(d);
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        // Use membership data if available, fall back to user data
        const startDate = membershipData?.start_date ? new Date(membershipData.start_date) : 
                         (user.created_at ? new Date(user.created_at) : new Date());
        const endDate = membershipData?.end_date ? new Date(membershipData.end_date) : 
                       (user.membership_end_date ? new Date(user.membership_end_date) : null);
        const status = membershipData?.status || (endDate && endDate >= new Date() ? 'active' : 'expired');
        const daysLeft = membershipData?.days_left || calculateDaysLeft(endDate);

        setMembershipInfo({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          issued: formatDate(startDate),
          expiry: formatDate(endDate),
          daysLeft,
          memberName: fullName || user.email,
          memberEmail: user.email,
          membershipId: userId,
        });

        // Fetch fines by user ID
        const finesRes = await fetch(`${base}/api/fines/user/${userId}`);
        if (finesRes.ok) {
          const finesData = await finesRes.json();
          // Only show unpaid fines in the outstanding fines section
          const unpaid = (finesData || []).filter(f => (f.status || '').toLowerCase() === 'not paid');
          setFines(unpaid);
        }
      } catch (err) {
        console.error('Load membership error:', err);
      }
    }

    loadMembership();
  }, []);

  const [modalState, setModalState] = useState({
    type: null, // 'pay', 'extend-payment', or 'extend-options'
    isOpen: false,
    extensionYears: 1,
  });

  const totalFines = fines.reduce((sum, fine) => {
    const amt = typeof fine.amount === 'string' ? parseFloat(fine.amount.replace(/[^0-9.]/g, '')) : Number(fine.amount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  // Backend `fines` uses `status` = 'paid' | 'not paid'
  const hasPendingFines = fines.some(f => (f.status || '').toLowerCase() === 'not paid');
  const canExtendMembership = membershipInfo.daysLeft <= 30; // Can only extend with 30 days or less

  const openModal = (type, extensionYears = 1) => {
    setModalState({ type, isOpen: true, extensionYears });
  };

  const closeModal = () => {
    setModalState({ type: null, isOpen: false, extensionYears: 1 });
  };

  const handlePayFines = async (paymentMethod) => {
    try {
      const base = 'http://localhost:8081';

      // Mark each unpaid fine as paid in the database
      for (const fine of fines) {
        const response = await fetch(`${base}/api/fines/${fine.id}/pay`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid_date: new Date().toISOString() }),
        });
        if (!response.ok) throw new Error(`Failed to mark fine ${fine.id} as paid`);
      }

      setFines([]);
      alert(
        `Payment of $${totalFines.toFixed(
          2
        )} processed successfully via ${paymentMethod}!`
      );
      closeModal();
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error("Payment error:", error);
    }
  };

  const handleExtensionPayment = async (paymentMethod, extensionYears) => {
    try {
      const base = 'http://localhost:8081';
      
      // Determine which endpoint to use based on membership status
      let endpoint = `/api/membership/${membershipInfo.membershipId}/extend`;
      if (membershipInfo.status.toLowerCase() === 'expired') {
        endpoint = `/api/membership/${membershipInfo.membershipId}/pay`;
      }

      const resp = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ years: extensionYears }),
      });

      if (!resp.ok) throw new Error('Failed to process membership payment');

      const result = await resp.json();

      // Update frontend state from returned data
      const formatDate = d => {
        if (!d) return 'N/A';
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      };

      const newEndDate = result.membership?.end_date ? new Date(result.membership.end_date) : null;
      const newDaysLeft = newEndDate ? calculateDaysLeft(newEndDate) : 0;
      const newStatus = result.membership?.status || 'active';

      setMembershipInfo((prev) => ({
        ...prev,
        expiry: formatDate(newEndDate),
        daysLeft: newDaysLeft,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      }));

      // Close modal silently on success
      closeModal();
    } catch (error) {
      console.error("Extension error:", error);
      alert("Payment processing failed. Please try again.");
    }
  };

  const calculateNewExpiryDate = (years) => {
    const currentDate = new Date(membershipInfo.expiry);
    currentDate.setFullYear(currentDate.getFullYear() + years);
    return currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExtensionPrice = (years) => {
    // Only 1-year extensions are supported; use a single fixed price
    return 20;
  };

  return (
    <div className="membership-container">
      <Navbar />
      <main className="membership-main">
        {/* Hero Section */}
        <Hero title="Membership Management" subtitle="Manage your membership, view fines, and extend your subscription" />

        {/* Membership Status Section */}
        <section className="membership-section">
          <div className="section-header">
            <h2>Your Membership</h2>
            <p className="section-subtitle">Current membership details</p>
          </div>
          <MembershipCard
            membershipInfo={membershipInfo}
            hasPendingFines={hasPendingFines}
            canExtendMembership={canExtendMembership}
            openModal={openModal}
          />
        </section>

        {/* Fines Section */}
        <section className="membership-section">
          <div className="section-header">
            <h2>Outstanding Fines</h2>
            <p className="section-subtitle">
              {fines.length} fine(s) pending payment
            </p>
          </div>
          {fines.length > 0 ? (
            <FinesSection fines={fines} totalFines={totalFines} openModal={openModal} />
          ) : (
            <div className="no-fines">
              <p>No outstanding fines. Great job!</p>
            </div>
          )}
          {/* Universal Modal */}
          <UniversalModal
            modalState={modalState}
            closeModal={closeModal}
            totalFines={totalFines}
            getExtensionPrice={getExtensionPrice}
            calculateNewExpiryDate={calculateNewExpiryDate}
            handlePayFines={handlePayFines}
            handleExtensionPayment={handleExtensionPayment}
            openModal={openModal}
          />
        </section>
      </main>
    </div>
  );
}
