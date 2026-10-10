import React from 'react';
import { Sparkles } from 'lucide-react';

const ITEMS = [
  'Free shipping over ৳1000',
  'Cash on Delivery nationwide',
  'bKash & Nagad accepted',
  '100% export-quality cotton',
  'Up to 70% off — limited time',
  'New drops every season',
];

/** Infinite horizontally-scrolling announcement strip. */
const Marquee: React.FC = () => {
  const row = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-3 mx-6 text-sm font-medium tracking-wide whitespace-nowrap">
          <Sparkles size={14} className="text-brand-accent shrink-0" />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-brand-dark text-white/90 py-3 overflow-hidden select-none" role="marquee">
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
};

export default Marquee;
