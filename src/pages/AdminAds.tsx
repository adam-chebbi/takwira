import * as React from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/src/lib/firebase';
import { AdSlot as AdType } from '@/src/lib/schema';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  ExternalLink, 
  BarChart3, 
  MousePointer2, 
  Eye, 
  Clock, 
  X, 
  Upload,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Save,
  Loader2,
  AlertTriangle,
  Megaphone,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AD_POSITIONS = [
  { id: 'blog_list_between', name: 'Bannière Liste Articles', description: 'Entre le 6ème et le 7ème article.', dimensions: '1200x200 px' },
  { id: 'blog_sidebar_top', name: 'Sidebar Haut', description: 'Haut de la barre latérale.', dimensions: '300x300 px' },
  { id: 'blog_sidebar_bottom', name: 'Sidebar Bas', description: 'Bas de la barre latérale.', dimensions: '300x600 px' },
  { id: 'blog_post_inline', name: 'Articles Inline', description: 'Tous les 3 paragraphes.', dimensions: '800x400 px' },
];

export default function AdminAds() {
  const [ads, setAds] = React.useState<AdType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState<AdType | null>(null);
  
  const [totalStats, setTotalStats] = React.useState({
    active: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0
  });

  const [formData, setFormData] = React.useState({
    name: '',
    title: '',
    imageUrl: '',
    linkUrl: '',
    altText: '',
    position: AD_POSITIONS[0].id,
    isActive: true,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: ''
  });

  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, 'adSlots'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdType));
      setAds(adsData);
      
      const active = adsData.filter(a => a.isActive).length;
      const impressions = adsData.reduce((acc, a) => acc + (a.impressionCount || 0), 0);
      const clicks = adsData.reduce((acc, a) => acc + (a.clickCount || 0), 0);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      
      setTotalStats({ active, clicks, impressions, ctr });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (ad?: AdType) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        name: ad.name,
        title: ad.title || '',
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        altText: ad.altText || '',
        position: ad.position,
        isActive: ad.isActive,
        startDate: format((ad.startDate as any).toDate(), 'yyyy-MM-dd'),
        endDate: ad.endDate ? format((ad.endDate as any).toDate(), 'yyyy-MM-dd') : ''
      });
    } else {
      setEditingAd(null);
      setFormData({
        name: '',
        title: '',
        imageUrl: '',
        linkUrl: '',
        altText: '',
        position: AD_POSITIONS[0].id,
        isActive: true,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `ads/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.linkUrl || !formData.name) return;

    setIsSaving(true);
    try {
      if (formData.isActive) {
        const existingActive = ads.filter(a => a.position === formData.position && a.isActive && a.id !== editingAd?.id);
        for (const ad of existingActive) {
          await updateDoc(doc(db, 'adSlots', ad.id), { isActive: false });
        }
      }

      const adData = {
        name: formData.name,
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        altText: formData.altText,
        position: formData.position as any,
        isActive: formData.isActive,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
        updatedAt: serverTimestamp(),
      };

      if (editingAd) {
        await updateDoc(doc(db, 'adSlots', editingAd.id), adData);
      } else {
        const newAdRef = doc(collection(db, 'adSlots'));
        await setDoc(newAdRef, {
          ...adData,
          id: newAdRef.id,
          impressionCount: 0,
          clickCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (ad: AdType) => {
    try {
      await updateDoc(doc(db, 'adSlots', ad.id), { isActive: !ad.isActive });
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
       <Loader2 size={40} className="animate-spin text-accent-green" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                   <Megaphone size={20} />
                </div>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-500 text-[8px] font-black tracking-widest uppercase">Espace Publicitaire</Badge>
             </div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-white leading-none italic">
               ADS MANAGER
            </h1>
            <p className="text-text-tertiary text-sm font-medium max-w-lg">Gérez vos campagnes publicitaires à travers les différentes sections du blog pour maximiser la visibilité de vos partenaires.</p>
          </div>
          
          <Button 
            onClick={() => handleOpenModal()}
            className="h-16 px-10 rounded-3xl bg-accent-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_15px_30px_-10px_rgba(20,255,100,0.4)]"
          >
            <Plus size={20} className="mr-3" /> Créer une campagne
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Campagnes Actives", value: totalStats.active, icon: CheckCircle2, color: "text-accent-green" },
            { label: "Affichages Totaux", value: totalStats.impressions.toLocaleString(), icon: Eye, color: "text-blue-500" },
            { label: "Clics Enregistrés", value: totalStats.clicks.toLocaleString(), icon: MousePointer2, color: "text-purple-500" },
            { label: "CTR Moyen", value: `${totalStats.ctr.toFixed(2)}%`, icon: BarChart3, color: "text-amber-500" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-background-card border border-border-subtle rounded-[32px] shadow-xl relative overflow-hidden"
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center mb-6 border border-border-subtle", stat.color)}>
                <stat.icon size={22} />
              </div>
              <p className="text-3xl font-display font-black text-white mb-1 leading-none">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-tertiary">{stat.label}</p>
              
              <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 blur-3xl rounded-full opacity-5", stat.color.replace('text-', 'bg-'))} />
            </motion.div>
          ))}
        </div>

        {/* Slots Distribution */}
        <div className="space-y-24">
          {AD_POSITIONS.map((pos) => {
            const activeAd = ads.find(a => a.position === pos.id && a.isActive);
            const historicalAds = ads.filter(a => a.position === pos.id && !a.isActive);
            
            return (
              <section key={pos.id} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-indigo-500 pl-6">
                  <div>
                    <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white italic">
                      {pos.name}
                    </h2>
                    <p className="text-xs text-text-tertiary font-medium">{pos.description}</p>
                  </div>
                  <Badge className="bg-background-secondary text-text-tertiary border-border-subtle px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                     Format: {pos.dimensions}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                   <div className="lg:col-span-8">
                     {activeAd ? (
                       <motion.div 
                         layoutId={`ad-${activeAd.id}`}
                         className="bg-background-card border border-accent-green/30 rounded-[40px] overflow-hidden group shadow-2xl"
                       >
                          <div className={cn(
                            "relative overflow-hidden bg-background-secondary group-hover:brightness-110 transition-all duration-500",
                            pos.id.includes('sidebar') ? "aspect-square" : "aspect-[21/9]"
                          )}>
                             <img src={activeAd.imageUrl} className="w-full h-full object-cover" alt="Campaign visual" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                             
                             <div className="absolute top-6 right-6 z-10 flex gap-3">
                               <button 
                                 onClick={() => handleOpenModal(activeAd)}
                                 className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl text-white flex items-center justify-center hover:bg-black/60 hover:scale-110 transition-all border border-white/10"
                               >
                                 <Edit2 size={18} />
                               </button>
                               <button 
                                 onClick={() => handleDeactivate(activeAd)}
                                 className="w-12 h-12 rounded-2xl bg-red-500/20 backdrop-blur-xl text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all border border-red-500/20"
                               >
                                 <PowerOff size={18} />
                               </button>
                             </div>

                             <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                   <Badge className="bg-accent-green text-black text-[8px] font-black uppercase px-2 mb-2">CAMPAGNE ACTIVE</Badge>
                                   <p className="text-xl font-display font-black text-white uppercase italic">{activeAd.name}</p>
                                </div>
                                <div className="flex items-center gap-6 text-white/50">
                                   <div className="text-center">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary leading-none mb-1">CTR</p>
                                      <p className="text-lg font-display font-black text-white">
                                         {activeAd.impressionCount > 0 ? ((activeAd.clickCount / activeAd.impressionCount) * 100).toFixed(1) : 0}%
                                      </p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Impressions</p>
                                <p className="text-xl font-display font-black text-white uppercase">{activeAd.impressionCount || 0}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Clics uniques</p>
                                <p className="text-xl font-display font-black text-white uppercase">{activeAd.clickCount || 0}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Début</p>
                                <p className="text-[12px] font-bold text-white uppercase">{format((activeAd.startDate as any).toDate(), 'dd MMM yyyy', { locale: fr })}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Destimation</p>
                                <a href={activeAd.linkUrl} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-accent-green uppercase flex items-center gap-1 hover:underline truncate max-w-[120px]">
                                   LINK <ExternalLink size={12} />
                                </a>
                             </div>
                          </div>
                       </motion.div>
                     ) : (
                       <button 
                         onClick={() => {
                           setFormData(prev => ({ ...prev, position: pos.id }));
                           setIsModalOpen(true);
                         }}
                         className="w-full aspect-[21/9] border-2 border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 group hover:border-accent-green transition-all hover:bg-accent-green/5 bg-background-card/50"
                       >
                          <div className="w-20 h-20 rounded-3xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:text-accent-green group-hover:scale-110 transition-all">
                             <ImageIcon size={32} />
                          </div>
                          <div className="space-y-1 px-8">
                             <p className="text-sm font-black uppercase tracking-widest text-white">AUCUNE CAMPAGNE ACTIVE</p>
                             <p className="text-[11px] text-text-tertiary max-w-sm">
                                Cliquez ici pour configurer un nouveau visuel pour cet espace publicitaire.
                             </p>
                          </div>
                          <div className="flex items-center gap-2 text-accent-green font-black uppercase text-[10px] tracking-widest">
                             AJOUTER MAINTENANT <ArrowRight size={14} />
                          </div>
                       </button>
                     )}
                   </div>
                   
                   {/* Historical Sidebar */}
                   <div className="lg:col-span-4 h-full">
                      <div className="bg-background-card border border-border-subtle rounded-[40px] p-8 space-y-6 h-full flex flex-col min-h-[400px]">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                            <Clock size={14} /> HISTORIQUE DES CAMPAGNES
                         </h3>
                         
                         <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {historicalAds.map(ad => (
                               <div key={ad.id} className="p-4 bg-background-secondary/30 border border-border-subtle/50 rounded-2xl flex items-center gap-4 group hover:bg-background-secondary transition-colors">
                                  <div className="w-16 h-12 rounded-xl shrink-0 overflow-hidden bg-background-secondary border border-border-subtle/50">
                                     <img src={ad.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[10px] font-black uppercase text-white truncate mb-0.5">{ad.name}</p>
                                     <p className="text-[9px] text-text-tertiary flex items-center gap-1">
                                        <Eye size={10} /> {ad.impressionCount} <span className="mx-1">•</span> <MousePointer2 size={10} /> {ad.clickCount}
                                     </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                     <button 
                                       onClick={() => {
                                         if (activeAd) {
                                           if (window.confirm("Cela désactivera la publicité actuellement en ligne. Continuer ?")) {
                                             handleDeactivate(ad);
                                           }
                                         } else {
                                           handleDeactivate(ad);
                                         }
                                       }}
                                       className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-black transition-all flex items-center justify-center shrink-0"
                                       title="Réactiver"
                                     >
                                       <Power size={14} />
                                     </button>
                                     <button 
                                       onClick={() => {
                                          if (window.confirm("Supprimer définitivement l'historique de cette campagne ?")) {
                                             deleteDoc(doc(db, 'adSlots', ad.id));
                                          }
                                       }}
                                       className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                  </div>
                               </div>
                            ))}
                            {historicalAds.length === 0 && (
                               <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 gap-4">
                                  <BarChart3 size={32} />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée historique</p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Global Performance Data */}
        <section className="mt-40 space-y-12">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Rapport Global</h2>
                 <p className="text-xs text-text-tertiary">Analyse comparative des performances par emplacement.</p>
              </div>
           </div>

           <div className="bg-background-card border border-border-subtle rounded-[40px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-border-subtle bg-background-secondary/50">
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">Campagne</th>
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">Emplacement</th>
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary text-center">Affichages</th>
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary text-center">Clics</th>
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary text-center">Engagement (CTR)</th>
                          <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary text-right">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                       {[...ads].sort((a, b) => (b.impressionCount || 0) - (a.impressionCount || 0)).map(ad => (
                          <tr key={ad.id} className="hover:bg-background-secondary/20 transition-colors">
                             <td className="px-8 py-8">
                                <div className="flex items-center gap-5">
                                   <div className="w-16 h-10 rounded-lg border border-border-subtle bg-background-secondary overflow-hidden shrink-0 shadow-sm">
                                      <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <span className="text-sm font-black uppercase text-white tracking-tight">{ad.name}</span>
                                </div>
                             </td>
                             <td className="px-8 py-8">
                                <Badge variant="outline" className="text-[9px] font-mono border-indigo-500/20 text-text-tertiary px-2 py-1 uppercase">{ad.position}</Badge>
                             </td>
                             <td className="px-8 py-8 text-center font-display font-black text-white">{ad.impressionCount?.toLocaleString()}</td>
                             <td className="px-8 py-8 text-center font-display font-black text-white">{ad.clickCount?.toLocaleString()}</td>
                             <td className="px-8 py-8 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                   <span className="text-sm font-display font-black text-accent-green leading-none">
                                      {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : 0}%
                                   </span>
                                   <div className="w-16 h-1 bg-background-secondary rounded-full overflow-hidden">
                                      <div className="h-full bg-accent-green" style={{ width: `${Math.min((ad.clickCount / (ad.impressionCount || 1)) * 500, 100)}%` }} />
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-8 text-right">
                                <Badge className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-3 py-1",
                                  ad.isActive ? "bg-accent-green text-black" : "bg-background-secondary text-text-tertiary border-border-subtle"
                                )}>
                                  {ad.isActive ? "ACTIVE" : "TERMINÉE"}
                                </Badge>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-5xl bg-background-card border border-border-subtle rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="px-10 py-10 border-b border-border-subtle flex items-center justify-between shrink-0">
                 <div className="space-y-1">
                    <Badge className="bg-indigo-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2">ÉDITEUR PUBLICITAIRE</Badge>
                    <h2 className="text-3xl font-display font-black uppercase text-white italic">
                      {editingAd ? "MODIFIER LA CAMPAGNE" : "NOUVELLE CAMPAGNE"}
                    </h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 rounded-3xl bg-background-secondary text-text-tertiary hover:text-white transition-all flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 group">
                    <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-10 overflow-y-auto custom-scrollbar space-y-12 bg-[#0A0A0A]/50">
                 {/* Position Selector */}
                 <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">EMPLACEMENT SUR LA PLATEFORME</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                       {AD_POSITIONS.map(pos => (
                         <button
                           key={pos.id}
                           type="button"
                           onClick={() => setFormData(prev => ({ ...prev, position: pos.id }))}
                           className={cn(
                             "p-5 rounded-3xl border text-left transition-all relative overflow-hidden group",
                             formData.position === pos.id 
                               ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                               : "bg-background-secondary border-border-subtle hover:border-text-tertiary"
                           )}
                         >
                            <div className="relative z-10 space-y-3">
                               <div className={cn(
                                 "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                 formData.position === pos.id ? "bg-indigo-500 text-white" : "bg-background-card text-text-tertiary"
                               )}>
                                  <LayoutDashboard size={18} />
                               </div>
                               <div className="space-y-1">
                                  <p className={cn("text-[10px] font-black uppercase tracking-tight", formData.position === pos.id ? "text-indigo-400" : "text-white")}>
                                    {pos.name}
                                  </p>
                                  <p className="text-[9px] text-text-tertiary leading-tight">{pos.dimensions}</p>
                               </div>
                            </div>
                            {formData.position === pos.id && (
                               <div className="absolute top-4 right-4 text-indigo-500"><CheckCircle2 size={16} /></div>
                            )}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Dual Section */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Visual Configuration */}
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">VISUEL DE LA CAMPAGNE</h4>
                       
                       <div className={cn(
                          "relative aspect-video rounded-[36px] border-2 border-dashed border-border-subtle bg-background-secondary/30 flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-background-secondary/50",
                          isUploading && "animate-pulse"
                       )}>
                          {formData.imageUrl ? (
                             <>
                               <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                    className="w-14 h-14 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                                  >
                                    <Trash2 size={24} />
                                  </button>
                               </div>
                             </>
                          ) : (
                             <label className="cursor-pointer flex flex-col items-center gap-6 p-12 text-center group w-full">
                                <div className="w-20 h-20 rounded-3xl bg-background-card border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-all group-hover:scale-110">
                                  <Upload size={32} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-white uppercase tracking-widest">IMPORTER UN VISUEL</p>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Recommandé: JPG @ 150dpi</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                             </label>
                          )}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Alt Text (Accessibilité)</label>
                             <input 
                                value={formData.altText}
                                onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                                placeholder="ex: Nouveau maillot de foot..."
                                className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Titre visuel</label>
                             <input 
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="ex: Campagne Nike 2026"
                                className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Logic & Meta */}
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">CONFIGURATION & PARAMÈTRES</h4>
                       
                       <div className="space-y-6 bg-background-secondary/20 p-8 rounded-[40px] border border-border-subtle">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Nom de la campagne</label>
                             <input 
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="ex: Nike Mercurial - Sidebar"
                                className="w-full bg-background-card border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white transition-all"
                             />
                             <p className="text-[9px] text-text-tertiary ml-4 italic">* Uniquement visible dans cet admin</p>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Lien URL de redirection</label>
                             <div className="relative group">
                                <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-indigo-500" size={16} />
                                <input 
                                  value={formData.linkUrl}
                                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                  placeholder="https://votre-site.com/promo"
                                  className="w-full bg-background-card border border-border-subtle rounded-2xl pl-14 pr-6 h-14 text-sm font-medium outline-none focus:border-indigo-500 text-white transition-all"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 pt-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Date début</label>
                                <input 
                                  type="date"
                                  value={formData.startDate}
                                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                  className="w-full bg-background-card border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-indigo-500 text-white"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Date fin (optionnel)</label>
                                <input 
                                  type="date"
                                  value={formData.endDate}
                                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                  className="w-full bg-background-card border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-indigo-500 text-white"
                                />
                             </div>
                          </div>

                          <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                             <div className="space-y-0.5">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">Activer la campagne</p>
                                <p className="text-[10px] text-text-tertiary italic">Prend l'emplacement immédiatement</p>
                             </div>
                             <button
                               type="button"
                               onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                               className={cn(
                                 "w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner",
                                 formData.isActive ? "bg-accent-green" : "bg-background-card border border-border-subtle"
                               )}
                             >
                               <div className={cn(
                                 "absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md",
                                 formData.isActive ? "left-8" : "left-1"
                               )} />
                             </button>
                          </div>
                        </div>
                    </div>
                 </div>

                 {/* Footer Summary & Action */}
                 <div className="p-8 bg-indigo-500/5 rounded-[40px] border border-indigo-500/20 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                    <div className="flex items-center gap-5 flex-1">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                          <AlertTriangle size={24} />
                       </div>
                       <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                          Note d'administrateur : Activer cette campagne désactivera automatiquement toute autre campagne en cours pour l'emplacement <span className="font-bold underline uppercase">{formData.position}</span>.
                       </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <Button 
                         type="button" 
                         onClick={() => setIsModalOpen(false)}
                         variant="secondary"
                         className="h-16 px-10 rounded-[28px] text-[11px] font-black uppercase tracking-widest border border-border-subtle"
                       >
                         Annuler
                       </Button>
                       <Button 
                         type="submit" 
                         disabled={isSaving || !formData.imageUrl || !formData.linkUrl || !formData.name}
                         className="h-16 px-12 rounded-[28px] bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_15px_40px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center"
                       >
                         {isSaving ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save size={18} className="mr-3" />}
                         PUBLIER LA CAMPAGNE
                       </Button>
                    </div>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
