import React from 'react';

export default function DoctorPortal() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Doctor's Referral Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <p className="text-gray-600 dark:text-gray-300">Load and manage patient records.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Clinical Notes</h2>
          <p className="text-gray-600 dark:text-gray-300">Add and review clinical notes.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Message Staff</h2>
          <p className="text-gray-600 dark:text-gray-300">Secure communication with our team.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Message Patient</h2>
          <p className="text-gray-600 dark:text-gray-300">Direct patient communication.</p>
        </div>
      </div>
    </div>
  );
}
