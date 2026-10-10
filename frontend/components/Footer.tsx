import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/collection', label: 'Collection' },
  { to: '/offers', label: 'Offers' },
  { to: '/contact', label: 'Contact' },
  { to: '/favorites', label: 'Favorites' },
];

const SERVICE_LINKS = [
  { to: '/profile', label: 'My Orders' },
  { to: '/checkout', label: 'Cart & Checkout' },
  { to: '/login', label: 'Sign In' },
  { to: '/register', label: 'Create Account' },
];

const SOCIALS = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Johan'S<span className="text-brand-accent"> Hub</span>
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Premium T-Shirts for the modern man. Comfort, simplicity, and class in every thread.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 rounded-full bg-white/5 text-gray-300 hover:bg-brand-accent hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-brand-accent transition-colors inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 tracking-wide">Your Account</h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-brand-accent transition-colors inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 tracking-wide">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-accent shrink-0 mt-0.5" />
                Dhaka, Bangladesh
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-brand-accent shrink-0 mt-0.5" />
                Cash on Delivery nationwide
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-brand-accent shrink-0 mt-0.5" />
                bKash & Nagad accepted
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Johan'S Hub. All Rights Reserved.</p>
          <p className="text-gray-500">A premium Bangladeshi brand.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
