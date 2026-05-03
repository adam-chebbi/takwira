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
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AD_POSITIONS = [
  { id: 'blog_list_between', name: 'Bannière entre les articles', description: 'S\'affiche entre le 6ème et le 7ème article de la liste.' },
  { id: 'blog_sidebar_top', name: 'Publicité en haut du sidebar', description: 'S\'affiche tout en haut de la barre latérale des articles.' },
  { id: 'blog_sidebar_bottom', name: 'Publicité en bas du sidebar', description: 'S\'affiche en bas de la barre latérale des articles.' },
  { id: 'blog_post_inline', name: 'Publicité inline dans les articles', description: 'S\'affiche tous les 3 paragraphes dans le contenu.' },
];

export default function AdminAds() {
  const [ads, setAds] = React.useState<AdType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState<AdType | null>(null);
  
  // States
  const [totalStats, setTotalStats] = React.useState({
    active: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0
  });

  // Form State
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
      
      // Calculate Stats
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
        startDate: format(ad.startDate.toDate(), 'yyyy-MM-dd'),
        endDate: ad.endDate ? format(ad.endDate.toDate(), 'yyyy-MM-dd') : ''
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
    if (!formData.imageUrl || !formData.linkUrl || !formData.name) {
      alert("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    setIsSaving(true);
    try {
      // If activating a new ad, deactivate existing ones for that position
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

  const handleDelete = async (adId: string) => {
    if (window.confirm("Supprimer cette publicité ?")) {
      try {
        await deleteDoc(doc(db, 'adSlots', adId));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-white leading-none">
              Gestion des Publicités
            </h1>
            <p className="text-text-secondary text-sm font-medium">Les publicités s'affichent uniquement sur les pages du blog.</p>
          </div>
          
          <Button 
            onClick={() => handleOpenModal()}
            className="h-14 px-8 rounded-2xl bg-accent-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Plus size={20} className="mr-2" /> Nouvelle Publicité
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Actives", value: totalStats.active, icon: CheckCircle2, color: "text-accent-green" },
            { label: "Affichages", value: totalStats.impressions.toLocaleString(), icon: Eye, color: "text-blue-500" },
            { label: "Clics", value: totalStats.clicks.toLocaleString(), icon: MousePointer2, color: "text-purple-500" },
            { label: "CTR", value: `${totalStats.ctr.toFixed(2)}%`, icon: BarChart3, color: "text-amber-500" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-background-card border border-border-subtle rounded-3xl"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center mb-4", stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-display font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Ad Slots Section */}
        <div className="space-y-16">
          {AD_POSITIONS.map((pos) => {
            const activeAd = ads.find(a => a.position === pos.id && a.isActive);
            return (
              <section key={pos.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-1">
                      {pos.name}
                    </h2>
                    <p className="text-xs text-text-tertiary font-mono">{pos.id}</p>
                  </div>
                  <Badge variant="outline" className="border-border-subtle text-[10px] font-mono text-text-tertiary">
                    {pos.description}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {activeAd ? (
                     <div className="bg-background-card border border-accent-green/30 rounded-3xl overflow-hidden group">
                        <div className="aspect-[21/9] relative overflow-hidden bg-background-secondary">
                           <img src={activeAd.imageUrl} className="w-full h-full object-cover" alt="Active ad" />
                           <div className="absolute top-4 right-4 z-10 flex gap-2">
                             <button 
                               onClick={() => handleOpenModal(activeAd)}
                               className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
                             >
                               <Edit2 size={16} />
                             </button>
                             <button 
                               onClick={() => handleDeactivate(activeAd)}
                               className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-danger flex items-center justify-center hover:bg-black/80"
                             >
                               <PowerOff size={16} />
                             </button>
                           </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                             <div className="space-y-1">
                               <p className="text-sm font-bold text-white">{activeAd.name}</p>
                               <a href={activeAd.linkUrl} target="_blank" rel="noreferrer" className="text-[10px] text-accent-green flex items-center gap-1 hover:underline">
                                 {activeAd.linkUrl} <ExternalLink size={10} />
                               </a>
                             </div>
                             <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 text-[8px] font-black uppercase tracking-widest px-2 h-5">ACITIVE</Badge>
                           </div>
                           <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
                              <div className="space-y-0.5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Impressions</p>
                                 <p className="text-sm font-display font-black text-white">{activeAd.impressionCount || 0}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Clics</p>
                                 <p className="text-sm font-display font-black text-white">{activeAd.clickCount || 0}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">CTR</p>
                                 <p className="text-sm font-display font-black text-white">
                                   {activeAd.impressionCount > 0 ? ((activeAd.clickCount / activeAd.impressionCount) * 100).toFixed(1) : 0}%
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="border border-dashed border-border-subtle rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 group hover:border-accent-green/30 transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-colors">
                           <ImageIcon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Aucune publicité active pour ce slot</p>
                        <Button variant="ghost" onClick={() => {
                          setFormData(prev => ({ ...prev, position: pos.id }));
                          setIsModalOpen(true);
                        }} className="h-10 text-[9px] font-black uppercase tracking-widest group-hover:text-white">
                          Ajouter une pub
                        </Button>
                     </div>
                   )}
                   
                   {/* Background history for this slot (mini cards) */}
                   <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                      {ads.filter(a => a.position === pos.id && !a.isActive).map(ad => (
                         <div key={ad.id} className="p-4 bg-background-card border border-border-subtle rounded-2xl flex items-center gap-4 group">
                            <div className="w-16 h-12 rounded-lg shrink-0 overflow-hidden bg-background-secondary">
                               <img src={ad.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Historical ad" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-white truncate">{ad.name}</p>
                               <p className="text-[9px] text-text-tertiary">Passée • {ad.impressionCount} views</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => handleDeactivate(ad)}
                                 className="w-8 h-8 rounded-lg bg-background-secondary text-text-tertiary hover:text-accent-green transition-colors flex items-center justify-center"
                               >
                                 <Power size={14} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(ad.id)}
                                 className="w-8 h-8 rounded-lg bg-background-secondary text-text-tertiary hover:text-danger transition-colors flex items-center justify-center"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Analytics Table */}
        <section className="mt-24 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">Analyse de Performance</h2>
              <Button variant="outline" className="h-10 border-border-subtle text-[10px] font-black uppercase tracking-widest">
                Exporter CSV
              </Button>
           </div>

           <div className="bg-background-card border border-border-subtle rounded-[32px] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border-subtle bg-background-secondary/50">
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Publicité</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Position</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Impressions</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Clics</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">CTR %</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-subtle">
                    {[...ads].sort((a, b) => (b.impressionCount || 0) - (a.impressionCount || 0)).map(ad => (
                       <tr key={ad.id} className="hover:bg-background-secondary/20">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-7 rounded border border-border-subtle bg-background-secondary overflow-hidden shrink-0">
                                   <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="text-sm font-bold text-white">{ad.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[10px] font-mono text-text-tertiary">{ad.position}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-mono text-text-secondary">{ad.impressionCount}</td>
                          <td className="px-8 py-6 text-sm font-mono text-text-secondary">{ad.clickCount}</td>
                          <td className="px-8 py-6 text-sm font-mono text-accent-green">
                             {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : 0}%
                          </td>
                          <td className="px-8 py-6">
                             <Badge className={cn(
                               "text-[8px] font-black uppercase h-5",
                               ad.isActive ? "bg-accent-green/10 text-accent-green" : "bg-text-tertiary/10 text-text-tertiary"
                             )}>
                               {ad.isActive ? "ACTIVE" : "OFF"}
                             </Badge>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>
      </div>

      {/* Create / Edit Ad Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-background-card border border-border-subtle rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-border-subtle flex items-center justify-between shrink-0">
                 <div>
                    <h2 className="text-2xl font-display font-black uppercase text-white">
                      {editingAd ? "Modifier la Publicité" : "Nouvelle Publicité"}
                    </h2>
                    <p className="text-xs text-text-tertiary">Configure ton visuel et ses paramètres d'affichage.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-background-secondary text-text-tertiary hover:text-white transition-colors flex items-center justify-center">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-8 overflow-y-auto custom-scrollbar space-y-12">
                 {/* Position Selector */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Position de l'annonce</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {AD_POSITIONS.map(pos => (
                         <button
                           key={pos.id}
                           type="button"
                           onClick={() => setFormData(prev => ({ ...prev, position: pos.id }))}
                           className={cn(
                             "p-4 rounded-3xl border text-left transition-all",
                             formData.position === pos.id 
                               ? "bg-accent-green/5 border-accent-green" 
                               : "bg-background-secondary border-border-subtle hover:border-text-tertiary"
                           )}
                         >
                            <div className="flex items-center justify-between mb-1">
                               <p className={cn("text-xs font-bold", formData.position === pos.id ? "text-accent-green" : "text-white")}>
                                 {pos.name}
                               </p>
                               {formData.position === pos.id && <CheckCircle2 size={16} className="text-accent-green" />}
                            </div>
                            <p className="text-[10px] text-text-tertiary leading-tight">{pos.description}</p>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom interne (Gestion)</label>
                          <input 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="ex: Campagne Nike Mai 2026"
                            className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Titre affiché (Hover)</label>
                          <input 
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="ex: Nouvelles crampons Mercurial"
                            className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                          />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Lien URL (Redirection)</label>
                          <input 
                            value={formData.linkUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                            placeholder="https://..."
                            className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Texte alternatif (Alt)</label>
                          <input 
                            value={formData.altText}
                            onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                            placeholder="Description de l'image..."
                            className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Visual Selector */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Visuel de l'annonce</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className={cn(
                            "relative aspect-video rounded-[32px] border-2 border-dashed border-border-subtle bg-background-secondary/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-accent-green/30",
                            isUploading && "animate-pulse"
                          )}>
                             {formData.imageUrl ? (
                                <>
                                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                  <button 
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center"
                                  >
                                    <X size={20} />
                                  </button>
                                </>
                             ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center">
                                   <div className="w-16 h-16 rounded-2xl bg-background-card border border-border-subtle flex items-center justify-center text-accent-green">
                                     <Upload size={24} />
                                   </div>
                                   <div className="space-y-1">
                                     <p className="text-xs font-bold text-white">Importer l'image</p>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">PNG, JPG, GIF (Max 2MB)</p>
                                   </div>
                                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                             )}
                          </div>
                       </div>
                       
                       {/* Real-time Preview Area */}
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                             <Eye size={12} className="text-accent-green" /> Rendu final (Aperçu)
                          </p>
                          <div className="p-8 border border-border-subtle rounded-[32px] bg-background-primary overflow-hidden flex items-center justify-center min-h-[200px]">
                             {formData.imageUrl ? (
                               <div className="relative group rounded-xl overflow-hidden w-full max-w-[300px] border border-border-subtle">
                                  <div className="absolute top-1.5 left-1.5 z-10 bg-black/60 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase text-text-tertiary">Publicité</div>
                                  <img src={formData.imageUrl} className="w-full aspect-[4/3] object-cover" alt="Simulated Render" />
                               </div>
                             ) : (
                               <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">
                                 Sélectionner une image pour voir le rendu
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Scheduling */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border-subtle">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                          <Calendar size={12} /> Date de début
                       </label>
                       <input 
                         type="date"
                         value={formData.startDate}
                         onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                         className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                          <Calendar size={12} /> Date de fin (Optionnelle)
                       </label>
                       <input 
                         type="date"
                         value={formData.endDate}
                         onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                         className="w-full bg-background-secondary border border-border-subtle rounded-2xl px-6 h-14 text-sm font-medium outline-none focus:border-accent-green text-white"
                       />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                       <button
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                         className={cn(
                           "w-12 h-6 rounded-full relative transition-colors",
                           formData.isActive ? "bg-accent-green" : "bg-background-secondary"
                         )}
                       >
                         <div className={cn(
                           "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                           formData.isActive ? "left-7" : "left-1"
                         )} />
                       </button>
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Activer immédiatement</p>
                          <p className="text-[10px] text-text-tertiary">Prend le dessus sur la pub actuelle</p>
                       </div>
                    </div>
                 </div>

                 {/* Footer Button inside modal */}
                 <div className="flex gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex-1 h-16 bg-accent-green text-black font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
                    >
                      {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                      Enregistrer la Publicité
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      variant="outline" 
                      className="h-16 border-border-subtle text-text-primary font-black uppercase tracking-widest text-xs px-12"
                    >
                      Annuler
                    </Button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
