// src/components/AdminLogin.jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../App.css';
import { apiUrl } from '../api';

const AdminLogin = ({ onLogin }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(apiUrl('/api/admin/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      onLogin(data.token);
    } catch (error) {
      alert(error.message || 'Unauthorized Google Account');
    }
  };

  // Hardcoded directly inside the component
  const clientId = "242359357860-5u53u8ldlkmld1hh4q5vsr8sur7unkqt.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid #222', width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          
          <h2 style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: '400', marginBottom: '10px' }}>
            ATELIER CONTROL PORTAL
          </h2>
          <p style={{ color: '#888', fontSize: '12px', letterSpacing: '1px', marginBottom: '30px', textTransform: 'uppercase' }}>
            Restricted Access — Authenticate via Google
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => alert('Google Sign-In Failed')}
              theme="filled_black"
              text="continue_with"
              shape="rectangular"
            />
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AdminLogin;