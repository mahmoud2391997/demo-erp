import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Briefcase, LogIn } from 'lucide-react';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ConstructPro ERP</h1>
          <p className="text-gray-400 text-sm max-w-[280px]">
            Enterprise-grade ERP for Construction & Technical Services.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-950 font-semibold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
            Secure Access for Authorized Personnel
          </p>
        </div>

        <div className="pt-8 border-t border-gray-800 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs font-bold text-blue-500">HR</div>
            <div className="text-[10px] text-gray-500">Module</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-500">Inventory</div>
            <div className="text-[10px] text-gray-500">Module</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-500">Sales</div>
            <div className="text-[10px] text-gray-500">Module</div>
          </div>
        </div>
      </div>
    </div>
  );
}
