import * as React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useToast } from '@/src/components/ui/Toast';

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast("Message envoyé avec succès ! Notre équipe vous répondra sous peu.", "success");
    }, 1500);
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Contact Info */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tight leading-none text-pl-purple">
              Contactez-nous
            </h1>
            <p className="text-text-secondary text-lg max-w-md font-medium">
              Une question ? Un problème ? Ou simplement envie de discuter ? Notre équipe est là pour vous aider.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-accent-green group-hover:border-accent-green transition-all">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Email</p>
                <p className="text-lg font-bold text-pl-purple">contact@takwira.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-accent-green group-hover:border-accent-green transition-all">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Téléphone</p>
                <p className="text-lg font-bold text-pl-purple">+216 71 000 000</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-accent-green group-hover:border-accent-green transition-all">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Bureau</p>
                <p className="text-lg font-bold text-pl-purple">Les Berges du Lac, Tunis, Tunisie</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <button key={i} className="w-12 h-12 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent-green hover:border-accent-green transition-all">
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Contact Form */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-8 md:p-10 bg-background-card border-border-subtle relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-green" />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="Nom complet" placeholder="Ahmed Skhiri" required />
                 <Input label="Email" type="email" placeholder="ahmed@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary ml-1">Sujet</label>
                <select className="w-full bg-background-secondary border border-border-subtle rounded-xl h-12 px-4 focus:border-pl-purple outline-none text-text-primary appearance-none transition-all">
                  <option>Support technique</option>
                  <option>Partenariat complexe</option>
                  <option>Publicité</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-text-secondary ml-1">Message</label>
                 <textarea 
                  required
                  className="w-full bg-background-secondary border border-border-subtle rounded-xl p-4 min-h-[150px] focus:border-pl-purple outline-none text-text-primary resize-none transition-all"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 font-black uppercase tracking-widest gap-2">
                {isSubmitting ? "Envoi..." : (
                  <>Envoyer <Send size={18} /></>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
