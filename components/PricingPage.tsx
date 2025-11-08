import React from 'react';
import Button from './Button';
import { CheckIcon } from './icons/CheckIcon';
import { StripeIcon } from './icons/StripeIcon';

interface PricingPageProps {
    onSelectPlan: (plan: string) => void;
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <CheckIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-1" />
        <span className="text-gray-300">{children}</span>
    </li>
);

const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Find the Perfect Plan</h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for your creative journey, from personal memories to professional productions.
        </p>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Free Plan */}
        <div className="border border-white/10 bg-gray-800/60 backdrop-blur-md rounded-lg p-8 flex flex-col">
          <h3 className="text-2xl font-bold">Free</h3>
          <p className="mt-2 text-gray-400 h-12">Create your first story for free.</p>
          <p className="mt-6 text-4xl font-bold">Free</p>
          <ul className="mt-8 space-y-4 text-gray-300">
            <PlanFeature>1 video export</PlanFeature>
            <PlanFeature>Standard 720p resolution</PlanFeature>
            <PlanFeature>Standard render queue</PlanFeature>
            <PlanFeature>Community support</PlanFeature>
          </ul>
          <Button onClick={() => onSelectPlan('Free')} variant="secondary" className="mt-auto w-full">Get Started</Button>
        </div>

        {/* Basic Plan */}
        <div className="border border-white/10 bg-gray-800/60 backdrop-blur-md rounded-lg p-8 flex flex-col">
          <h3 className="text-2xl font-bold">Basic</h3>
          <p className="mt-2 text-gray-400 h-12">For personal projects and getting started.</p>
          <p className="mt-6 text-4xl font-bold">$12<span className="text-xl font-medium text-gray-400">/mo</span></p>
          <ul className="mt-8 space-y-4 text-gray-300">
            <PlanFeature>Up to 5 video exports/month</PlanFeature>
            <PlanFeature>Standard 720p resolution</PlanFeature>
            <PlanFeature>Standard render queue</PlanFeature>
            <PlanFeature>Community support</PlanFeature>
          </ul>
          <Button onClick={() => onSelectPlan('Basic')} variant="secondary" className="mt-auto w-full">Choose Basic</Button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-blue-500 bg-gray-800/80 backdrop-blur-md rounded-lg p-8 flex flex-col relative lg:scale-105">
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold tracking-wide text-white bg-blue-600 rounded-full shadow-lg">Most Popular</div>
          <h3 className="text-2xl font-bold text-blue-400">Pro</h3>
          <p className="mt-2 text-gray-400 h-12">For frequent creators and delivering high-quality family films.</p>
          <p className="mt-6 text-4xl font-bold">$29<span className="text-xl font-medium text-gray-400">/mo</span></p>
          <ul className="mt-8 space-y-4 text-gray-300">
            <PlanFeature>Up to 20 video exports/month</PlanFeature>
            <PlanFeature>Full HD 1080p resolution</PlanFeature>
            <PlanFeature>Priority render queue</PlanFeature>
            <PlanFeature>Email & chat support</PlanFeature>
            <PlanFeature>Access to beta features</PlanFeature>
          </ul>
          <Button onClick={() => onSelectPlan('Pro')} className="mt-auto w-full">Choose Pro</Button>
        </div>
        
        {/* Business Plan */}
        <div className="border border-white/10 bg-gray-800/60 backdrop-blur-md rounded-lg p-8 flex flex-col">
          <h3 className="text-2xl font-bold">Business</h3>
          <p className="mt-2 text-gray-400 h-12">For professionals and agencies creating content for clients.</p>
          <p className="mt-6 text-4xl font-bold">$79<span className="text-xl font-medium text-gray-400">/mo</span></p>
          <ul className="mt-8 space-y-4 text-gray-300">
            <PlanFeature>Unlimited video exports</PlanFeature>
            <PlanFeature>4K Ultra HD resolution</PlanFeature>
            <PlanFeature>Highest priority render queue</PlanFeature>
            <PlanFeature>Dedicated support</PlanFeature>
            <PlanFeature>Commercial license</PlanFeature>
          </ul>
          <Button onClick={() => onSelectPlan('Business')} variant="secondary" className="mt-auto w-full">Choose Business</Button>
        </div>

      </div>
      <div className="mt-12 flex justify-center items-center">
        <p className="text-sm text-gray-500">Secure payments by</p>
        <StripeIcon className="w-16 h-auto ml-2 text-gray-400" />
      </div>
    </div>
  );
};

export default PricingPage;