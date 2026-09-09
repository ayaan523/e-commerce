// src/components/GoogleLoginButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { apiUrl } from '../api';

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
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