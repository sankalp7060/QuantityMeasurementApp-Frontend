import React from 'react';

const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return styles.error;
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      default:
        return styles.error;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <div style={{ ...styles.container, ...getTypeStyles() }}>
      <span style={styles.icon}>{getIcon()}</span>
      <p style={styles.message}>{message}</p>
      {onClose && (
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '24px',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid rgba(34, 197, 94, 0.5)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(245, 158, 11, 0.5)',
  },
  icon: {
    fontSize: '18px',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    color: '#fecaca',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Alert;