"use client";

import { AnimatedBackground } from "./AnimatedBackground";

interface WelcomePageProps {
  onConnect: () => void;
}

export const WelcomePage = ({ onConnect }: WelcomePageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Shadow Ledger
            </h1>
            <p className="text-xl md:text-2xl text-textSecondary">
              Privacy-Preserving Bill Recording System
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Encrypted Storage</h3>
              <p className="text-sm text-textSecondary">
                Your bill amounts are encrypted using FHEVM technology
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">Statistics</h3>
              <p className="text-sm text-textSecondary">
                View aggregated statistics and charts of your spending
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-sm text-textSecondary">
                Only you can decrypt and view your private bill data
              </p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="mt-12">
            <button
              onClick={onConnect}
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
            >
              Connect Wallet to Get Started
            </button>
            <p className="text-sm text-textSecondary mt-4">
              Connect your MetaMask wallet to start recording bills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


