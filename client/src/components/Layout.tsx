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
    <div className="min-h-screen bg-background text-foreground">
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
    </div>
  );
}
