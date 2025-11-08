import React from 'react';
import Button from './Button';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { UsersIcon, GlobeIcon, BookOpenIcon, FilmIcon } from './icons';

interface LandingPageProps {
  onStart: () => void;
  onNavigateToPricing: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/60 backdrop-blur-md border border-white/10 rounded-lg p-6">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; avatar: string; }> = ({ quote, name, role, avatar }) => (
    <div className="bg-gray-800/60 backdrop-blur-md border border-white/10 rounded-lg p-6 flex flex-col h-full">
        <p className="text-gray-300 flex-grow">"{quote}"</p>
        <div className="mt-4 flex items-center">
            <img className="h-12 w-12 rounded-full object-cover" src={avatar} alt={name} />
            <div className="ml-4">
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigateToPricing }) => {

  return (
    <div className="space-y-24 sm:space-y-32 lg:space-y-40 pb-16">
      {/* Hero Section */}
      <div className="text-center pt-16 sm:pt-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-transparent bg-clip-text">
          Turn your family into a 3D cartoon.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
          Create a personalized, 3D animated short film from your family photos. A magical story you can cherish forever.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={onStart}
                    size="lg"
                    className="shadow-lg shadow-blue-500/20"
                >
                    Start Creating Your Story
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
      </div>
      
      {/* How it Works Section */}
       <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center">Bring Your Story to Life in 4 Easy Steps</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                <FeatureCard icon={<UsersIcon className="h-6 w-6 text-blue-300" />} title="1. Create Characters">
                    Upload photos to create 3D avatars of your family.
                </FeatureCard>
                <FeatureCard icon={<GlobeIcon className="h-6 w-6 text-blue-300" />} title="2. Design World">
                    Choose a style and setting for your story.
                </FeatureCard>
                <FeatureCard icon={<BookOpenIcon className="h-6 w-6 text-blue-300" />} title="3. Write Story">
                    Select a template or create a custom adventure.
                </FeatureCard>
                <FeatureCard icon={<FilmIcon className="h-6 w-6 text-blue-300" />} title="4. Render & Share">
                    Generate your final 3D film and share it!
                </FeatureCard>
            </div>
      </div>
      
       {/* Testimonials Section */}
      <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center">Loved by Families Everywhere</h2>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="I cried watching the final video. It captured my kids' personalities perfectly. This is a memory we'll treasure forever."
                name="Sarah J."
                role="Mom of Two"
                avatar="https://i.pravatar.cc/150?u=sarah"
              />
              <TestimonialCard 
                quote="The process was so simple and fun! My son keeps asking to watch 'his movie' over and over again. An absolute 10/10."
                name="Michael B."
                role="Dad & Tech Enthusiast"
                avatar="https://i.pravatar.cc/150?u=michael"
              />
              <TestimonialCard 
                quote="As a gift for my parents' anniversary, I turned their old photos into a story. They were blown away. Truly a magical and unique present."
                name="Emily R."
                role="Creative Gifter"
                avatar="https://i.pravatar.cc/150?u=emily"
              />
          </div>
      </div>

       {/* Final CTA Section */}
       <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Ready to Create Your Masterpiece?</h2>
          <p className="mt-4 text-gray-400">
            Start your family's next great adventure today. Transform your precious memories into an animated film that will last a lifetime.
          </p>
          <div className="mt-8">
             <Button onClick={onStart} size="lg" className="shadow-lg shadow-blue-500/20">
                Create Your Free Story
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
       </div>

    </div>
  );
};

export default LandingPage;