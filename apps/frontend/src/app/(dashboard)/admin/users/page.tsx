'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Shield, MoreVertical, 
  CheckCircle2, AlertOctagon, UserX, UserCheck, Trash2, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [users, setUsers] = useState([
    { id: '1', name: 'Nishanth Varma', email: 'candidate@swipex.io', role: 'JOB_SEEKER', status: 'ACTIVE', joined: '2026-01-15', applications: 18 },
    { id: '2', name: 'Sarah Jenkins', email: 'recruiter@techcorp.com', role: 'RECRUITER', status: 'ACTIVE', joined: '2026-02-01', applications: 142 },
    { id: '3', name: 'Alex Morgan', email: 'admin@swipex.io', role: 'ADMIN', status: 'ACTIVE', joined: '2025-11-10', applications: 0 },
    { id: '4', name: 'David Chen', email: 'david.chen@gmail.com', role: 'JOB_SEEKER', status: 'SUSPENDED', joined: '2026-03-12', applications: 3 },
    { id: '5', name: 'Elena Rostova', email: 'elena@innovate.dev', role: 'RECRUITER', status: 'ACTIVE', joined: '2026-04-05', applications: 89 },
  ]);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Directory & Governance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage candidates, recruiters, and platform administrators.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-3xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
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
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6">Activity Count</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-600' :
                      u.role === 'RECRUITER' ? 'bg-indigo-500/10 text-indigo-600' :
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
                  <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{u.joined}</td>
                  <td className="py-4 px-6 text-xs font-bold">{u.applications} events</td>
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
