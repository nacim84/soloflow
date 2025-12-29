// admin-user/src/app/(dashboard)/users/page.tsx
"use client";

import { UserTable } from '@/components/users/UserTable';
import { UserFormModal } from '@/components/users/UserFormModal';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { getUsers } from '@/app/actions/user-actions';

// Adapter le type User
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  image?: string | null;
  // Champs optionnels pour compatibilité avec le Modal existant (à refactorer plus tard)
  role?: string; 
  status?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      const res = await getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
      setIsLoading(false);
    }
    loadUsers();
  }, []);

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? (Mock action)')) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleSaveUser = (user: any) => {
    // Mock save logic for now - needs backend action
    if (currentUser) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
    } else {
      const newUser = { ...user, id: Date.now().toString(), createdAt: new Date(), emailVerified: false };
      setUsers([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your team members and their account permissions here.</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      )}
      
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        currentUser={currentUser as any} // Cast temporaire
      />
    </div>
  );
}