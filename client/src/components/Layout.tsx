import { useState } from "react";
import { Header } from "./Header";
import { DrawerMenu } from "./DrawerMenu";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Layout({ children, activeSection, onSectionChange }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Header onMenuClick={() => setIsDrawerOpen(true)} />
      
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      
      <main className="p-4">
        {children}
      </main>
      
      <BottomNavigation
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      
      {/* Subtle creator watermark */}
      <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/40 pointer-events-none select-none z-10">
        Built by Dallas Abbott
      </div>
    </div>
  );
}
