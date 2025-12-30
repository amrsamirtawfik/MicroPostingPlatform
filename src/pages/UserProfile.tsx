import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { useUserProfile } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PostWithAuthor } from '@/types';
import { useState } from 'react';
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

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { profile, posts, isLoading, isLoadingPosts, fetchProfile, fetchUserPosts } = useUserProfile();
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
      fetchUserPosts(userId);
    }
  }, [userId, fetchProfile, fetchUserPosts]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    
    setDeletingPostId(postId);
    const response = await api.posts.delete(postId, currentUser.id);
    
    if (response.data) {
      setLocalPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: 'Deleted',
        description: 'Your post has been deleted.',
      });
    } else if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
    }
    
    setDeletingPostId(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <Skeleton className="h-8 w-24 mb-8" />
          <Card variant="glass">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-2">User not found</h1>
            <p className="text-muted-foreground mb-6">This user doesn't exist or has been deleted.</p>
            <Link to="/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Create PostWithAuthor for display
  const postsWithAuthor: PostWithAuthor[] = localPosts.map(post => ({
    ...post,
    author: profile,
  }));

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to="/users" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>

        {/* Profile Header */}
        <Card variant="glass" className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {localPosts.length} {localPosts.length === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Posts */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Posts</h2>
        </div>

        {isLoadingPosts ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : postsWithAuthor.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {postsWithAuthor.map((post, index) => (
              <Card 
                key={post.id} 
                variant="elevated" 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {post.content}
                      </p>
                      <time className="text-sm text-muted-foreground mt-3 block">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                    
                    {isOwnProfile && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            disabled={deletingPostId === post.id}
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
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
