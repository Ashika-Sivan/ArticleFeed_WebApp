import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyState = ({
  title = 'No Items Found',
  description = 'There are no items to display at this time.',
  children,
}) => {
  return (
    <div
      className="card-box"
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        maxWidth: '520px',
        margin: '2rem auto',
      }}
    >
      <AlertCircle
        size={36}
        color="var(--text-dim)"
        style={{ margin: '0 auto 0.75rem' }}
      />
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: children ? '1.25rem' : '0' }}>
        {description}
      </p>
      {children && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
