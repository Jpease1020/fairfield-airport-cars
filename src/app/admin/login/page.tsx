'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      router.push('/admin');
    } catch (error) {
      setError(`Failed to log in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      router.push('/admin');
    } catch (error) {
      setError(`Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="">
        <div className="card login-card">
          <div className="card-header">
            <h1 className="card-title">Admin Login</h1>
            <p className="card-description">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="admin@fairfieldairportcars.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="alert-item error">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <p className="alert-message">{error}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="login-actions">
              <Button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? '🔄 Signing In...' : '🔐 Sign In'}
              </Button>
              
              <div className="login-divider">
                <span>or</span>
              </div>
              
              <Button 
                type="button"
                variant="secondary"
                className="login-btn google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? '🔄 Connecting...' : '🔍 Sign In with Google'}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="login-footer">
          <p>Need help? Contact support at <a href="mailto:support@fairfieldairportcars.com">support@fairfieldairportcars.com</a></p>
        </div>
      </div>
    </div>
  );
}
