import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles.button,
        ...getVariantStyles(),
        ...(fullWidth ? styles.fullWidth : {}),
        ...((disabled || loading) ? styles.disabled : {})
      }}
    >
      {loading ? (
        <span style={styles.loader}></span>
      ) : (
        <>
          {icon && <span style={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

const styles = {
  button: {
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  primary: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#bfdbfe',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  danger: {
    background: '#dc2626',
    color: 'white',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loader: {
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  icon: {
    fontSize: '18px',
  },
};

export default Button;