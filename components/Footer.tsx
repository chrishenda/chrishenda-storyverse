import React from 'react';
import { AppView } from '../App';
import { VideoIcon, StripeIcon, XSocialIcon, InstagramIcon, FacebookIcon } from './icons';

interface FooterProps {
    onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="bg-black/20 border-t border-white/10 mt-16">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* App Info */}
                    <div className="lg:col-span-4 space-y-4">
                        <button onClick={() => onNavigate('landing')} className="flex items-center text-left">
                             <VideoIcon className="h-8 w-8 text-blue-500" />
                            <span className="ml-3 text-xl font-bold">Chrishenda StoryVerse</span>
                        </button>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Turning family memories into animated masterpieces.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">Company</h3>
                            <ul className="mt-4 space-y-3">
                                <li><button onClick={() => onNavigate('about')} className="text-sm text-gray-400 hover:text-white transition-colors">About Us</button></li>
                                <li><button onClick={() => onNavigate('contact')} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</button></li>
                                <li><button onClick={() => onNavigate('pricing')} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">Legal</h3>
                            <ul className="mt-4 space-y-3">
                                <li><button onClick={() => onNavigate('terms')} className="text-sm text-gray-400 hover:text-white transition-colors">Terms & Conditions</button></li>
                                {/* <li><button onClick={() => onNavigate('privacy')} className="text-sm text-gray-400 hover:text-white">Privacy Policy</button></li> */}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">Follow Us</h3>
                            <div className="flex mt-4 space-x-5">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="X social media">
                                    <XSocialIcon className="h-6 w-6" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                                    <InstagramIcon className="h-6 w-6" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                                    <FacebookIcon className="h-6 w-6" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider and Copyright */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center text-sm text-gray-500">
                        <span>Secure payments by</span>
                        <StripeIcon className="w-16 h-auto ml-2 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 text-center sm:text-right">
                        &copy; {new Date().getFullYear()} Chrishenda StoryVerse. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
