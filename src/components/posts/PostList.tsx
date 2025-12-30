import { PostWithAuthor } from '@/types';
import { PostCard } from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface PostListProps {
  posts: PostWithAuthor[];
  isLoading?: boolean;
  onDelete?: (postId: string) => void;
  deletingPostId?: string | null;
  emptyMessage?: string;
}

export const PostList = ({ 
  posts, 
  isLoading, 
  onDelete, 
  deletingPostId,
  emptyMessage = "No posts yet" 
}: PostListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div 
          key={post.id} 
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PostCard 
            post={post} 
            onDelete={onDelete}
            isDeleting={deletingPostId === post.id}
          />
        </div>
      ))}
    </div>
  );
};
