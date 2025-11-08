import React from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface StepIndicatorProps {
  currentStep: number;
  stepNames: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, stepNames }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {stepNames.map((name, index) => (
          <li key={name} className="md:flex-1">
            {index < currentStep ? (
              <div className="group flex w-full flex-col border-l-4 border-blue-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-blue-600 flex items-center">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  {`Step ${index + 1}`}
                </span>
                <span className="text-sm font-medium text-gray-300">{name}</span>
              </div>
            ) : index === currentStep ? (
              <div
                className="flex w-full flex-col border-l-4 border-blue-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                aria-current="step"
              >
                <span className="text-sm font-medium text-blue-500">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium text-white">{name}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col border-l-4 border-gray-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-gray-500">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium text-gray-400">{name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;