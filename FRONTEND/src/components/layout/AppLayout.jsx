import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
