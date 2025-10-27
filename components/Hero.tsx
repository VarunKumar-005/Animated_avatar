import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 z-0"></div>
      <div className="absolute inset-0 opacity-30">{[...Array(20)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }}/>))}</div>
      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
          Discover the Ultimate Learning Avatars
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Immerse yourself in a cutting-edge AR/VR learning experience with personalized AI-powered avatars. Unlock your full potential and master new skills in a fun, interactive, and engaging way.
        </p>
        <button className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 bg-purple-600 hover:bg-purple-500">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;
