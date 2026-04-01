import React from 'react';
import { Building2, Briefcase, Radio, Bot } from 'lucide-react';

export default function AdminOverview() {
  const stats = [
    { name: 'Active Projects', value: '12', icon: Briefcase, color: 'text-blue-600' },
    { name: 'Total Entities', value: '45', icon: Building2, color: 'text-green-600' },
    { name: 'Running Agents', value: '8', icon: Bot, color: 'text-purple-600' },
    { name: 'Pending Signals', value: '124', icon: Radio, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tighter">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className={`mb-4 ${stat.color}`}>
              <stat.icon size={32} />
            </div>
            <div className="text-sm text-gray-500">{stat.name}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
