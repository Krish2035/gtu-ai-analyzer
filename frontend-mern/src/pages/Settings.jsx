import React, { useRef, useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import {
  User, Bell, Shield, Smartphone, Sparkles, LogOut, Camera,
  X, CheckCircle, Eye, EyeOff, Pencil, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────────────────────
   Generic animated modal wrapper
──────────────────────────────────────────────────────── */
const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative"
      style={{ animation: 'modalIn 0.25s ease' }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
      >
        <X size={18} />
      </button>
      {children}
    </div>
    <style>{`
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.96) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  </div>
);

/* ────────────────────────────────────────────────────────
   Edit Profile Modal
──────────────────────────────────────────────────────── */
const EditProfileModal = ({ user, onClose, onSuccess }) => {
  const [name, setName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    if (name.trim() === user.name) { onClose(); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('lumina_token');
      await apiClient.put('/api/users/profile', { name: name.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDone(true);
      onSuccess(name.trim());
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {!done ? (
        <>
          <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6">
            <Pencil size={26} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Edit Profile</h2>
          <p className="text-sm text-slate-400 font-medium mb-8">Update your display name.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <input
                id="edit-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 text-sm"
                placeholder="Your full name"
                maxLength={60}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3">
                <span className="text-red-500 text-sm">⚠</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="w-14 h-14 bg-green-50 rounded-[1.5rem] flex items-center justify-center text-green-600 mb-6">
            <CheckCircle size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Profile Updated!</h2>
          <p className="text-sm text-slate-400 font-medium mb-8">Your name has been changed successfully.</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Done
          </button>
        </>
      )}
    </Modal>
  );
};

/* ────────────────────────────────────────────────────────
   Change Password Modal
──────────────────────────────────────────────────────── */
const ChangePasswordModal = ({ onClose }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setError('New passwords do not match.'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina_token');
      await apiClient.put('/api/users/password', {
        old_password: oldPass,
        new_password: newPass
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ id, value, onChange, show, onToggle, placeholder }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
        <Lock size={16} />
      </div>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400 text-sm"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );

  return (
    <Modal onClose={onClose}>
      {!done ? (
        <>
          <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6">
            <Lock size={26} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Change Password</h2>
          <p className="text-sm text-slate-400 font-medium mb-8">Enter your current password to proceed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
              <PasswordInput
                id="current-password-input"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                show={showOld}
                onToggle={() => setShowOld(!showOld)}
                placeholder="Current password"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
              <PasswordInput
                id="new-password-input"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
              <PasswordInput
                id="confirm-password-input"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                placeholder="Repeat new password"
              />
            </div>

            {/* Strength indicator */}
            {newPass.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((lvl) => {
                    const strength = Math.min(
                      (newPass.length >= 6 ? 1 : 0) +
                      (/[A-Z]/.test(newPass) ? 1 : 0) +
                      (/[0-9]/.test(newPass) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(newPass) ? 1 : 0),
                      4
                    );
                    return (
                      <div
                        key={lvl}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: lvl <= strength
                            ? strength <= 1 ? '#ef4444' : strength <= 2 ? '#f97316' : strength <= 3 ? '#eab308' : '#22c55e'
                            : '#e2e8f0'
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {newPass.length < 6 ? 'Too short' : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) && /[^A-Za-z0-9]/.test(newPass) ? '💪 Strong password' : 'Add uppercase, numbers & symbols for strength'}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3">
                <span className="text-red-500 text-sm">⚠</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                id="save-password-btn"
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="w-14 h-14 bg-green-50 rounded-[1.5rem] flex items-center justify-center text-green-600 mb-6">
            <CheckCircle size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Password Changed!</h2>
          <p className="text-sm text-slate-400 font-medium mb-8">Your password has been updated successfully. Use it next time you sign in.</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Done
          </button>
        </>
      )}
    </Modal>
  );
};

/* ────────────────────────────────────────────────────────
   Avatar Preview Modal
──────────────────────────────────────────────────────── */
const AvatarPreviewModal = ({ file, onClose, onConfirm, uploading }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Update Photo</h2>
      <p className="text-sm text-slate-400 font-medium mb-6">Confirm your new profile picture.</p>

      <div className="flex justify-center mb-8">
        {preview && (
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-100 shadow-xl">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={uploading}
          className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          id="confirm-avatar-btn"
          type="button"
          onClick={onConfirm}
          disabled={uploading}
          className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
      </div>
    </Modal>
  );
};

/* ────────────────────────────────────────────────────────
   Main Settings Page
──────────────────────────────────────────────────────── */
const Settings = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: 'Loading...', enrollment: '', profile_photo: null });
  const [modal, setModal] = useState(null); // 'edit' | 'password' | 'avatar'
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [toggles, setToggles] = useState({ notifications: true, privacy: false, sync: true });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('lumina_token');
        if (token && token !== 'demo_token_123') {
          const res = await apiClient.get('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.name) setUser(res.data);
        } else {
          const storedUser = localStorage.getItem('lumina_user');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };
    fetchUser();
  }, []);

  const isDemo = () => {
    const token = localStorage.getItem('lumina_token');
    return !token || token === 'demo_token_123';
  };

  /* Avatar: click camera button → file picker */
  const handleAvatarClick = () => {
    if (isDemo()) { showToast('⚠ Avatar upload requires a real account. Please sign up!'); return; }
    fileInputRef.current?.click();
  };

  /* File selected → show preview modal */
  const handleFileSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPendingFile(e.target.files[0]);
      setModal('avatar');
    }
    e.target.value = ''; // reset so same file can be re-selected
  };

  /* Confirmed upload */
  const handleAvatarUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      const token = localStorage.getItem('lumina_token');
      const res = await apiClient.post('/api/users/upload_avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUser((u) => ({ ...u, profile_photo: res.data.profile_photo }));
      showToast('✅ Profile photo updated!');
      setModal(null);
    } catch {
      showToast('❌ Upload failed. Please try again.');
      setModal(null);
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const handleEditProfile = () => {
    if (isDemo()) { showToast('⚠ Profile editing requires a real account. Please sign up!'); return; }
    setModal('edit');
  };

  const handleChangePassword = () => {
    if (isDemo()) { showToast('⚠ Password change requires a real account. Please sign up!'); return; }
    setModal('password');
  };

  const handleLogout = () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    navigate('/login');
  };

  /* Build avatar URL with dynamic name */
  const avatarUrl = user.profile_photo
    ? user.profile_photo
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=0D8ABC&color=fff&size=200`;

  return (
    <>
      {/* Modals */}
      {modal === 'edit' && (
        <EditProfileModal
          user={user}
          onClose={() => setModal(null)}
          onSuccess={(newName) => {
            setUser((u) => ({ ...u, name: newName }));
            showToast('✅ Profile updated!');
          }}
        />
      )}
      {modal === 'password' && (
        <ChangePasswordModal onClose={() => setModal(null)} />
      )}
      {modal === 'avatar' && pendingFile && (
        <AvatarPreviewModal
          file={pendingFile}
          onClose={() => { setModal(null); setPendingFile(null); }}
          onConfirm={handleAvatarUpload}
          uploading={uploading}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl"
          style={{ animation: 'modalIn 0.2s ease' }}
        >
          {toast}
        </div>
      )}

      <div className="animate-in fade-in duration-700 max-w-[1000px] mx-auto space-y-10">
        
        {/* Profile Card */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-50 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          {/* Avatar */}
          <div className="relative w-40 h-40 shrink-0">
            <div className="w-full h-full rounded-full border-8 border-slate-50 overflow-hidden shadow-inner">
              <img
                src={avatarUrl}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              id="avatar-upload-btn"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all"
              title="Change profile photo"
            >
              <Camera size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 text-sm">
              {user.enrollment ? `${user.enrollment} • ` : ''}Sem 7 Engineering
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
              <button
                id="edit-profile-btn"
                onClick={handleEditProfile}
                className="bg-blue-600 text-white font-black text-[10px] px-8 py-3 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Edit Profile
              </button>
              <button
                id="change-password-btn"
                onClick={handleChangePassword}
                className="bg-slate-50 text-slate-600 font-black text-[10px] px-8 py-3 rounded-2xl uppercase tracking-widest hover:bg-slate-100 hover:-translate-y-0.5 transition-all border border-slate-200"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="absolute top-10 right-10 opacity-5">
            <Sparkles size={120} />
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Preferences */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-800 px-2">Preferences</h3>
            <div className="space-y-2">
              {[
                { key: 'notifications', icon: Bell, label: 'Analysis Notifications', desc: 'Alert me when AI drafts are ready' },
                { key: 'privacy', icon: Shield, label: 'Data Privacy', desc: 'Anonymous analysis history' },
                { key: 'sync', icon: Smartphone, label: 'Cloud Sync', desc: 'Sync progress across devices' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setToggles((t) => ({ ...t, [item.key]: !t[item.key] }))}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${toggles[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${toggles[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-800 px-2 mb-8">Account System</h3>
            <div className="bg-[#f8faff] p-8 rounded-[2.5rem] flex-grow flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm mb-6">
                <User size={32} />
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Student Verification</p>
              <h4 className="text-xl font-black text-slate-800 mb-4">
                {isDemo() ? 'Demo Mode Active' : 'Account Fully Verified'}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed px-6">
                {isDemo()
                  ? 'You are in demo mode. Sign up for a real account to unlock all features.'
                  : 'Your student status is synced with GTU Registry. You have full access to all analysis modules.'}
              </p>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="mt-8 flex items-center justify-center gap-4 text-red-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-all"
            >
              <LogOut size={20} /> Log Out from Device
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Settings;
