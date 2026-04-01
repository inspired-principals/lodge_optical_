import React from 'react';
import { motion } from 'motion/react';
import SquarePayment from '../components/SquarePayment';

interface OrderItem {
  name: string;
  description: string;
  price: number;
}

export default function Checkout() {
  const orderItems: OrderItem[] = [
    { name: 'Comprehensive Eye Exam', description: 'Standard Adult', price: 150.00 },
  ];

  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 min-h-screen bg-bg-light-gray"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-primary-blue mb-4">
            Checkout
          </h1>
          <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 shadow-md border-t-4 border-accent-gold">
              <h2 className="text-xl font-bold uppercase tracking-wider text-primary-blue mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <p className="font-medium text-primary-blue">{item.name}</p>
                      <p className="text-sm text-text-gray">{item.description}</p>
                    </div>
                    <p className="font-bold text-primary-blue">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                <p className="font-bold text-lg text-primary-blue">Total</p>
                <p className="font-bold text-xl text-accent-gold">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="w-full lg:w-2/3">
            <SquarePayment amount={total} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
