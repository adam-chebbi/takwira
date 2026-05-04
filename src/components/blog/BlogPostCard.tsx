import * as React from 'react';
import { BlogPost } from '@/src/lib/schema';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const publishedDate = post.publishedAt?.toDate() || new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className="bg-white border border-border-subtle rounded-[24px] overflow-hidden hover:border-pl-purple/30 transition-all duration-500 h-full flex flex-col shadow-pl">
          {/* Image Container */}
          <div className="aspect-[16/9] overflow-hidden relative">
            <img 
              src={post.coverImageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Category Overlay */}
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="purple" className="shadow-md text-[9px] h-7 px-3">
                {post.category}
              </Badge>
            </div>
            {/* Read Time Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-[#faf9fa]/80 backdrop-blur-md text-pl-purple border border-border-subtle font-bold text-[9px] uppercase tracking-widest h-7 px-3 rounded-full flex items-center gap-1.5 shadow-sm">
                <Clock size={10} /> {post.readTime}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight text-pl-purple mb-3 group-hover:text-pl-pink transition-colors line-clamp-2 leading-none">
              {post.title}
            </h3>
            
            <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-1 font-sans">
              {post.excerpt}
            </p>

            <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                {post.authorAvatarUrl ? (
                  <img src={post.authorAvatarUrl} className="w-8 h-8 rounded-full object-cover border border-border-subtle" alt={post.authorName} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-background-primary flex items-center justify-center text-[10px] font-bold text-pl-purple border border-border-subtle">
                    {post.authorName.charAt(0)}
                  </div>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {post.authorName}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <Calendar size={12} className="text-pl-purple" />
                {format(publishedDate, 'dd MMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
