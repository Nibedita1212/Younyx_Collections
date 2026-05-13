"use client";

import React from "react";

export default function PolicyLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#021b1a] flex justify-center py-14 text-white">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-amber-400">{title}</h1>
        <p className="text-gray-300 mt-2">{subtitle}</p>

        <div className="mt-8 bg-[#062c2a] border border-amber-400/20 rounded-2xl p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
