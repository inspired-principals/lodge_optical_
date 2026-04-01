import React from 'react';

interface ConditionProps {
  key?: React.Key;
  title: string;
  description: string;
}

export function ConditionCard({ title, description }: ConditionProps) {
  return (
    <div className="p-8 bg-white rounded-2xl border-light shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
