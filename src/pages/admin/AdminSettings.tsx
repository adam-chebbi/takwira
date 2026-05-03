import * as React from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { 
  Settings, 
  ShieldAlert, 
  Mail, 
  Globe, 
  Save, 
  AlertCircle,
  Bell,
  Database
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Switch } from '@/src/components/ui/Switch';
import { useToast } from '@/src/components/ui/Toast';

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState({
    maintenanceMode: false,
    platformName: 'Takwira.com',
    contactEmail: 'contact@takwira.com',
    maxReservationsPerWeek: 3
  });

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'platform'), settings, { merge: true });
      toast.success('Paramètres mis à jour avec succès');
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl space-y-12">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Paramètres Plateforme</h1>
         <Button 
            form="settings-form"
            loading={saving}
            className="bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8"
         >
            <Save size={14} className="mr-2" /> Enregistrer les modifications
         </Button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-8">
         {/* Maintenance Section */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Mode Maintenance</h3>
                  <p className="text-xs text-text-tertiary">Activer pour bloquer l'accès à la plateforme pendant les mises à jour.</p>
               </div>
               <div className="ml-auto">
                  <Switch 
                     checked={settings.maintenanceMode}
                     onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})}
                  />
               </div>
            </div>
            
            {settings.maintenanceMode && (
              <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-bold animate-pulse">
                <AlertCircle size={14} /> Attention: La plateforme est actuellement invisible pour les utilisateurs publics.
              </div>
            )}
         </div>

         {/* General Settings */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
               <Globe size={14} /> Identité de la plateforme
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Nom de la plateforme</label>
                  <input 
                     type="text"
                     value={settings.platformName}
                     onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                     className="w-full h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Email de contact</label>
                  <input 
                     type="email"
                     value={settings.contactEmail}
                     onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                     className="w-full h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
               </div>
            </div>
         </div>

         {/* Governance Settings */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
               <Database size={14} /> Règles de gouvernance
            </h3>

            <div className="space-y-6 max-w-md">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Réservations max par utilisateur / semaine</label>
                  <div className="flex items-center gap-4">
                     <input 
                        type="number"
                        value={settings.maxReservationsPerWeek}
                        onChange={(e) => setSettings({...settings, maxReservationsPerWeek: parseInt(e.target.value) || 0})}
                        className="flex-1 h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-blue-500/50"
                     />
                     <span className="text-xs text-text-tertiary font-bold lowercase">Sessions</span>
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-2 ml-4 italic">Empêche le spam et assure une équité entre les joueurs.</p>
               </div>
            </div>
         </div>
      </form>
    </div>
  );
}
