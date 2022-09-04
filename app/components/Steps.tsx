/* This example requires Tailwind CSS v2.0+ */
import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { Link } from '@remix-run/react';
import classNames from 'classnames';

export interface Step {
  id: string;
  name: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
  disabled?: boolean;
}

export interface StepsProps {
  steps: Step[];
}

export const Steps: React.FC<StepsProps> = ({ steps }) => {
  return (
    <nav className="mb-4 sm:mb-8" aria-label="Progress">
      <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative md:flex md:flex-1">
            {step.status === 'complete' ? (
              <StepWrapper step={step} className="group flex w-full items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 group-hover:bg-primary-800">
                    <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </StepWrapper>
            ) : step.status === 'current' ? (
              <StepWrapper step={step} className="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary-600">
                  <span className="text-primary-600">{step.id}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-primary-600">{step.name}</span>
              </StepWrapper>
            ) : (
              <StepWrapper step={step} className="group flex items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span
                    className={classNames(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300',
                      !step.disabled ? 'group-hover:border-gray-400' : null
                    )}
                  >
                    <span className={classNames('text-gray-500', !step.disabled ? 'group-hover:text-gray-900' : '')}>
                      {step.id}
                    </span>
                  </span>
                  <span
                    className={classNames(
                      'ml-4 text-sm font-medium text-gray-500',
                      !step.disabled ? 'group-hover:text-gray-900' : null
                    )}
                  >
                    {step.name}
                  </span>
                </span>
              </StepWrapper>
            )}

            {stepIdx !== steps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div className="absolute top-0 right-0 hidden h-full w-5 md:block" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const StepWrapper: React.FC<{ step: Step; children: React.ReactNode; className?: string }> = ({
  step,
  children,
  className,
}) => {
  return step.disabled ? (
    <span className={className}>{children}</span>
  ) : (
    <Link className={className} to={step.href}>
      {children}
    </Link>
  );
};
