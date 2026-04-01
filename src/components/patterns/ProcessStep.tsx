import React from 'react';

interface StepProps {
  key?: React.Key;
  number: number;
  title: string;
  description: string;
}

export function ProcessStep({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  );
}
