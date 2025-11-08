import React from 'react';

const AboutPage: React.FC = () => {
    const teamMembers = [
        { name: 'Alex Chen', role: 'Founder & CEO', avatar: 'https://i.pravatar.cc/150?u=alex' },
        { name: 'Brenda Li', role: 'Lead 3D Artist', avatar: 'https://i.pravatar.cc/150?u=brenda' },
        { name: 'Chris Evans', role: 'Head of AI Research', avatar: 'https://i.pravatar.cc/150?u=chris' },
    ];
    
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-8 text-center">
        <h1 className="text-4xl font-extrabold text-white">About Chrishenda StoryVerse</h1>
        <p className="mt-4 text-lg text-gray-300">
          We believe every family has a story worth telling. Our mission is to provide the tools to turn your cherished memories into magical, animated masterpieces that can be shared for generations.
        </p>
      </div>

      <div className="mt-12 bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center">Our Story</h2>
        <p className="mt-6 text-gray-400 leading-relaxed">
          Founded in 2024 by a team of animators, AI researchers, and parents, Chrishenda StoryVerse was born from a simple idea: what if we could step inside our own photos? We were fascinated by the power of new generative AI and passionate about creating technology that brings families closer together. After countless hours of development and fueled by many cups of coffee, we launched a platform that does just that, transforming still photos into vibrant, living stories.
        </p>
        <p className="mt-4 text-gray-400 leading-relaxed">
          Our proprietary pipeline combines the latest in 3D modeling, character rigging, and video generation, all powered by Google's advanced AI models. We're dedicated to making this cutting-edge technology accessible, intuitive, and fun for everyone.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center">Meet the Team</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <div key={member.name} className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center">
              <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto" />
              <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
              <p className="mt-1 text-blue-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
