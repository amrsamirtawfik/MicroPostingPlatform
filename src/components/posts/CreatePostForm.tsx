import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { MAX_POST_LENGTH } from '@/lib/validators';

interface CreatePostFormProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreatePostForm = ({ onSubmit, isLoading }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  
  const remainingChars = MAX_POST_LENGTH - content.length;
  const isValid = content.trim().length > 0 && content.length <= MAX_POST_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <Card variant="glass" className="mb-6">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <Avatar className="h-11 w-11 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {user?.displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none bg-input border-border focus:border-primary"
                maxLength={MAX_POST_LENGTH + 50}
              />
              
              <div className="flex items-center justify-between">
                <span className={`text-sm ${remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {remainingChars} characters remaining
                </span>
                
                <Button 
                  type="submit" 
                  variant="glow"
                  disabled={!isValid || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
