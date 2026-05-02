import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogPost } from '@/src/hooks/useBlogPost';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/src/lib/firebase';
import { BlogPost } from '@/src/lib/schema';
import { RichTextEditor } from '@/src/components/blog/RichTextEditor';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Link } from 'react-router-dom';
import { Loader2, Upload, X, ArrowLeft, Eye, Save, Send, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import slugify from 'slugify';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORIES = ["Actualités", "Conseils", "Terrains", "Interviews", "Communauté"];

export default function BlogCMSEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { post: existingPost, loading: loadingPost } = useBlogPost(id || '', false);
  
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = React.useState<any>(null);
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [activePanel, setActivePanel] = React.useState<'edit' | 'preview'>('edit');
  const [tagInput, setTagInput] = React.useState('');

  // Initialize form
  React.useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt);
      setContent(existingPost.content);
      setCategory(existingPost.category);
      setTags(existingPost.tags || []);
      setCoverImageUrl(existingPost.coverImageUrl);
      setStatus(existingPost.status === 'archived' ? 'draft' : existingPost.status as any);
      setPublishedAt(existingPost.publishedAt);
    }
  }, [existingPost]);

  // Auto-generate slug
  React.useEffect(() => {
    if (title && !id) {
       handleRegenSlug();
    }
  }, [title, id]);

  const handleRegenSlug = () => {
    setSlug(slugify(title, { lower: true, strict: true }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postId = id || `temp-${Date.now()}`;
      const storageRef = ref(storage, `blog/covers/${postId}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setCoverImageUrl(url);
    } catch (error) {
       console.error("Error uploading file:", error);
    } finally {
       setIsUploading(false);
    }
  };

  const handleSave = async (finalStatus?: 'published' | 'draft') => {
    if (!title || !content || !coverImageUrl) {
      alert("Titre, contenu et image de couverture sont requis.");
      return;
    }

    setIsSaving(true);
    const newStatus = finalStatus || status;
    const isNowPublishing = newStatus === 'published' && (!existingPost || existingPost.status !== 'published');

    const postData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      coverImageUrl,
      status: newStatus,
      updatedAt: serverTimestamp(),
      readTime: `${Math.ceil(content.split(' ').length / 200)} min`,
      ...(isNowPublishing ? { publishedAt: serverTimestamp() } : {}),
      ...(existingPost ? {} : { 
        createdAt: serverTimestamp(), 
        authorId: user?.uid || '', 
        authorName: userProfile?.name || 'Admin',
        viewCount: 0
      })
    };

    try {
      if (id) {
        await updateDoc(doc(db, 'blogPosts', id), postData);
      } else {
        const newPostRef = doc(collection(db, 'blogPosts'));
        await setDoc(newPostRef, { ...postData, id: newPostRef.id });
        navigate(`/admin/blog/${newPostRef.id}/modifier`);
      }
      setLastSaved(new Date());
      if (finalStatus === 'published') {
         setStatus('published');
      }
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (id && title && content) {
        handleSave('draft');
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [id, title, content, excerpt, category, tags, coverImageUrl]);

  if (id && loadingPost) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-green animate-spin" />
      </div>
    );
  }

  const previewContent = (
    <div className="bg-background-primary p-8 rounded-[32px] min-h-full border border-border-subtle max-w-4xl mx-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
       <div className="aspect-video rounded-3xl overflow-hidden mb-8 border border-border-subtle bg-background-secondary flex items-center justify-center">
          {coverImageUrl ? (
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
             <div className="text-text-tertiary flex flex-col items-center gap-2">
               <ImageIcon size={48} />
               <p className="text-[10px] uppercase font-black tracking-widest">Image de couverture</p>
             </div>
          )}
       </div>
       
       <div className="space-y-6 mb-10">
          <Badge className="bg-accent-green text-black border-none font-black text-[10px] uppercase tracking-widest h-8 px-4">
            {category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-white leading-tight">
            {title || "Titre de l'article"}
          </h1>
          <p className="text-lg text-text-secondary font-medium italic">
            {excerpt || "Extrait de l'article..."}
          </p>
       </div>

       <div 
         className="blog-content prose prose-invert prose-p:text-text-primary prose-p:text-lg prose-p:leading-relaxed prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight max-w-none"
         dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
       />
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <Link to="/admin/blog">
              <button className="w-12 h-12 rounded-2xl bg-background-card border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-white transition-all">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div className="space-y-1">
               <h1 className="text-2xl font-display font-black uppercase tracking-tight text-white leading-none">
                 {id ? "Modifier l'article" : "Nouvel article"}
               </h1>
               <div className="flex items-center gap-2">
                 <span className={cn(
                   "w-2 h-2 rounded-full",
                   status === 'published' ? "bg-accent-green" : "bg-amber-500"
                 )} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                   Statut: {status === 'published' ? 'Publié' : 'Brouillon'}
                 </p>
               </div>
            </div>
          </div>

          <div className="flex lg:hidden bg-background-card p-1 rounded-xl border border-border-subtle">
             <button 
               onClick={() => setActivePanel('edit')}
               className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", activePanel === 'edit' ? "bg-background-secondary text-white" : "text-text-tertiary")}
             >
               Modifier
             </button>
             <button 
               onClick={() => setActivePanel('preview')}
               className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", activePanel === 'preview' ? "bg-background-secondary text-white" : "text-text-tertiary")}
             >
               Aperçu
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Editing */}
          <div className={cn(
            "lg:col-span-7 space-y-8",
            activePanel === 'preview' ? "hidden lg:block" : "block"
          )}>
            <div className="bg-background-card border border-border-subtle rounded-[32px] p-8 space-y-8 shadow-xl">
              {/* Title Section */}
              <div className="space-y-4">
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'article..."
                  className="w-full bg-transparent border-b border-border-subtle focus:border-accent-green py-4 outline-none text-3xl font-display font-black uppercase text-white placeholder:text-text-tertiary"
                />
                <div className="flex items-center gap-3 bg-background-secondary/30 p-3 rounded-xl border border-border-subtle">
                   <p className="text-[10px] font-mono text-text-tertiary shrink-0">takwira.com/blog/</p>
                   <input 
                     value={slug}
                     onChange={(e) => setSlug(e.target.value)}
                     className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-accent-green p-0"
                   />
                   <button onClick={handleRegenSlug} className="text-text-tertiary hover:text-white transition-colors">
                     <RefreshCw size={14} />
                   </button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Extrait (Meta description)</label>
                 <textarea 
                   value={excerpt}
                   onChange={(e) => setExcerpt(e.target.value.slice(0, 150))}
                   placeholder="Résumé court de l'article..."
                   className="w-full bg-background-secondary border border-border-subtle rounded-2xl p-4 text-sm font-medium outline-none focus:border-accent-green text-white min-h-[100px] resize-none"
                 />
                 <p className="text-[9px] font-black text-right text-text-tertiary uppercase tracking-widest">
                   {excerpt.length} / 150
                 </p>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Catégorie</label>
                    <div className="flex flex-wrap gap-2">
                       {CATEGORIES.map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setCategory(cat)}
                           className={cn("px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", category === cat ? "bg-accent-green text-black" : "bg-background-secondary text-text-tertiary border border-border-subtle")}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                       {tags.map(tag => (
                         <div key={tag}>
                           <Badge className="bg-background-secondary text-white border-border-subtle font-black uppercase text-[8px] py-1 pl-3 pr-1.5 flex items-center gap-1.5 h-7">
                             {tag} <button onClick={() => removeTag(tag)} className="p-0.5 hover:text-danger hover:bg-white/10 rounded-full transition-colors"><X size={10} /></button>
                           </Badge>
                         </div>
                       ))}
                    </div>
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Ajouter un tag..."
                      className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-10 text-[10px] outline-none focus:border-accent-green text-white"
                    />
                 </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Image de couverture</label>
                 <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-border-subtle bg-background-secondary/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-accent-green/30">
                    {coverImageUrl ? (
                       <>
                         <img src={coverImageUrl} className="w-full h-full object-cover" alt="Cover" />
                         <button 
                            onClick={() => setCoverImageUrl('')}
                            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X size={20} />
                         </button>
                       </>
                    ) : (
                       <>
                         {isUploading ? (
                           <Loader2 size={32} className="text-accent-green animate-spin" />
                         ) : (
                           <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center">
                              <div className="w-16 h-16 rounded-2xl bg-background-card border border-border-subtle flex items-center justify-center text-accent-green">
                                <Upload size={24} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white">Clique ou glisse une image</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">PNG, JPG ou WEBP (Max 5MB)</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                           </label>
                         )}
                         <div className="w-full max-w-sm px-8">
                            <div className="relative">
                               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
                               <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-background-secondary px-2 text-text-tertiary">Ou URL</span></div>
                            </div>
                            <input 
                               placeholder="https://..."
                               className="mt-4 w-full bg-background-card border border-border-subtle rounded-xl px-4 h-10 text-[10px] outline-none focus:border-accent-green text-white"
                               onBlur={(e) => e.target.value && setCoverImageUrl(e.target.value)}
                            />
                         </div>
                       </>
                    )}
                 </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Contenu de l'article</label>
                 <RichTextEditor value={content} onChange={setContent} placeholder="Écris l'histoire ici..." />
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className={cn(
            "lg:col-span-5",
            activePanel === 'edit' ? "hidden lg:block" : "block"
          )}>
            <div className="sticky top-24 space-y-6">
               <div className="flex items-center gap-3 mb-4">
                 <Eye size={16} className="text-accent-green" />
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Aperçu en direct</h2>
               </div>
               {previewContent}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-card/80 backdrop-blur-xl border-t border-border-subtle p-4 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSaving ? "bg-accent-green animate-pulse" : lastSaved ? "bg-accent-green" : "bg-text-tertiary"
            )} />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              {isSaving ? "Sauvegarde..." : lastSaved ? `Dernière sauvegarde: ${format(lastSaved, 'HH:mm', { locale: fr })}` : "Modifications non enregistrées"}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={() => handleSave('draft')}
               disabled={isSaving}
               className="h-12 border-border-subtle text-[10px] font-black uppercase tracking-widest rounded-xl px-8"
             >
               {isSaving ? "Auto-save..." : "Enregistrer brouillon"}
             </Button>
             <Button 
               onClick={() => handleSave('published')}
               disabled={isSaving}
               className="h-12 bg-accent-green text-black font-black uppercase tracking-widest rounded-xl px-12 shadow-[0_5px_20px_rgba(34,197,94,0.3)]"
             >
               <Send size={16} className="mr-2" /> Publier l'article
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
