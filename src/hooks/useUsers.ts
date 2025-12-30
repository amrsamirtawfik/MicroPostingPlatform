import { useState, useCallback } from 'react';
import { PublicProfile, Post } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.users.getAll();
      if (response.data) {
        setUsers(response.data);
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

  return {
    users,
    isLoading,
    fetchUsers,
  };
};

export const useUserProfile = () => {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.users.getById(userId);
      if (response.data) {
        setProfile(response.data);
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

  const fetchUserPosts = useCallback(async (userId: string) => {
    setIsLoadingPosts(true);
    try {
      const response = await api.posts.getByUserId(userId);
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
      setIsLoadingPosts(false);
    }
  }, [toast]);

  return {
    profile,
    posts,
    isLoading,
    isLoadingPosts,
    fetchProfile,
    fetchUserPosts,
  };
};
