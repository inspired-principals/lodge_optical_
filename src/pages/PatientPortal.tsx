import React from 'react';

export default function PatientPortal() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Patient Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Prescriptions</h2>
          <p className="text-gray-600 dark:text-gray-300">View and manage your active prescriptions.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Track Orders</h2>
          <p className="text-gray-600 dark:text-gray-300">Check the status of your eyewear orders.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
          <p className="text-gray-600 dark:text-gray-300">Schedule your next eye exam.</p>
        </div>
      </div>
    </div>
  );
}
