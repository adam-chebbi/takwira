import * as React from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Mail, 
  Globe, 
  Save, 
  AlertCircle,
  Bell,
  Database,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Switch } from '@/src/components/ui/Switch';
import { useToast } from '@/src/components/ui/Toast';
import { Modal } from '@/src/components/ui/Modal';

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

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = React.useState(false);
  const [pendingMaintenanceValue, setPendingMaintenanceValue] = React.useState(false);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const onMaintenanceToggle = (value: boolean) => {
    if (value) {
      setPendingMaintenanceValue(true);
      setIsMaintenanceModalOpen(true);
    } else {
      setSettings({ ...settings, maintenanceMode: false });
    }
  };

  const confirmMaintenance = () => {
    setSettings({ ...settings, maintenanceMode: true });
    setIsMaintenanceModalOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-accent-green" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-12">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Paramètres Plateforme</h1>
         <Button 
            form="settings-form"
            loading={saving}
            onClick={() => handleSave()}
            className="bg-accent-green text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-[0_10px_20px_-10px_rgba(20,255,100,0.3)]"
         >
            <Save size={14} className="mr-2" /> Enregistrer
         </Button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-8">
         {/* Maintenance Section */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-6 shadow-xl">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                  <ShieldAlert size={28} />
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">Mode Maintenance</h3>
                  <p className="text-xs text-text-tertiary">Activer pour bloquer l'accès à la plateforme pendant les mises à jour majeures.</p>
               </div>
               <div className="ml-auto">
                  <Switch 
                     checked={settings.maintenanceMode}
                     onCheckedChange={onMaintenanceToggle}
                  />
               </div>
            </div>
            
            {settings.maintenanceMode && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle size={16} /> Attention: La plateforme est actuellement invisible pour les utilisateurs publics.
              </div>
            )}
         </div>

         {/* General Settings */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
               <Globe size={14} /> Identité de la plateforme
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Nom de la plateforme</label>
                  <input 
                     type="text"
                     value={settings.platformName}
                     onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                     className="w-full h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-accent-green transition-all"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Email de contact</label>
                  <input 
                     type="email"
                     value={settings.contactEmail}
                     onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                     className="w-full h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-accent-green transition-all"
                  />
               </div>
            </div>
         </div>

         {/* Governance Settings */}
         <div className="p-8 bg-background-card border border-border-subtle rounded-[40px] space-y-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
               <Database size={14} /> Règles de gouvernance
            </h3>

            <div className="space-y-6 max-w-sm">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-4">Réservations max / utilisateur / semaine</label>
                  <div className="flex items-center gap-4">
                     <input 
                        type="number"
                        value={settings.maxReservationsPerWeek}
                        onChange={(e) => setSettings({...settings, maxReservationsPerWeek: parseInt(e.target.value) || 0})}
                        className="flex-1 h-14 bg-background-secondary border border-border-subtle rounded-3xl px-6 text-sm text-white focus:outline-none focus:border-accent-green transition-all"
                     />
                     <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Sessions</span>
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-2 ml-4 italic px-4 py-2 bg-background-secondary/50 rounded-xl border border-border-subtle/50">
                    Empêche le spam et assure une distribution équitable des créneaux horaires.
                  </p>
               </div>
            </div>
         </div>
      </form>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isMaintenanceModalOpen} 
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Activer le mode maintenance ?"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-[28px] text-red-200">
             <AlertTriangle size={40} className="text-red-500 shrink-0" />
             <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-tight">Attention immédiate</p>
                <p className="text-[11px] leading-relaxed opacity-80">
                  Cela rendra le site inaccessible à tous les utilisateurs non-admin. Tous les joueurs seront redirigés vers une page de maintenance.
                </p>
             </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              fullWidth
              className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              onClick={() => setIsMaintenanceModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              fullWidth
              className="h-12 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
              onClick={confirmMaintenance}
            >
              Confirmer l'arrêt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
