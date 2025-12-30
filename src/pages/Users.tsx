import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { UserCard } from '@/components/users/UserCard';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Users as UsersIcon } from 'lucide-react';

const Users = () => {
  const { users, isLoading, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">Discover people on MicroPost</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to create an account!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div 
                key={user.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <UserCard user={user} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
