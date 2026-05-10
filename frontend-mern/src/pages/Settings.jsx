import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { User, Bell, Shield, Smartphone, ChevronRight, Sparkles, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const [user, setUser] = useState({ name: "Loading...", enrollment: "Loading...", profile_photo: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("lumina_token");
        if (token) {
          const res = await axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      try {
        const token = localStorage.getItem("lumina_token");
        const res = await axios.post("/api/users/upload_avatar", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        alert(res.data.message);
        setUser({ ...user, profile_photo: res.data.profile_photo });
      } catch (err) {
        alert("Upload failed");
      }
    }
  };

  const handleEditProfile = async () => {
    const newName = prompt("Enter new full name:", user.name);
    if (newName && newName !== user.name) {
      try {
        const token = localStorage.getItem("lumina_token");
        const res = await axios.put("/api/users/profile", { name: newName }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message);
        setUser({ ...user, name: newName });
      } catch (err) {
        alert("Failed to update profile");
      }
    }
  };

  const handleChangePassword = async () => {
    const oldPass = prompt("Enter current password:");
    if (oldPass) {
      const newPass = prompt("Enter new password:");
      if (newPass) {
        try {
          const token = localStorage.getItem("lumina_token");
          const res = await axios.put("/api/users/password", { 
            old_password: oldPass, 
            new_password: newPass 
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert(res.data.message);
        } catch (err) {
          alert(err.response?.data?.detail || "Failed to update password");
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lumina_token");
    navigate('/login');
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-[1000px] mx-auto space-y-10">
      
      {/* Profile Card */}
      <div className="bg-white p-12 rounded-[4rem] border border-slate-50 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
         <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full border-8 border-slate-50 overflow-hidden shadow-inner">
               <img src={user.profile_photo || "https://ui-avatars.com/api/?name=Krish+Patel&background=0D8ABC&color=fff"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div 
               onClick={handleAvatarClick}
               className="absolute bottom-0 right-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
               <Camera size={20} />
            </div>
            <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleAvatarChange} 
               className="hidden" 
               accept="image/*" 
            />
         </div>
         
         <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-1">{user.enrollment} • Sem 7 Engineering</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
               <button onClick={handleEditProfile} className="bg-blue-600 text-white font-black text-[10px] px-8 py-3 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 transition-colors">Edit Profile</button>
               <button onClick={handleChangePassword} className="bg-slate-50 text-slate-500 font-black text-[10px] px-8 py-3 rounded-2xl uppercase tracking-widest hover:bg-slate-100 transition-colors">Change Password</button>
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
                  { icon: Bell, label: "Analysis Notifications", desc: "Alert me when AI drafts are ready", status: true },
                  { icon: Shield, label: "Data Privacy", desc: "Anonymous analysis history", status: false },
                  { icon: Smartphone, label: "Cloud Sync", desc: "Sync progress across devices", status: true }
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all">
                           <item.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800">{item.label}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                        </div>
                     </div>
                     <div className={`w-10 h-6 rounded-full p-1 transition-all ${item.status ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.status ? 'translate-x-4' : 'translate-x-0'}`}></div>
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
               <h4 className="text-xl font-black text-slate-800 mb-4">Account Fully Verified</h4>
               <p className="text-xs text-slate-500 font-medium leading-relaxed px-6">
                  Your student status is synced with GTU Registry. You have full access to all analysis modules.
               </p>
            </div>
            <button onClick={handleLogout} className="mt-8 flex items-center justify-center gap-4 text-red-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-all">
               <LogOut size={20} /> Log Out from Device
            </button>
         </div>

      </div>

    </div>
  );
};

export default Settings;
