import React from 'react';
import ErrorLayout from '../components/common/ErrorLayout';

export default function Error500() {
  return (
    <ErrorLayout
      code="500"
      title="Server Error"
      message={"Oops — something went wrong on our side. We’ve been notified and are looking into it."}
      primaryText="Try homepage"
    />
  );
}
