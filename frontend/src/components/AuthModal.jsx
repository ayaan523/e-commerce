// src/components/AuthModal.jsx
import { useState } from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import { apiUrl } from '../api';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering ? { email, password, street: address, city, country } : { email, password };

    try {
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      alert(`Authentication error: ${err.message}`);
    }
  };

  const inputStyle = {
    width: '100%', background: '#121212', border: '1px solid #222', color: '#fff', padding: '12px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', borderRadius: '6px'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '420px', background: '#0c0c0c', border: '1px solid #222', padding: '40px', color: '#fff', borderRadius: '16px', boxSizing: 'border-box' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}>CLOSE [✕]</button>

        <h2 style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '12px', marginTop: 0 }}>
          {isRegistering ? 'Client Registration' : 'Client Authentication'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />

          {isRegistering && (
            <>
              <input type="text" placeholder="Default Street Address" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} style={inputStyle} />
              </div>
            </>
          )}

          <button type="submit" style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '14px', fontSize: '10px', letterSpacing: '2px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase', borderRadius: '8px', marginTop: '10px' }}>
            {isRegistering ? 'Create Profile' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#444' }}>
          <div style={{ flex: 1, height: '1px', background: '#222' }} />
          <span style={{ padding: '0 10px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#222' }} />
        </div>

        <GoogleLoginButton onLoginSuccess={(user) => { onLoginSuccess(user); onClose(); }} />

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#777', marginTop: '24px', cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register profile"}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;