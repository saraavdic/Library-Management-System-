import React from 'react';
import ErrorLayout from '../components/common/ErrorLayout';

export default function Error403() {
  return (
    <ErrorLayout
      code="403"
      title="Access Denied"
      message={"You don’t have permission to view this page. If this seems wrong, please contact an administrator."}
      primaryText="Go to homepage"
    />
  );
}
