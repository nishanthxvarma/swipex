'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Shield, CheckCircle2, AlertOctagon, Loader2, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersApi } from '@swipex/api';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.listAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load users from backend database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-[#66788A] animate-pulse">Loading users directory from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col justify-center items-center h-[50vh] text-center p-6 border border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
        <h3 className="font-bold text-lg">Connection Failure</h3>
        <p className="text-xs text-[#66788A] max-w-sm mb-4">{error}</p>
        <Button onClick={() => loadUsers()} className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Directory &amp; Governance</h1>
          <p className="text-[#66788A] text-sm mt-1">
            Manage candidates, recruiters, and platform administrators.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-1 p-4 rounded-3xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#66788A]" />
          <Input
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'JOB_SEEKER', 'RECRUITER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'glass-1 text-[#66788A] hover:text-[#F5FAFF]'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-1 border rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b glass-1/30 text-[#66788A] text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6">Activity Count</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#66788A] text-xs font-semibold">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:glass-1/20 transition-colors">
                  <td className="py-4 px-6 font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {(u.name || u.email || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#F5FAFF]">{u.name}</p>
                        <p className="text-xs text-[#66788A]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-[#BFE8FF]/10 text-[#7DD3FC]' :
                      u.role === 'RECRUITER' ? 'bg-[#7DD3FC]/10 text-[#2563EB]' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                      u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-[#66788A] font-medium">{u.joined}</td>
                  <td className="py-4 px-6 text-xs font-bold">{u.applications ?? 0} events</td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleUserStatus(u.id)}
                      className={`rounded-xl text-xs font-semibold ${
                        u.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-500/10 border-rose-500/30' : 'text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
