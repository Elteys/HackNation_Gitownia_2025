import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            {/* Pasek RP */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-white to-red-600 w-full" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <span className="font-bold text-xs">RP</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-800 leading-tight">Odnalezione Zguby</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Portal Urzędnika</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
                        <span>Pomoc techniczna</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            <ShieldCheck size={16} />
                            <span>Zalogowany: Jan Kowalski</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;