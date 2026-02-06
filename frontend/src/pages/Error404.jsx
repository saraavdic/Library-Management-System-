import React from 'react';
import ErrorLayout from '../components/common/ErrorLayout';

export default function Error404() {
  return (
    <ErrorLayout
      code="404"
      title="Page Not Found"
      message={"We couldn’t find the page you’re looking for. It might have been moved or deleted."}
    />
  );
}
