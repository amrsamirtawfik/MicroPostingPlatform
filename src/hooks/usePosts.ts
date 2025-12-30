import { useState, useCallback } from 'react';
import { PostWithAuthor } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.posts.getAll();
      if (response.data) {
        setPosts(response.data);
      } else if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPost = useCallback(async (content: string) => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const response = await api.posts.create(user.id, content);
      if (response.data) {
        // Refetch to get post with author info
        await fetchPosts();
        toast({
          title: 'Success',
          description: 'Your post has been published!',
        });
      } else if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  }, [user, fetchPosts, toast]);

  const deletePost = useCallback(async (postId: string) => {
    if (!user) return;
    
    setDeletingPostId(postId);
    try {
      const response = await api.posts.delete(postId, user.id);
      if (response.data) {
        setPosts(prev => prev.filter(p => p.id !== postId));
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
    } finally {
      setDeletingPostId(null);
    }
  }, [user, toast]);

  return {
    posts,
    isLoading,
    isCreating,
    deletingPostId,
    fetchPosts,
    createPost,
    deletePost,
  };
};
