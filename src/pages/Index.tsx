import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Zap, 
  Shield, 
  Database, 
  Code2, 
  ArrowRight,
  Layers,
  Lock,
  Server
} from 'lucide-react';
import HLDimg from '../../assets/imgs/HLD.png'

const features = [
  {
    icon: Shield,
    title: 'Production Security',
    description: 'Password hashing, JWT auth, account lockout, and user enumeration prevention.',
  },
  {
    icon: Database,
    title: 'Clean Architecture',
    description: 'MVC pattern with clear separation between models, controllers, and repositories.',
  },
  {
    icon: Layers,
    title: 'Caching Layer',
    description: 'Mock cache-aside pattern demonstrating Redis-like behavior for performance.',
  },
  {
    icon: Lock,
    title: 'Authorization',
    description: 'Model-level authorization ensures users can only modify their own content.',
  },
  {
    icon: Server,
    title: 'Mock Infrastructure',
    description: 'In-memory database and cache that map directly to production systems.',
  },
  {
    icon: Code2,
    title: 'Type Safety',
    description: 'Full TypeScript with domain types, error classes, and validation.',
  },
];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
        
        <div className="container relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Production-Ready Architecture Demo</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
              MicroPost
              <span className="block gradient-text mt-2">Clean. Secure. Scalable.</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              A demonstration of production-grade microposting architecture with mocked infrastructure. 
              Built with React, TypeScript, and clean architecture principles.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {isAuthenticated ? (
                <Link to="/feed">
                  <Button variant="glow" size="lg" className="gap-2 w-full sm:w-auto">
                    Go to Feed
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="glow" size="lg" className="gap-2 w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {!isAuthenticated && (
              <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
                Demo credentials: <code className="text-primary">alice@example.com</code> / <code className="text-primary">password123</code>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Architecture Highlights</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              This demo showcases how to build a production-ready application with proper separation of concerns.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="glass" 
                className="group hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-24 border-t border-border bg-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">System Architecture</h2>
            <p className="mt-4 text-muted-foreground">
              A clear view of how components interact
            </p>
          </div>
          
          <Card variant="glass" className="p-8 max-w-4xl mx-auto">
            <pre className="text-sm text-muted-foreground overflow-x-auto font-mono">
              <img src={HLDimg}/>
{`
All infrastructure is mocked in-memory for this demo.
In production: Replace with PostgreSQL, Redis, etc.`}
            </pre>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
