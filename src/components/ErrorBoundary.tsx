import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 text-white">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-background-card border border-border-subtle rounded-[40px] p-10 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-danger/20">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-display font-black uppercase italic text-white tracking-tight">Oups ! Quelque chose s'est mal passé</h1>
              <p className="text-text-tertiary text-sm leading-relaxed">
                Une erreur inattendue est survenue. Ne vous inquiétez pas, vos données sont en sécurité.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={this.handleRetry} className="h-14 uppercase font-black tracking-widest gap-2">
                <RotateCcw size={18} /> Réessayer
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'} className="h-14 uppercase font-black tracking-widest text-text-tertiary gap-2">
                <Home size={18} /> Retourner à l'accueil
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
