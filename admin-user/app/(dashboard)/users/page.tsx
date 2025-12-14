// admin-user/src/app/users/page.tsx
"use client";

import { UserTable } from '@/components/users/UserTable';
import { UserFormModal } from '@/components/users/UserFormModal';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const initialUsers: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'ADMIN', status: 'Active' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', status: 'Active' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'USER', status: 'Inactive' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'EDITOR', status: 'Active' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleSaveUser = (user: User) => {
    if (currentUser) {
      setUsers(users.map((u) => (u.id === user.id ? user : u)));
    } else {
      setUsers([...users, user]);
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
      
      <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        currentUser={currentUser}
      />
    </div>
  );
}
