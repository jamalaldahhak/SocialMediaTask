import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Nav = () => {
  // جلب المستخدم الحالي من الـ Context
  const { selectedUser } = useUser();

  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-6z" />
            </svg>
          </div>
          <span className="hidden text-base font-bold text-white sm:block">
            Social Media Management
          </span>
        </div>

        {/* Clean Nav Links (No IDs in URLs) */}
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur-md">
            <NavLink to="/my-posts" className={navLinkClass}>
              My Posts
            </NavLink>

            <NavLink to="/posts" className={navLinkClass}>
              Posts
            </NavLink>

            <NavLink to="/albums" className={navLinkClass}>
              Albums
            </NavLink>

            <NavLink to="/todos" className={navLinkClass}>
              ToDo
            </NavLink>
          </div>
        </div>

        {/* Profile Info from Context */}
        <div className="flex shrink-0 items-center gap-3 border-r border-slate-800/80 pr-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-bold text-indigo-400 ring-2 ring-indigo-500/20">
            {selectedUser?.name ? selectedUser.name.charAt(0) : 'U'}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-200">
              {selectedUser?.name || 'لم يتم تحديد مستخدم'}
            </p>
            <p className="text-[10px] text-slate-400">
              {selectedUser?.username ? `@${selectedUser.username}` : `ID: ${selectedUser?.id || '—'}`}
            </p>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Nav;