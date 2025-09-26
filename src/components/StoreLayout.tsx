import { ReactNode } from "react";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";

interface StoreLayoutProps {
  children: ReactNode;
}

export const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
};