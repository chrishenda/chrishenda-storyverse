import React from 'react';
import Button from './Button';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-8">
        <h1 className="text-4xl font-extrabold text-white text-center">Get in Touch</h1>
        <p className="mt-4 text-lg text-gray-300 text-center">
          Have questions, feedback, or need support? We'd love to hear from you.
        </p>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
            <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Email Us</h3>
                <p className="text-gray-400 mt-1">For general inquiries and support.</p>
                <a href="mailto:support@storyverse.ai" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">support@storyverse.ai</a>
            </div>
             <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Press & Media</h3>
                <p className="text-gray-400 mt-1">For press and media relations.</p>
                <a href="mailto:media@storyverse.ai" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">media@storyverse.ai</a>
            </div>
        </div>

        <div className="mt-12">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Your Name</label>
                    <input type="text" id="name" required className="mt-1 w-full bg-gray-700/80 border-gray-600/80 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Your Email</label>
                    <input type="email" id="email" required className="mt-1 w-full bg-gray-700/80 border-gray-600/80 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                    <textarea id="message" rows={5} required className="mt-1 w-full bg-gray-700/80 border-gray-600/80 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div className="text-center">
                    <Button type="submit">Send Message</Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
