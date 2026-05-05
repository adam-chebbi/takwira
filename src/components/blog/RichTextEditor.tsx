import * as React from 'react';
// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.css';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Upload, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/src/lib/firebase';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  postId?: string;
}

export function RichTextEditor({ value, onChange, placeholder, postId = 'content' }: RichTextEditorProps) {
  const quillRef = React.useRef<ReactQuill>(null);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const imageHandler = React.useCallback(() => {
    setIsImageModalOpen(true);
  }, []);

  const insertImage = (url: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      quill.insertEmbed(range?.index || 0, 'image', url);
      setIsImageModalOpen(false);
      setImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `blog/content/${postId}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      insertImage(url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor-container">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <Modal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)}
        title="Insérer une image"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border-subtle rounded-3xl cursor-pointer hover:border-accent-green hover:bg-background-secondary/30 transition-all">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-text-tertiary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Uploader</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            <div className="flex flex-col gap-3 justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center mb-1">Ou par URL</p>
              <div className="relative">
                <Input 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background-secondary border-border-subtle text-[10px] pr-10 rounded-xl h-12"
                />
                {imageUrl && (
                   <button onClick={() => setImageUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                     <X size={14} />
                   </button>
                )}
              </div>
              <Button 
                disabled={!imageUrl} 
                onClick={() => insertImage(imageUrl)}
                className="h-12 bg-accent-green text-black font-black uppercase tracking-widest text-[9px] rounded-xl"
              >
                Insérer
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}


