import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request reset, 2: Reset with token
  const [devTokenMessage, setDevTokenMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestToken = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setDevTokenMessage('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      alert("Reset code requested!");
      setStep(2);
      if (res.data.devToken) {
        setDevTokenMessage(`[Simulator] Your Reset Code is: ${res.data.devToken}`);
        setToken(res.data.devToken); // Autofill for convenience
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Email address not found. Please verify your email.";
      alert(`Request failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      alert("All fields are required!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email,
        token,
        newPassword
      });
      alert("Your password has been successfully reset! Please log in.");
      window.location.href = '/login';
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid or expired reset code.";
      alert(`Reset failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div className="dynamic-bg"></div>

      {/* Header */}
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--fq-gold)', borderRadius: '2px' }}></div>
          <span style={{ fontWeight: '700', fontSize: '28px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px' }}>
        <div className="fq-card animate-up" style={{ width: '420px', padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
            {step === 1 ? "Enter your email to request a security reset code" : "Verify code and create your new secure password"}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {step === 1 ? (
              <>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }}
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleRequestToken}
                  className="btn-fq btn-fq-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                  disabled={isLoading}
                >
                  {isLoading ? "Requesting..." : "Request Reset Code"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>RESET CODE</label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>NEW PASSWORD (MIN. 8 CHARS)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Create new password"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }}
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  className="btn-fq btn-fq-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>

                {devTokenMessage && (
                  <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(0, 200, 83, 0.1)', color: 'var(--success)', borderRadius: '4px', textAlign: 'center', fontSize: '13px', border: '1px solid var(--success)', fontWeight: '600' }}>
                    {devTokenMessage}
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => { setStep(1); setToken(''); setDevTokenMessage(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--fq-gold)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', marginTop: '10px' }}
            >
              {step === 2 ? "← Back to Email entry" : ""}
            </button>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remember your credentials? </span>
            <a href="/login" style={{ color: 'var(--fq-gold)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
};
