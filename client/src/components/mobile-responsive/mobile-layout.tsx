import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function MobileLayout({ children, sidebar }: MobileLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        {sidebar}
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col lg:hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Bitumen Company</h1>
          <div></div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        {children}
      </div>
    </div>
  );
}