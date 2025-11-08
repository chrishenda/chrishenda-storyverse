import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { AppView } from '../App';
import { VideoIcon, UserCircleIcon, LogoutIcon, PriceTagIcon } from './icons';
import Button from './Button';

type AuthStatus = 'guest' | 'authenticating' | 'authenticated';

interface HeaderProps {
  appName: string;
  authStatus: AuthStatus;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  isCreatorView: boolean;
  onResetCreation: () => void;
}

const Header: React.FC<HeaderProps> = ({ appName, authStatus, user, onLogout, onNavigate, isCreatorView, onResetCreation }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) { // if scroll down hide the header
          setIsHeaderVisible(false);
        } else { // if scroll up show the header
          setIsHeaderVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);


  return (
    <header className={`bg-black/20 backdrop-blur-lg sticky top-0 z-20 border-b border-white/10 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button className="flex items-center" onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
            <VideoIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-3 text-xl font-bold tracking-tight">{appName}</span>
          </button>
          <div className="flex items-center space-x-2 md:space-x-4">
             {isCreatorView && (
              <Button onClick={onResetCreation} variant="secondary" size="sm">Start Over</Button>
            )}
            {authStatus === 'authenticated' && user && (
              <>
                <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 px-2 hidden sm:inline-flex">Dashboard</button>
                <button onClick={() => onNavigate('gallery')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 px-2">My Gallery</button>
              </>
            )}
            {authStatus !== 'authenticated' && (
              <button onClick={() => onNavigate('pricing')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 px-2">Pricing</button>
            )}
            
            {authStatus === 'authenticated' && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-md shadow-lg py-1 z-30">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('profile'); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white flex items-center"
                    >
                      <UserCircleIcon className="w-5 h-5 mr-2" /> Profile
                    </button>
                     <button
                      onClick={() => { onNavigate('pricing'); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white flex items-center"
                    >
                      <PriceTagIcon className="w-5 h-5 mr-2" /> Pricing
                    </button>
                    <button
                      onClick={() => { onLogout(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white flex items-center"
                    >
                      <LogoutIcon className="w-5 h-5 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                 <Button onClick={() => onNavigate('login')} variant="secondary" size="sm" className="hidden sm:inline-flex">Login</Button>
                 <Button onClick={() => onNavigate('signup')} size="sm">Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;