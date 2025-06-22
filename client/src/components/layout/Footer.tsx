// src/components/layout/Footer.tsx
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card text-card-foreground border-t py-8 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          © {currentYear} Stocker.AI. All rights reserved.
        </p>
        {/* Add other footer links or info here if needed */}
      </div>
    </footer>
  );
}