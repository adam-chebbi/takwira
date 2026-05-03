import * as React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Camera, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck,
  CreditCard,
  Bell,
  Palette
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

import { useAuth } from '@/src/contexts/AuthContext';
import { useManagerComplex } from '@/src/hooks/useManagerComplex';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function DashboardSettings() {
  const { user } = useAuth();
  const { complex, isLoading } = useManagerComplex(user?.uid);
  const [activeTab, setActiveTab] = React.useState<'complex' | 'profile' | 'billing' | 'notifications'>('complex');
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    cityName: '', // Added for profile
    fullName: ''   // Added for profile
  });

  React.useEffect(() => {
    if (complex) {
      setFormData(prev => ({
        ...prev,
        name: complex.name,
        address: complex.address,
        description: complex.description || ''
      }));
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        cityName: '', // Would need to fetch from users collection if not in auth
      }));
    }
  }, [complex, user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      if (activeTab === 'complex' && complex) {
        await updateDoc(doc(db, 'complexes', complex.id), {
          name: formData.name,
          address: formData.address,
          description: formData.description
        });
      } else if (activeTab === 'profile') {
        await updateDoc(doc(db, 'users', user.uid), {
          name: formData.fullName,
          city: formData.cityName
        });
      }
      alert("Paramètres enregistrés !");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (isLoading) return <div className="p-10 animate-pulse bg-background-secondary h-screen" />;

  return (
    <div className="p-6 md:p-10 space-y-12 text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white">Paramètres</h1>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Gère les détails de ton complexe et ton compte</p>
        </div>
        <Button 
          onClick={handleSave}
          className="h-12 px-8 uppercase font-black text-xs tracking-widest gap-2 shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
        >
          <Save size={18} /> Enregistrer
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Nav */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'profile', label: 'Mon Profil', icon: ShieldCheck },
            { id: 'complex', label: 'Mon Complexe', icon: Building2 },
            { id: 'billing', label: 'Facturation', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border font-black uppercase text-[10px] tracking-[0.2em]",
                activeTab === tab.id 
                  ? "bg-accent-green border-accent-green text-black" 
                  : "bg-background-secondary border-border-subtle text-text-tertiary hover:border-accent-green/30 hover:text-white"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Right Content */}
        <div className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-3xl">
              <Card className="p-8 space-y-8 bg-background-card border-border-subtle">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent-green rounded-full" />
                   <h2 className="text-xl font-display font-black uppercase tracking-tight">Mon Profil</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom Complet</label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ville</label>
                      <input 
                        type="text" 
                        value={formData.cityName}
                        onChange={(e) => setFormData({...formData, cityName: e.target.value})}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                   </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'complex' && (
            <div className="space-y-8 max-w-3xl">
              {/* Complex Info */}
              <Card className="p-8 space-y-8 bg-background-card border-border-subtle">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent-green rounded-full" />
                   <h2 className="text-xl font-display font-black uppercase tracking-tight">Informations Générales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom du complexe</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Téléphone Contact</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Adresse</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input 
                          type="text" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                        />
                      </div>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Description</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full h-32 bg-background-secondary border border-border-subtle rounded-xl p-4 text-sm focus:border-accent-green outline-none text-white transition-all resize-none"
                      />
                   </div>
                </div>
              </Card>

              {/* Photos Management */}
              <Card className="p-8 space-y-8 bg-background-card border-border-subtle">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-accent-green rounded-full" />
                      <h2 className="text-xl font-display font-black uppercase tracking-tight">Photos du complexe</h2>
                   </div>
                   <Button variant="outline" size="sm" className="h-10 text-[9px] font-black border-border-subtle gap-2">
                      <Camera size={14} /> Ajouter
                   </Button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {complex?.photos?.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group border border-border-subtle">
                         <img src={photo} className="w-full h-full object-cover" alt="" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="w-8 h-8 rounded-lg bg-danger/80 text-white flex items-center justify-center hover:bg-danger transition-colors">
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    ))}
                    <button className="aspect-square rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 text-text-tertiary hover:border-accent-green hover:text-accent-green transition-all bg-background-secondary/20">
                       <Plus size={24} />
                       <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                    </button>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
             <div className="space-y-8 max-w-3xl">
                <Card className="p-12 text-center border-border-subtle bg-background-card space-y-6">
                   <div className="w-20 h-20 rounded-3xl bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-4 border border-accent-green/20">
                      <ShieldCheck size={40} />
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-3xl font-display font-black uppercase tracking-tight">Version Pro</h2>
                      <p className="text-text-secondary text-sm max-w-sm mx-auto">Ton abonnement est géré par Takwira Partner. Tous les frais de plateforme sont inclus.</p>
                   </div>
                   <Badge className="bg-accent-green text-black font-black uppercase tracking-widest px-6 h-8 text-[10px]">Compte Premium</Badge>
                   
                   <div className="pt-8 border-t border-border-subtle">
                      <Button variant="outline" className="h-12 border-border-subtle text-xs font-black uppercase tracking-widest">Voir mes factures</Button>
                   </div>
                </Card>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
