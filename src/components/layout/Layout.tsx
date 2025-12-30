import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>MicroPost — A production-ready microposting platform demo</p>
          <p className="mt-1 text-xs">
            Built with React, TypeScript, and clean architecture principles
          </p>
        </div>
      </footer>
    </div>
  );
};
