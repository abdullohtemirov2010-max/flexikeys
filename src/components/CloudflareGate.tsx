import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const CloudflareGate: React.FC<Props> = ({ onComplete }) => {
  const [state, setState] = useState<'idle' | 'checking' | 'passed'>('idle');
  const [rayId] = useState(
    () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8)
  );

  const startCheck = () => {
    if (state !== 'idle') return;
    setState('checking');
    setTimeout(() => setState('passed'), 1600);
    setTimeout(() => onComplete(), 2600);
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen flex flex-col items-center justify-center px-6 bg-[#f4f4f4] dark:bg-[#1a1a1a]">
      <div className="w-full max-w-md bg-white dark:bg-[#262626] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            flexikeys.app needs to review the security of your connection before proceeding.
          </p>
        </div>

        <div className="px-6 py-8 flex items-center justify-between bg-gray-50 dark:bg-[#1f1f1f]">
          <div className="flex items-center gap-4">
            {state === 'idle' && (
              <button
                onClick={startCheck}
                aria-label="Verify you are human"
                className="w-7 h-7 rounded border-2 border-gray-400 bg-white hover:border-[#f6821f] transition-colors flex-shrink-0 cursor-pointer"
              />
            )}
            {state === 'checking' && (
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <span className="w-6 h-6 border-[3px] border-[#f6821f] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {state === 'passed' && (
              <div className="w-7 h-7 rounded bg-[#f6821f] flex items-center justify-center flex-shrink-0 animate-scale-in">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <span className="text-base text-gray-800 dark:text-gray-100 font-medium">
              {state === 'idle' && 'Verify you are human'}
              {state === 'checking' && 'Verifying…'}
              {state === 'passed' && 'Success!'}
            </span>
          </div>

          <div className="flex flex-col items-end text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[#f6821f] text-xl leading-none">☁</span>
              <span className="font-bold text-gray-700 dark:text-gray-200 text-xs">CLOUDFLARE</span>
            </div>
            <div className="flex gap-2 mt-0.5">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Terms</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
          Ray ID: {rayId}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
        Performance &amp; security by <span className="font-semibold text-gray-700 dark:text-gray-300">Cloudflare</span>
      </p>
    </div>
  );
};

export default CloudflareGate;
