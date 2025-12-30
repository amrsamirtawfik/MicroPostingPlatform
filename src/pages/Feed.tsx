import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { PostList } from '@/components/posts/PostList';
import { usePosts } from '@/hooks/usePosts';
import { PostWithAuthor } from '@/types';

const Feed = () => {
  const { 
    posts, 
    isLoading, 
    isCreating, 
    deletingPostId,
    fetchPosts, 
    createPost,
    deletePost 
  } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground mt-1">See what everyone is posting</p>
        </div>
        
        <CreatePostForm onSubmit={createPost} isLoading={isCreating} />
        
        <PostList 
          posts={posts as PostWithAuthor[]} 
          isLoading={isLoading}
          onDelete={deletePost}
          deletingPostId={deletingPostId}
          emptyMessage="No posts yet. Be the first to post!"
        />
      </div>
    </Layout>
  );
};

export default Feed;
