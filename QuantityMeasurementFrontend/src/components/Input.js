import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  register,
  error,
  placeholder,
  icon,
  required = false,
  autoComplete = 'off'
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // If register prop is provided, use react-hook-form's register
  const inputProps = register 
    ? register(name) 
    : { value, onChange, onBlur, name };

  // Combine the onChange handlers
  const handleChange = (e) => {
    if (register) {
      inputProps.onChange(e);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div style={styles.container}>
      {label && (
        <label style={styles.label}>
          {label} {required && <span style={styles.required}>*</span>}
        </label>
      )}
      <div style={styles.inputWrapper}>
        {icon && <span style={styles.icon}>{icon}</span>}
        <input
          {...inputProps}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(icon ? { paddingLeft: '40px' } : {}),
            ...(type === 'password' ? { paddingRight: '40px' } : {}),
            ...(error ? styles.inputError : {})
          }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#bfdbfe',
    marginBottom: '8px',
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#93c5fd',
  },
  input: {
    width: '100%',
    padding: '12px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#93c5fd',
  },
  error: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#fca5a5',
  },
};

export default Input;