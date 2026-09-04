// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import '../App.css';

const AdminLogin = ({ onLogin }) => {
  const [passcode, setPasscode] = useState('');
  const ADMIN_PIN = "7942";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PIN) {
      onLogin();
    } else {
      alert("Invalid Atelier Passcode");
      setPasscode('');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: '#0a0a0a', border: '1px solid #222', width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center', color: '#fff' }}>
        
        <h2 style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: '400', marginBottom: '10px' }}>
          ATELIER CONTROL PORTAL
        </h2>
        <p style={{ color: '#888', fontSize: '12px', letterSpacing: '1px', marginBottom: '30px', textTransform: 'uppercase' }}>
          Restricted Access — Enter Administrator Passcode
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="password" 
            placeholder="••••" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
            style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 20px', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', width: '200px', marginBottom: '20px', outline: 'none' }}
          />
          <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer', fontWeight: '600' }}>
            AUTHENTICATE
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;