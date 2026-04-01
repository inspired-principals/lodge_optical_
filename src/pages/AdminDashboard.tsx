import React from 'react';
import { LayoutDashboard, Building2, Briefcase, Radio, Bot, LogOut } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Entities', path: '/admin/entities', icon: Building2 },
    { name: 'Projects', path: '/admin/projects', icon: Briefcase },
    { name: 'Signals', path: '/admin/signals', icon: Radio },
    { name: 'Agents', path: '/admin/agents', icon: Bot },
    { name: 'AI Chat', path: '/admin/chat', icon: Bot },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-blue text-white flex flex-col">
        <div className="p-6 text-xl font-bold tracking-tighter">PHOENIX OS</div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-6 text-white/70 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
