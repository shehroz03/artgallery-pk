import { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';

interface BuyerAuthProps {
  onAuthSuccess: (user: { uid: string; email: string; name: string; role: string }) => void;
  onSwitchRole: () => void;
  onSwitchToSignup?: () => void;
}

export function BuyerLogin({ onAuthSuccess, onSwitchRole, onSwitchToSignup }: BuyerAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.signIn(email, password, 'buyer');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'buyer');
      localStorage.setItem('currentUser', JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await authService.signInWithGoogle('buyer');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'buyer');
      localStorage.setItem('currentUser', JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @media (max-width: 768px) {
            .auth-card {
              width: 95% !important;
              padding: 2rem 1.5rem !important;
            }
            
            .auth-title {
              font-size: 1.75rem !important;
            }
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
        className="auth-card"
      >
        <div style={styles.header}>
          <div style={styles.roleBadge}>🎨 Buyer</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to browse and shop artworks</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.passwordInput}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div style={styles.divider}>OR</div>

        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            ...styles.googleButton,
            opacity: loading ? 0.6 : 1,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign in with Google
        </motion.button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            {onSwitchToSignup && (
              <motion.button
                onClick={onSwitchToSignup}
                style={styles.link}
                whileHover={{ scale: 1.05 }}
              >
                Sign up
              </motion.button>
            )}
          </p>
          <motion.button
            onClick={onSwitchRole}
            style={styles.switchButton}
            whileHover={{ scale: 1.05 }}
          >
            Switch Role
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  card: {
    background: 'rgba(26, 26, 46, 0.95)',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '1rem',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  roleBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    marginTop: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#fff',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    padding: '0.75rem',
    paddingRight: '3rem',
    borderRadius: '0.5rem',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.75rem',
  },
  googleButton: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '2px solid #fff',
    background: 'transparent',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center',
    margin: '1.5rem 0',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
  },
  error: {
    background: 'rgba(255, 107, 107, 0.2)',
    border: '2px solid #ff6b6b',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    margin: '0 0 0.75rem 0',
  },
  link: {
    color: '#667eea',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#d4af37',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'underline',
  },
};
