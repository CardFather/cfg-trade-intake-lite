import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">CFG Trade Intake</h1>
        <nav className="text-sm">
          <Link className="mr-4 underline" href="/">Queue</Link>
          <Link className="underline" href="/new">New Intake</Link>
        </nav>
      </header>
      {children}
      <footer className="mt-12 text-xs text-gray-500">© Card Father Games</footer>
    </div>
  );
}
