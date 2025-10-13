import React from 'react';

const DebugInfo = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  let parsedUserData = null;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (e) {
    // ignore
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-md">
      <div className="font-bold mb-2">Debug Info:</div>
      <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
      <div>Role: {parsedUserData?.role || 'Not set'}</div>
      <div>Email: {parsedUserData?.email || 'Not set'}</div>
      <div>Name: {parsedUserData?.name || 'Not set'}</div>
    </div>
  );
};

export default DebugInfo;
