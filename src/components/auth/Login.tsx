import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (email: string, password: string, role: string) => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    onLogin(email, password, role);
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .login-card {
            padding: 2rem !important;
            max-width: 100% !important;
          }
          .login-title {
            font-size: 1.75rem !important;
          }
          .login-subtitle {
            font-size: 1rem !important;
          }
        }
      `}</style>
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.loginCard}
          className="login-card"
        >
        <div style={styles.header}>
          <h1 style={styles.title} className="login-title">Welcome Back</h1>
          <p style={styles.subtitle} className="login-subtitle">Sign in to your ArtGallery.Pk account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <motion.button
            type="submit"
            style={styles.loginButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              style={styles.linkButton}
            >
              Sign Up
            </button>
          </p>
        </div>
        </motion.div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '2rem',
  },
  loginCard: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #d4af37, #ffd700, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
  },
  input: {
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  select: {
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  loginButton: {
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    fontSize: '1.125rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '1rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#d4af37',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'underline',
  },
};
