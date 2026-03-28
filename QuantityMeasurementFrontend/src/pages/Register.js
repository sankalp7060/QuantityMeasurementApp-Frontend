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
  firstName: yup.string().required('First name required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name required').min(2, 'Last name must be at least 2 characters'),
  username: yup.string().required('Username required').min(3).max(20).matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: yup.string().required('Email required').email('Invalid email format'),
  password: yup.string().required('Password required').min(8).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, number'),
  confirmPassword: yup.string().required('Confirm password').oneOf([yup.ref('password')], 'Passwords must match'),
});

const Register = () => {
  const { register: registerUser, loading, error } = useAuth();
  const [localError, setLocalError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const calculateStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 34;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 33;
    if (/[0-9]/.test(pass)) score += 33;
    return score;
  };

  React.useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    setLocalError('');
    const result = await registerUser(data);
    if (!result.success) {
      setLocalError(result.message);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoBox}>
            <span style={styles.logoText}>QM</span>
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join the future of measurement technology</p>
        </div>

        <Alert type="error" message={localError || error} onClose={() => setLocalError('')} />

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.row}>
            <Input
              label="First Name"
              name="firstName"
              register={register}
              error={errors.firstName?.message}
              icon="👤"
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              register={register}
              error={errors.lastName?.message}
              icon="👤"
              placeholder="Doe"
              required
            />
          </div>

          <Input
            label="Username"
            name="username"
            register={register}
            error={errors.username?.message}
            icon="@"
            placeholder="johndoe"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
            icon="📧"
            placeholder="john@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
            icon="🔒"
            placeholder="Create strong password"
            required
          />

          {password && (
            <div style={styles.strengthContainer}>
              <div style={styles.strengthLabels}>
                <span>Password strength</span>
                <span>{passwordStrength}%</span>
              </div>
              <div style={styles.strengthBar}>
                <div
                  style={{
                    ...styles.strengthFill,
                    width: `${passwordStrength}%`,
                    background:
                      passwordStrength <= 34
                        ? '#ef4444'
                        : passwordStrength <= 67
                        ? '#eab308'
                        : '#22c55e',
                  }}
                />
              </div>
            </div>
          )}

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword?.message}
            icon="🔒"
            placeholder="Confirm your password"
            required
          />

          {watch('confirmPassword') && watch('password') === watch('confirmPassword') && watch('password') && (
            <Alert type="success" message="✓ Passwords match" />
          )}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <p style={styles.signinText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.signinLink}>
            Sign in
          </Link>
        </p>
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
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '896px',
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
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  strengthContainer: {
    marginTop: '-12px',
  },
  strengthLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: '10px',
    color: '#93c5fd',
  },
  strengthBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s',
  },
  signinText: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#93c5fd',
    fontSize: '14px',
  },
  signinLink: {
    color: '#93c5fd',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;