import React from 'react';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-600 dark:text-gray-300">Welcome to your profile page.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/patient-portal" className="bg-primary-blue text-white p-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all">
          <h2 className="text-xl font-bold mb-2">Patient Portal</h2>
          <p className="opacity-80">View prescriptions, track orders, and book appointments.</p>
        </Link>
        <Link to="/doctor-portal" className="bg-accent-gold text-white p-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all">
          <h2 className="text-xl font-bold mb-2">Doctor's Referral Portal</h2>
          <p className="opacity-80">Manage patient referrals, notes, and communications.</p>
        </Link>
      </div>
    </div>
  );
}
