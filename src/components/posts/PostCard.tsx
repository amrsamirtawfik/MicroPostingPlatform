import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PostWithAuthor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PostCardProps {
  post: PostWithAuthor;
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
}

export const PostCard = ({ post, onDelete, isDeleting }: PostCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.userId;

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Link to={`/users/${post.author.id}`}>
            <Avatar className="h-11 w-11 ring-2 ring-border hover:ring-primary/50 transition-all">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {post.author.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link 
                  to={`/users/${post.author.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {post.author.displayName}
                </Link>
                <span className="text-muted-foreground text-sm">·</span>
                <time className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </time>
              </div>
              
              {isOwner && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(post.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <p className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
