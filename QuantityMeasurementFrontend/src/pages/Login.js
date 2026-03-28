import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

const schema = yup.object({
  usernameOrEmail: yup.string().required('Username or email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login, loading, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const usernameOrEmail = watch('usernameOrEmail');
  const password = watch('password');

  // Load saved credentials on mount
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      setValue('usernameOrEmail', savedUsername);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLocalError('');
    
    const isValidForm = await trigger();
    if (!isValidForm) return;

    const result = await login(data);
    
    if (result.success && rememberMe) {
      localStorage.setItem('savedUsername', data.usernameOrEmail);
    } else if (!rememberMe) {
      localStorage.removeItem('savedUsername');
    }
    
    if (!result.success) {
      setLocalError(result.message);
    }
  };

  const handleInputChange = () => {
    if (localError) setLocalError('');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/v1/Auth/google/login';
  };

  if (loading) return <Loader fullScreen />;

  const displayError = localError || authError;

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
        <div style={styles.orb3}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoBox}>
            <span style={styles.logoText}>QM</span>
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue your measurement journey</p>
        </div>

        {displayError && (
          <Alert 
            type="error" 
            message={displayError} 
            onClose={() => {
              setLocalError('');
            }} 
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <Input
            label="Email or Username"
            name="usernameOrEmail"
            type="text"
            register={register}
            error={errors.usernameOrEmail?.message}
            icon="📧"
            placeholder="john@example.com or johndoe"
            required
            onChange={handleInputChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
            icon="🔒"
            placeholder="••••••••"
            required
            onChange={handleInputChange}
          />

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                style={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span style={styles.checkboxText}>Remember me</span>
            </label>
            <button type="button" style={styles.forgotLink}>
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={loading}
            disabled={!usernameOrEmail || !password}
          >
            Sign In
          </Button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Or continue with</span>
        </div>

        <Button
          onClick={handleGoogleLogin}
          variant="secondary"
          fullWidth
          icon="G"
        >
          Sign in with Google
        </Button>

        <p style={styles.signupText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.signupLink}>
            Create account
          </Link>
        </p>

        <div style={styles.footer}>
          <span>🔒 256-bit SSL</span>
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: '128px',
    height: '128px',
    background: '#3b82f6',
    borderRadius: '50%',
    filter: 'blur(64px)',
    opacity: 0.2,
    animation: 'float 6s ease-in-out infinite',
  },
  orb2: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: '128px',
    height: '128px',
    background: '#06b6d4',
    borderRadius: '50%',
    filter: 'blur(64px)',
    opacity: 0.2,
    animation: 'float 6s ease-in-out infinite',
    animationDelay: '0.7s',
  },
  orb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '384px',
    height: '384px',
    background: '#3b82f6',
    borderRadius: '50%',
    filter: 'blur(96px)',
    opacity: 0.1,
    animation: 'float 6s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '448px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    animation: 'slideIn 0.5s ease-out forwards',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoBox: {
    display: 'inline-flex',
    padding: '12px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '16px',
    marginBottom: '16px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, white, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'rgba(191, 219, 254, 0.8)',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4px',
    marginBottom: '4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  checkboxText: {
    color: '#bfdbfe',
    fontSize: '14px',
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: '#93c5fd',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
  },
  divider: {
    position: 'relative',
    margin: '24px 0',
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    position: 'relative',
    top: '-10px',
    background: 'transparent',
    padding: '0 12px',
    color: '#93c5fd',
    fontSize: '14px',
  },
  signupText: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#93c5fd',
    fontSize: '14px',
  },
  signupLink: {
    color: '#93c5fd',
    fontWeight: '600',
    textDecoration: 'none',
  },
  footer: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '10px',
    color: '#60a5fa',
  },
};

export default Login;