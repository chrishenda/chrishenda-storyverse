import React, { useState, useRef } from 'react';
import { User } from '../types';
import Button from './Button';
import { UploadIcon } from './icons/UploadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';

interface UserProfileProps {
  user: User;
  onUpdateUser: React.Dispatch<React.SetStateAction<User | null>>;
  onLogout: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onConnectYouTube: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser, onLogout, showToast, onConnectYouTube }) => {
    const [email, setEmail] = useState(user.email);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profilePicPreview, setProfilePicPreview] = useState(user.profilePictureUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePicture = () => {
        onUpdateUser({ ...user, profilePictureUrl: profilePicPreview });
        showToast('Profile picture updated!');
    };
    
    const handleUpdateEmail = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, email });
        showToast('Email updated successfully!');
    }

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }
        showToast('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
    }

    const formElementClasses = "w-full bg-gray-700/80 border-gray-600/80 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    const labelClasses = "block text-sm font-medium text-gray-300";

    const cardBaseClasses = "bg-gray-800/70 backdrop-blur-md p-6 rounded-lg border border-white/10";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Manage Your Profile</h1>
      
      {/* Profile Picture Section */}
      <div className={cardBaseClasses}>
          <h2 className="text-xl font-semibold">Profile Picture</h2>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
              <img src={profilePicPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover"/>
              <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">Upload a new photo for your profile avatar.</p>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" />
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Choose File
                    </Button>
                    <Button onClick={handleUpdatePicture} disabled={profilePicPreview === user.profilePictureUrl}>
                        Save Picture
                    </Button>
                  </div>
              </div>
          </div>
      </div>

      {/* Connected Accounts Section */}
      <div className={cardBaseClasses}>
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
          <div className="mt-4 flex items-center justify-between bg-gray-900/40 p-4 rounded-md">
            <div className="flex items-center">
                <YouTubeIcon className="w-8 h-8 mr-4"/>
                <div>
                    <h3 className="font-semibold">YouTube</h3>
                    <p className="text-sm text-gray-400">Upload your final videos directly to your channel.</p>
                </div>
            </div>
            <Button onClick={onConnectYouTube} variant={user.youtubeConnected ? 'danger' : 'secondary'}>
                {user.youtubeConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
      </div>
      
      {/* Email Section */}
       <div className={cardBaseClasses}>
          <h2 className="text-xl font-semibold">Email Address</h2>
          <form onSubmit={handleUpdateEmail} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className={labelClasses}>Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${formElementClasses} mt-1`} />
            </div>
            <div className="text-right">
                <Button type="submit">Update Email</Button>
            </div>
          </form>
       </div>
       
      {/* Password Section */}
       <div className={cardBaseClasses}>
          <h2 className="text-xl font-semibold">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
              <div>
                  <label htmlFor="new-password" className={labelClasses}>New Password</label>
                  <div className="relative mt-1">
                      <input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={`${formElementClasses} pr-10`} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                          {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
              <div>
                  <label htmlFor="confirm-password" className={labelClasses}>Confirm New Password</label>
                   <div className="relative mt-1">
                      <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`${formElementClasses} pr-10`} />
                       <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                          {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
              <div className="text-right">
                <Button type="submit">Update Password</Button>
              </div>
          </form>
       </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onLogout} variant="danger">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;