import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, User, Menu, X, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collection', label: 'Collection' },
  { to: '/offers', label: 'Offers' },
  { to: '/contact', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const { cart, favorites, userInfo, logoutUser } = useAppContext();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const favoritesCount = favorites.length;

  const handleLogout = () => {
    logoutUser();
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Desktop link with animated gold underline
  const desktopLink = ({ to, label }: { to: string; label: string }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `relative py-1 font-medium transition-colors duration-300 after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:bg-brand-accent after:transition-transform after:duration-300 ${
          isActive
            ? 'text-brand-dark after:scale-x-100'
            : 'text-gray-600 hover:text-brand-dark after:scale-x-0 hover:after:scale-x-100'
        }`
      }
    >
      {label}
    </NavLink>
  );

  const iconBadge = (count: number) =>
    count > 0 && (
      <motion.span
        key={count}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className="absolute -top-2 -right-2 bg-brand-accent text-white text-[11px] font-semibold rounded-full h-5 w-5 flex items-center justify-center"
      >
        {count}
      </motion.span>
    );

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-brand-dark text-white/90 text-center text-xs sm:text-sm py-2 px-4 tracking-wide">
        Free shipping on orders over <span className="text-brand-accent font-semibold">৳1000</span> — Cash on Delivery available
      </div>

      {/* Main bar */}
      <nav className="bg-white/85 backdrop-blur-lg border-b border-gray-200/70 shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <NavLink to="/" className="font-display text-2xl font-bold text-brand-dark tracking-wide">
              Johan'S<span className="text-brand-accent"> Hub</span>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex md:items-center md:space-x-9">
              {NAV_LINKS.map(desktopLink)}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Favorites */}
              <NavLink
                to="/favorites"
                aria-label="Favorites"
                className={({ isActive }) =>
                  `relative p-2 rounded-full transition-colors duration-300 hover:bg-brand-cream ${isActive ? 'text-brand-accent' : 'text-gray-700'}`
                }
              >
                <Heart size={22} />
                {iconBadge(favoritesCount)}
              </NavLink>

              {/* Cart */}
              <NavLink
                to="/checkout"
                aria-label="Cart"
                className={({ isActive }) =>
                  `relative p-2 rounded-full transition-colors duration-300 hover:bg-brand-cream ${isActive ? 'text-brand-accent' : 'text-gray-700'}`
                }
              >
                <ShoppingCart size={22} />
                {iconBadge(cartItemCount)}
              </NavLink>

              {/* User (desktop dropdown) */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                {userInfo ? (
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    aria-label="Account menu"
                    className="p-2 rounded-full text-gray-700 hover:bg-brand-cream transition-colors duration-300"
                  >
                    <User size={22} />
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    aria-label="Sign in"
                    className={({ isActive }) =>
                      `block p-2 rounded-full transition-colors duration-300 hover:bg-brand-cream ${isActive ? 'text-brand-accent' : 'text-gray-700'}`
                    }
                  >
                    <User size={22} />
                  </NavLink>
                )}

                <AnimatePresence>
                  {userInfo && isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lift py-1.5 z-50 ring-1 ring-black/5 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 text-sm text-gray-500 border-b border-gray-100">
                        Signed in as<br />
                        <strong className="text-gray-800 truncate block">{userInfo.name}</strong>
                      </div>
                      {userInfo.isAdmin ? (
                        <NavLink
                          to="/admin/dashboard"
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-cream transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} className="mr-2.5 text-brand-accent" />
                          Dashboard
                        </NavLink>
                      ) : (
                        <NavLink
                          to="/profile"
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-cream transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <UserCircle size={16} className="mr-2.5 text-brand-accent" />
                          Profile
                        </NavLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="mr-2.5" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden p-2 rounded-full text-gray-800 hover:bg-brand-cream transition-colors"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-lg border-t border-gray-100"
            >
              <div className="px-5 py-4 flex flex-col">
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `py-3 text-base font-medium border-b border-gray-100 last:border-b-0 transition-colors ${
                        isActive ? 'text-brand-accent' : 'text-gray-800'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}

                <div className="pt-4 pb-1 flex flex-col gap-1">
                  {userInfo ? (
                    <>
                      <NavLink
                        to={userInfo.isAdmin ? '/admin/dashboard' : '/profile'}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 text-gray-800 font-medium"
                      >
                        {userInfo.isAdmin ? <LayoutDashboard size={20} className="text-brand-accent" /> : <UserCircle size={20} className="text-brand-accent" />}
                        {userInfo.isAdmin ? 'Admin Dashboard' : 'My Profile'}
                      </NavLink>
                      <button onClick={handleLogout} className="flex items-center gap-2.5 py-2.5 text-red-600 font-medium">
                        <LogOut size={20} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 text-gray-800 font-medium"
                    >
                      <User size={20} className="text-brand-accent" />
                      Sign in / Register
                    </NavLink>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
