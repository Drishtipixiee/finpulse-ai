'use client';

import React from 'react';
import { LayoutDashboard, User, ShieldCheck, TrendingUp, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {

  const router = useRouter();

  /*
  LOGOUT FUNCTION
  */
  const handleLogout = () => {

    // Remove JWT token
    localStorage.removeItem('token');

    // Redirect to login page
    router.push('/');

  };


  const menuItems = [

    {
      name: 'Intelligence Hub',
      icon: <LayoutDashboard size={20}/>,
      href: '/dashboard'
    },

    {
      name: 'Customer Profile',
      icon: <User size={20}/>,
      href: '/dashboard/profile'
    },

    {
      name: 'Risk Analytics',
      icon: <TrendingUp size={20}/>,
      href: '/dashboard/analytics'
    },

    {
      name: 'Safety Controls',
      icon: <ShieldCheck size={20}/>,
      href: '/dashboard/safety'
    },

  ];


  return (

    <nav className="w-72 bg-[#0d1425] border-r border-slate-800 p-8 flex flex-col shadow-2xl">

      {/* Header */}

      <div className="mb-12">

        <h2 className="text-2xl font-black text-blue-500 tracking-tighter">
          FinPulse AI
        </h2>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Agentic Banking Core
        </p>

      </div>



      {/* Menu */}

      <div className="space-y-3 flex-1">

        {menuItems.map((item) => (

          <Link
            key={item.name}
            href={item.href}
            className="
              flex items-center gap-4 p-4 rounded-xl
              hover:bg-blue-600/10 hover:text-blue-400
              text-slate-400 transition-all group
            "
          >

            <span className="group-hover:scale-110 transition-transform">
              {item.icon}
            </span>

            <span className="font-semibold text-sm">
              {item.name}
            </span>

          </Link>

        ))}

      </div>



      {/* Guardrail Status */}

      <div className="pt-6 border-t border-slate-800">

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 mb-4">

          <div className="flex items-center gap-2 mb-2">

            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Guardrail Engine
            </span>

          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            System compliant with DTI & Risk protocols.
          </p>

        </div>



        {/* Logout Button */}

        <button
          onClick={handleLogout}
          className="
            w-full flex items-center justify-center gap-2
            bg-red-600 hover:bg-red-500
            text-white font-semibold text-sm
            py-3 rounded-xl
            transition-all active:scale-[0.98]
          "
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </nav>

  );

}
