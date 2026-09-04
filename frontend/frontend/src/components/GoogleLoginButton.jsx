// src/components/GoogleLoginButton.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onLoginSuccess(data.user);
    } catch (err) {
      alert(`Google sign-in error: ${err.message}`);
    }
  };

  return (
    <div style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Google Authentication Failed')}
        theme="filled_black"
        shape="pill"
        size="large"
        width="340"
      />
    </div>
  );
};

export default GoogleLoginButton;