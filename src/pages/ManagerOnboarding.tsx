import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { trackManagerSignup } from '@/src/lib/googleAds';
import { 
  Building2, 
  MapPin, 
  Users, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  Camera,
  UploadCloud,
  FileText,
  Clock,
  Smartphone,
  CheckCircle2,
  Loader2,
  Trash2,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

type Step = 1 | 2 | 3 | 4 | 'SUCCESS';

const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouan", "Béja", 
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", 
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];

const AMENITIES = [
  { id: 'vestiaires', label: 'Vestiaires' },
  { id: 'eclairage', label: 'Éclairage nocturne' },
  { id: 'parking', label: 'Parking' },
  { id: 'buvette', label: 'Buvette' },
  { id: 'tribune', label: 'Tribune' },
];

interface TerrainData {
  id: string;
  name: string;
  type: '6vs6' | '7vs7';
  amenities: string[];
  photos: string[];
}

export default function ManagerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '55 123 456', // Mock pre-filled from OTP
    governorate: '',
    city: '',
    complexName: '',
    address: '',
    lat: '',
    lng: '',
    openingTime: '09:00',
    closingTime: '23:00',
    description: '',
    terrains: [{ id: '1', name: 'Terrain 1', type: '6vs6', amenities: [], photos: [] }] as TerrainData[],
    termsAccepted: false
  });

  const nextStep = () => setCurrentStep((prev) => (typeof prev === 'number' ? (prev + 1 as Step) : prev));
  const prevStep = () => setCurrentStep((prev) => (typeof prev === 'number' ? (prev - 1 as Step) : prev));

  const handleAddTerrain = () => {
    const newId = (formData.terrains.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      terrains: [...prev.terrains, { id: newId, name: `Terrain ${newId}`, type: '6vs6', amenities: [], photos: [] }]
    }));
  };

  const handleRemoveTerrain = () => {
    if (formData.terrains.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      terrains: prev.terrains.slice(0, -1)
    }));
  };

  const updateTerrain = (index: number, updates: Partial<TerrainData>) => {
    const newTerrains = [...formData.terrains];
    newTerrains[index] = { ...newTerrains[index], ...updates };
    setFormData(prev => ({ ...prev, terrains: newTerrains }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      // 1. Create Complex
      const complexRef = await addDoc(collection(db, 'complexes'), {
        name: formData.complexName,
        address: formData.address,
        governorate: formData.governorate,
        city: formData.city,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        description: formData.description,
        managerId: auth.currentUser.uid,
        amenities: [], // Can be aggregated from terrains
        rating: 0,
        reviewsCount: 0,
        photos: [], // In real app, upload files first
        createdAt: serverTimestamp()
      });

      // 2. Create Terrains
      for (const t of formData.terrains) {
        await addDoc(collection(db, 'terrains'), {
          name: t.name,
          complexId: complexRef.id,
          complexName: formData.complexName,
          type: t.type,
          amenities: t.amenities,
          photos: [], // In real app, upload files
          pricePerHour: 80, // Default price
          available: true,
          createdAt: serverTimestamp()
        });
      }

      // 3. Update User Role
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        role: 'manager',
        complexId: complexRef.id,
        onboardingCompleted: true
      });

      trackManagerSignup();
      setCurrentStep('SUCCESS');
    } catch (err) {
      console.error("Error submitting onboarding:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Left Column: Form */}
      <div className="w-full lg:w-[55%] min-h-screen flex flex-col p-6 md:p-12 lg:p-20 relative">
        
        {/* Progress Tracker */}
        {currentStep !== 'SUCCESS' && (
          <div className="mb-12 space-y-4">
            <div className="h-1.5 w-full bg-background-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: '25%' }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                className="h-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
              Étape {currentStep} / 4 — {
                currentStep === 1 ? "Informations personnelles" :
                currentStep === 2 ? "Votre complexe sportif" :
                currentStep === 3 ? "Vos terrains" : "Vérification et envoi"
              }
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight leading-none">Vos informations</h2>
                <p className="text-text-secondary font-medium">Commençons par faire connaissance.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom et Prénom</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Ahmed Skhiri"
                    className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Numéro de téléphone</label>
                  <div className="relative">
                    <input 
                      disabled
                      type="text"
                      value={formData.phone}
                      className="w-full h-14 bg-background-primary border border-border-subtle rounded-xl px-12 text-text-secondary"
                    />
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-green" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Gouvernorat</label>
                    <select 
                      value={formData.governorate}
                      onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none appearance-none"
                    >
                      <option value="">Sélectionner</option>
                      {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ville</label>
                    <input 
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="La Marsa, Ariana..."
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={nextStep} className="w-full h-16 font-black uppercase tracking-widest">
                Continuer <ChevronRight size={18} />
              </Button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white mb-4">
                  <ArrowLeft size={14} /> Retour
                </button>
                <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight leading-none">Votre Complexe</h2>
                <p className="text-text-secondary font-medium">Parlez-nous de l'endroit où vous accueillez vos joueurs.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom du complexe</label>
                  <input 
                    type="text"
                    value={formData.complexName}
                    onChange={(e) => setFormData({...formData, complexName: e.target.value})}
                    placeholder="Ex: Complex Sportif El Menzah"
                    className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Adresse complète</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full h-24 bg-background-secondary border border-border-subtle rounded-xl p-4 focus:border-accent-green outline-none resize-none"
                    placeholder="15 Rue du Stade, Sidi Bousaid..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-primary">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Latitude</label>
                    <input 
                      type="number"
                      value={formData.lat}
                      onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      placeholder="36.852..."
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Longitude</label>
                    <input 
                      type="number"
                      value={formData.lng}
                      onChange={(e) => setFormData({...formData, lng: e.target.value})}
                      placeholder="10.321..."
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ouvre à</label>
                    <input 
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ferme à</label>
                    <input 
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                      className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl px-4 focus:border-accent-green outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={nextStep} className="w-full h-16 font-black uppercase tracking-widest">
                Continuer <ChevronRight size={18} />
              </Button>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div className="space-y-1">
                <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white mb-4">
                  <ArrowLeft size={14} /> Retour
                </button>
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight leading-none">Vos Terrains</h2>
                   <div className="flex items-center bg-background-secondary rounded-xl p-1 border border-border-subtle">
                      <button onClick={handleRemoveTerrain} disabled={formData.terrains.length <= 1} className="w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-danger disabled:opacity-30">
                        <Minus size={18} />
                      </button>
                      <div className="w-12 text-center font-display font-black text-xl">{formData.terrains.length}</div>
                      <button onClick={handleAddTerrain} className="w-10 h-10 flex items-center justify-center text-accent-green hover:brightness-125">
                        <Plus size={18} />
                      </button>
                   </div>
                </div>
                <p className="text-text-secondary font-medium">Configurez chaque terrain individuellement.</p>
              </div>

              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {formData.terrains.map((terrain, index) => (
                    <motion.div 
                      key={terrain.id} 
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                    >
                       <Card className="p-8 space-y-8 bg-background-card border-border-subtle overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-2 h-full bg-accent-green" />
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h4 className="text-2xl font-display font-black uppercase tracking-tight">Terrain #{index + 1}</h4>
                                <Badge className="bg-background-secondary text-text-tertiary font-bold h-6 uppercase">{terrain.type.toUpperCase()}</Badge>
                             </div>
                             {index > 0 && (
                                <button className="text-text-tertiary hover:text-danger transition-colors">
                                   <Trash2 size={20} />
                                </button>
                             )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom du terrain</label>
                                <input 
                                  required
                                  value={terrain.name}
                                  onChange={(e) => updateTerrain(index, { name: e.target.value })}
                                  className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-[10px] uppercase font-black tracking-widest text-white"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Type de terrain</label>
                                <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle">
                                   <button 
                                     onClick={() => updateTerrain(index, { type: '6vs6' })}
                                     className={cn("flex-1 h-10 rounded-lg text-[9px] font-black uppercase transition-all", terrain.type === '6vs6' ? 'bg-accent-green text-black' : 'text-text-tertiary')}
                                   >
                                     6 VS 6
                                   </button>
                                   <button 
                                     onClick={() => updateTerrain(index, { type: '7vs7' })}
                                     className={cn("flex-1 h-10 rounded-lg text-[9px] font-black uppercase transition-all", terrain.type === '7vs7' ? 'bg-accent-green text-black' : 'text-text-tertiary')}
                                   >
                                     7 VS 7
                                   </button>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Équipements inclus</label>
                             <div className="flex flex-wrap gap-2">
                                {AMENITIES.map(amenity => (
                                  <button 
                                    key={amenity.id}
                                    onClick={() => {
                                      const newAmenities = terrain.amenities.includes(amenity.id) 
                                        ? terrain.amenities.filter(a => a !== amenity.id)
                                        : [...terrain.amenities, amenity.id];
                                      updateTerrain(index, { amenities: newAmenities });
                                    }}
                                    className={cn(
                                      "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all",
                                      terrain.amenities.includes(amenity.id) 
                                        ? "bg-accent-green border-accent-green text-black" 
                                        : "bg-background-secondary border-border-subtle text-text-tertiary hover:border-accent-green/30"
                                    )}
                                  >
                                    {amenity.label}
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Photos du terrain (Max 6)</label>
                             <div className="w-full border-2 border-dashed border-border-subtle rounded-[24px] p-8 flex flex-col items-center gap-4 hover:border-accent-green transition-colors cursor-pointer bg-background-secondary/20">
                                <UploadCloud className="text-accent-green" size={32} />
                                <div className="text-center space-y-1">
                                   <p className="text-xs font-bold uppercase tracking-widest">Glisse tes photos ici</p>
                                   <p className="font-medium text-[10px] text-text-tertiary">OU CLIQUE POUR CHOISIR</p>
                                </div>
                             </div>
                          </div>
                       </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button onClick={nextStep} className="w-full h-16 font-black uppercase tracking-widest shadow-2xl shadow-accent-green/20 mt-12">
                   Vérifier ma demande <ChevronRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white mb-4">
                  <ArrowLeft size={14} /> Retour
                </button>
                <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight leading-none">Récapitulatif</h2>
                <p className="text-text-secondary font-medium">Vérifiez vos informations avant de soumettre.</p>
              </div>

              <div className="space-y-4">
                 {[
                   { label: "Informations Personnelles", value: `${formData.fullName} · ${formData.phone}`, step: 1 },
                   { label: "Complexe", value: `${formData.complexName} · ${formData.governorate}`, step: 2 },
                   { label: "Terrains", value: `${formData.terrains.length} terrains configurés`, step: 3 },
                 ].map((section, i) => (
                   <div key={i} className="p-6 bg-background-card border border-border-subtle rounded-2xl flex items-center justify-between group">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{section.label}</p>
                         <p className="font-bold text-sm">{section.value}</p>
                      </div>
                      <button onClick={() => setCurrentStep(section.step as Step)} className="text-accent-green text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Modifier</button>
                   </div>
                 ))}
              </div>

              <div className="p-6 bg-background-secondary/30 rounded-3xl border border-dashed border-border-subtle space-y-4">
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 border-border-subtle flex items-center justify-center transition-all group-hover:border-accent-green",
                      formData.termsAccepted ? "bg-accent-green border-accent-green" : "bg-transparent"
                    )}>
                       {formData.termsAccepted && <Check size={14} className="text-black stroke-[4]" />}
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={formData.termsAccepted}
                         onChange={() => setFormData({...formData, termsAccepted: !formData.termsAccepted})}
                        />
                    </div>
                    <span className="text-xs font-bold text-text-secondary leading-tight pt-1">
                       J'accepte les <span className="text-accent-green">Conditions d'Utilisation</span> et la <span className="text-accent-green">Politique de Confidentialité</span> de Takwira.com
                    </span>
                 </label>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!formData.termsAccepted || isLoading}
                className="w-full h-16 font-black uppercase tracking-widest shadow-2xl shadow-accent-green/20"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Envoyer ma demande"}
              </Button>
            </motion.div>
          )}

          {currentStep === 'SUCCESS' && (
            <motion.div 
               key="success"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
               <div className="w-24 h-24 bg-accent-green rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <Check size={48} className="text-black stroke-[4]" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight">Demande Envoyée !</h2>
                  <p className="text-text-secondary font-medium">Notre équipe vérifie votre complexe sous 24 à 48h.</p>
               </div>

               {/* Timeline */}
               <div className="w-full max-w-md pt-8">
                  <div className="relative space-y-12 after:absolute after:left-7 after:top-4 after:bottom-4 after:w-px after:bg-border-subtle">
                     {[
                       { label: 'Demande reçue', status: 'done' },
                       { label: 'Vérification en cours', status: 'active' },
                       { label: 'Compte activé', status: 'pending' },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6 relative z-10">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                            item.status === 'done' ? "bg-accent-green text-black" :
                            item.status === 'active' ? "bg-background-secondary border-2 border-accent-green text-accent-green animate-pulse" :
                            "bg-background-secondary border border-border-subtle text-text-tertiary"
                          )}>
                             {item.status === 'done' ? <Check size={20} className="stroke-[3]" /> : (i + 1)}
                          </div>
                          <p className={cn("font-black uppercase text-xs tracking-widest", item.status === 'pending' ? 'text-text-tertiary' : 'text-white')}>
                             {item.label}
                          </p>
                       </div>
                     ))}
                  </div>
               </div>

               <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="h-14 font-black uppercase tracking-widest border-border-subtle"
               >
                 Retour à l'accueil
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Visual Illustration */}
      <div className="hidden lg:flex w-[45%] bg-background-secondary min-h-screen sticky top-0 flex-col items-center justify-center p-20 overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-green/5 blur-[100px] rounded-full" />
         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-green/5 blur-[120px] rounded-full" />

         <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="relative w-full max-w-sm aspect-square"
            >
               {currentStep === 1 && <PersonalIllustration />}
               {currentStep === 2 && <ComplexIllustration />}
               {currentStep === 3 && <TerrainIllustration />}
               {currentStep === 4 && <ReviewIllustration />}
               {currentStep === 'SUCCESS' && <ReviewIllustration />}
            </motion.div>
         </AnimatePresence>

         <div className="mt-20 text-center relative z-10">
            <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white mb-2">Rejoignez le réseau N°1</h3>
            <p className="text-text-tertiary text-sm font-medium">Takwira simplifie la gestion de plus de 150 complexes en Tunisie.</p>
         </div>
      </div>
    </div>
  );
}

// Geometric CSS Illustrations

function PersonalIllustration() {
  return (
    <div className="w-full h-full relative">
       <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-background-card border-4 border-accent-green rounded-3xl shadow-2xl p-6 space-y-4">
          <div className="w-12 h-12 bg-accent-green/20 rounded-xl" />
          <div className="w-full h-4 bg-background-secondary rounded-full" />
          <div className="w-2/3 h-4 bg-background-secondary rounded-full" />
          <div className="grid grid-cols-2 gap-2 pt-4">
             <div className="h-4 bg-accent-green/10 rounded-full" />
             <div className="h-4 bg-accent-green/10 rounded-full" />
          </div>
       </motion.div>
       <div className="absolute top-[30%] right-[10%] w-16 h-16 bg-accent-green rounded-[18px] flex items-center justify-center rotate-[15deg]">
          <Smartphone className="text-black" size={32} />
       </div>
    </div>
  );
}

function ComplexIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
       <div className="w-64 h-64 bg-background-card border-4 border-accent-green rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center gap-4">
          <Building2 size={80} className="text-accent-green" />
          <div className="w-32 h-2 bg-accent-green/20 rounded-full" />
       </div>
       <div className="absolute top-[20%] left-[20%] w-12 h-12 bg-accent-green rounded-full flex items-center justify-center">
          <MapPin size={24} className="text-black" />
       </div>
    </div>
  );
}

function TerrainIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
       <div className="w-80 h-48 bg-accent-green/10 border-2 border-accent-green rounded-2xl relative overflow-hidden p-6 gap-4 grid grid-cols-2">
          <div className="border border-accent-green/30 rounded-xl bg-background-card/50 flex flex-col items-center justify-center gap-2">
             <LayoutDashboard size={24} className="text-accent-green" />
             <div className="w-8 h-1 bg-accent-green/20 rounded-full" />
          </div>
          <div className="border border-accent-green/30 rounded-xl bg-background-card/50" />
       </div>
       <div className="absolute top-[10%] right-[20%] w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center shadow-2xl">
          <Camera size={32} className="text-black" />
       </div>
    </div>
  );
}

function ReviewIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
       <div className="w-56 h-72 bg-background-card border-4 border-accent-green rounded-3xl p-8 space-y-6">
          <CheckCircle2 size={48} className="text-accent-green" />
          <div className="space-y-2">
             <div className="w-full h-3 bg-background-secondary rounded-full" />
             <div className="w-full h-3 bg-background-secondary rounded-full" />
             <div className="w-2/3 h-3 bg-background-secondary rounded-full" />
          </div>
          <div className="w-full h-10 bg-accent-green rounded-xl" />
       </div>
    </div>
  );
}
