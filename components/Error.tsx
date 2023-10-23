'use client'

import React, { CSSProperties } from 'react'

function ErrorModal({ errorMessage }: { errorMessage: string }) {
  if (!errorMessage) {
    return null // If there's no error, don't display the modal.
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    } as CSSProperties,
    modal: {
      width: '70%',
      maxWidth: '400px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    closeButton: {
      marginTop: '20px',
    },
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Error</h2>
        <p>{errorMessage}</p>
        <p>Note: Our frontend is currently under development. We apologize for the inconvenience.</p>
        <p>Please refresh the browser and try again.</p>
        <button style={styles.closeButton} onClick={() => {}}>
          Refresh
        </button>
      </div>
    </div>
  )
}

export default ErrorModal
