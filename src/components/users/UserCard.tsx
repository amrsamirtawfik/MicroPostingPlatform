import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PublicProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

interface UserCardProps {
  user: PublicProfile;
}

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <Card variant="interactive" className="group">
      <CardContent className="p-5">
        <Link to={`/users/${user.id}`} className="block">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/50 transition-all">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {user.displayName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
