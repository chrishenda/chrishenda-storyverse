import React from 'react';

// A simplified representation of the Stripe logo
export const StripeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 54 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10.74 13.92v-3.84h6.04v3.84h-6.04Z" fill="currentColor"></path>
    <path d="M11.66 0C5.22 0 0 5.22 0 11.66v.68C0 18.78 5.22 24 11.66 24h30.68C48.78 24 54 18.78 54 12.34v-.68C54 5.22 48.78 0 42.34 0H11.66Zm-1.58 18.66V5.34h2.52v5.7h6.02V5.34h2.52v13.32h-2.52v-5.7h-6.02v5.7h-2.52Zm21.34 0V5.34h5.2c2.16 0 3.58.5 4.54 1.5.94.98 1.42 2.44 1.42 4.38 0 1.9-.48 3.36-1.42 4.38-.96 1-2.38 1.5-4.54 1.5h-5.2Zm2.52-2.42h2.68c.84 0 1.4-.2 1.7-.6.3-.4.46-1.02.46-1.86 0-.84-.15-1.46-.46-1.86-.3-.4-.86-.6-1.7-.6h-2.68v4.92Zm12.18 2.42V5.34h2.52v10.9h4.72v2.42h-7.24Z" fill="currentColor"></path>
  </svg>
);
