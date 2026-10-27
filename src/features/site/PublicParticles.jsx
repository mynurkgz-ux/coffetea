import React from 'react';

export function PublicParticles({ animation = 'soda' }) {
  if (animation === 'none') return null;

  return (
    <div className={`public-particles public-particles-${animation}`} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} className={`public-particle public-particle-${index + 1}`} />
      ))}
    </div>
  );
}
