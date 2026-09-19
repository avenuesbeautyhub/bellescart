'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture the error with Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Something went wrong!
          </h2>
          <p style={{ marginBottom: '2rem', color: 'var(--foreground)' }}>
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}