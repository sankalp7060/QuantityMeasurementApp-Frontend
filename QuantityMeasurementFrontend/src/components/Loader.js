import React from 'react';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return '32px';
      case 'large':
        return '64px';
      default:
        return '48px';
    }
  };

  const loader = (
    <div style={styles.container}>
      <div
        style={{
          ...styles.spinner,
          width: getSize(),
          height: getSize(),
        }}
      ></div>
      <p style={styles.text}>Loading...</p>
    </div>
  );

  if (fullScreen) {
    return <div style={styles.fullScreen}>{loader}</div>;
  }

  return loader;
};

const styles = {
  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    textAlign: 'center',
  },
  spinner: {
    border: '3px solid rgba(59, 130, 246, 0.3)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  text: {
    color: '#94a3b8',
    fontSize: '14px',
  },
};

export default Loader;