import React from 'react';

export default function MembershipCard({ membershipInfo, hasPendingFines, canExtendMembership, openModal }) {
  return (
    <div className="membership-card">
      <div className="membership-header">
        <div className="member-info">
          <h3>{membershipInfo.memberName}</h3>
          <p className="member-email">{membershipInfo.memberEmail}</p>
        </div>
        <div className={`status-badge ${membershipInfo.status && membershipInfo.status.toLowerCase()}`}>
          {membershipInfo.status || 'Unknown'}
        </div>
      </div>

      <div className="membership-details">
        <div className="detail-item">
          <span className="label">Issued Date</span>
          <span className="value">{membershipInfo.issued}</span>
        </div>
        <div className="detail-item">
          <span className="label">Expiry Date</span>
          <span className="value expiry">{membershipInfo.expiry}</span>
        </div>
        <div className="detail-item">
          <span className="label">Days Remaining</span>
          <span className="value days-remaining">{membershipInfo.daysLeft} days</span>
        </div>
      </div>

      <div className="membership-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(1 - membershipInfo.daysLeft / 365) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">Expires in {membershipInfo.daysLeft} day(s)</p>
      </div>

      <button
        className={`extend-btn ${hasPendingFines || !canExtendMembership ? 'disabled' : ''}`}
        onClick={() => openModal('extend-options')}
        disabled={hasPendingFines || !canExtendMembership}
        title={
          hasPendingFines
            ? 'Please pay all fines before extending membership'
            : !canExtendMembership
            ? 'You can only extend membership when 30 days or less remain'
            : 'Extend your membership'
        }
      >
        Extend Membership
      </button>
      {hasPendingFines && (
        <p className="warning-text">⚠️ Please pay outstanding fines before extending membership</p>
      )}
      {!hasPendingFines && !canExtendMembership && (
        <p className="warning-text">⚠️ You can extend membership when 30 days or less remain</p>
      )}
    </div>
  );
}
