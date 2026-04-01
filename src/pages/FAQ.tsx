import React from 'react';
import { motion } from 'motion/react';

export default function FAQ() {
  const faqs = [
    {
      question: "How often should I get an eye exam?",
      answer: "Generally, adults should have an eye exam every 1-2 years, depending on their age, risk factors, and whether they wear corrective lenses."
    },
    {
      question: "What are the signs that I need glasses?",
      answer: "Common signs include squinting, headaches, eye strain, difficulty seeing at night, and blurred vision at distance or near."
    },
    {
      question: "Do you accept vision insurance?",
      answer: "Yes, we accept a wide range of vision insurance plans. Please contact our office with your insurance details so we can verify your coverage."
    },
    {
      question: "How do I care for my contact lenses?",
      answer: "Always wash your hands before handling lenses, use the recommended cleaning solution, and never wear them longer than prescribed."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 min-h-screen bg-bg-light-gray"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-primary-blue mb-4">
            Frequently Asked Questions
          </h1>
          <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-primary-blue mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
