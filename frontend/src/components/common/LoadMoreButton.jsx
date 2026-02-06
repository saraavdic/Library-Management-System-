import React from 'react';

const LoadMoreButton = ({ onClick, disabled }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: 18 }}>
      <button className="load-more-btn" onClick={onClick} disabled={disabled}>
        Load more
      </button>
    </div>
  );
};

export default LoadMoreButton;
