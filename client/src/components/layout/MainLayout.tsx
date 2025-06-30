// src/components/layout/MainLayout.tsx
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom'; // For rendering child routes

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Child routes will render here */}
      </main>
      <Footer />
    </div>
  );
}