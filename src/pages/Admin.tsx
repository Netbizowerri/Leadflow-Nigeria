import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { AdminUser } from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Mail,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';

type ConfirmState = { id: string; name: string } | null;

export default function AdminPage() {
  const { isSuperAdmin, profile, refreshProfile } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<ConfirmState>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.rpc('admin_list_users');
    if (error) {
      setError(error.message);
    } else {
      setUsers((data as AdminUser[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass-panel rounded-2xl p-10 max-w-md text-center border border-red-900/40">
          <ShieldAlert className="mx-auto text-red-400 mb-4" size={40} />
          <h2 className="font-sora font-bold text-xl text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400">
            Only a verified Super Administrator can view the user management dashboard.
          </p>
        </div>
      </div>
    );
  }

  const verifiedCount = users.filter((u) => u.is_verified).length;
  const pendingCount = users.filter((u) => !u.is_verified).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;
  const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;

  const showAction = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleVerify = async (u: AdminUser, verified: boolean) => {
    setBusy(u.id);
    const { error } = await supabase.rpc('admin_verify_user', {
      target_user_id: u.id,
      verified,
    });
    setBusy(null);
    if (error) return showAction(error.message);
    await loadUsers();
    showAction(verified ? `Verified ${u.email}` : `Unverified ${u.email}`);
  };

  const handleToggleActive = async (u: AdminUser, active: boolean) => {
    setBusy(u.id);
    const { error } = await supabase.rpc('admin_set_user_active', {
      target_user_id: u.id,
      active,
    });
    setBusy(null);
    if (error) return showAction(error.message);
    await loadUsers();
    showAction(active ? `Activated ${u.email}` : `Deactivated ${u.email}`);
  };

  const handleRoleChange = async (u: AdminUser, role: string) => {
    setBusy(u.id);
    const { error } = await supabase.rpc('admin_set_user_role', {
      target_user_id: u.id,
      new_role: role,
    });
    setBusy(null);
    if (error) return showAction(error.message);
    await loadUsers();
    if (u.id === profile?.id) await refreshProfile();
    showAction(`Set ${u.email} role to ${role}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(confirmDelete.id);
    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: confirmDelete.id,
    });
    setBusy(null);
    if (error) {
      showAction(error.message);
      setConfirmDelete(null);
      return;
    }
    setConfirmDelete(null);
    await loadUsers();
    showAction(`Deleted ${confirmDelete.name}`);
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase">
            <ShieldCheck size={10} /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-sky-500/15 text-sky-300 border border-sky-500/30 uppercase">
            <Shield size={10} /> Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-500/15 text-slate-300 border border-slate-500/30 uppercase">
            <Users size={10} /> User
          </span>
        );
    }
  };

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const initials = (name: string, email: string) => {
    const src = name.trim() || email;
    return src.slice(0, 2).toUpperCase();
  };

  const renderActions = (u: AdminUser) => {
    const isSelf = u.id === profile?.id;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {busy === u.id && (
          <div className="h-3.5 w-3.5 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
        )}
        {u.is_verified ? (
          <button
            title="Unverify user"
            disabled={isSelf || busy === u.id}
            onClick={() => handleVerify(u, false)}
            className="p-2 rounded-md border border-slate-700 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
          >
            <UserX size={13} />
          </button>
        ) : (
          <button
            title="Verify user"
            disabled={busy === u.id}
            onClick={() => handleVerify(u, true)}
            className="p-2 rounded-md border border-slate-700 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
          >
            <UserCheck size={13} />
          </button>
        )}
        {u.is_active ? (
          <button
            title="Suspend user"
            disabled={isSelf || busy === u.id}
            onClick={() => handleToggleActive(u, false)}
            className="p-2 rounded-md border border-slate-700 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            <UserX size={13} />
          </button>
        ) : (
          <button
            title="Reactivate user"
            disabled={busy === u.id}
            onClick={() => handleToggleActive(u, true)}
            className="p-2 rounded-md border border-slate-700 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
          >
            <CheckCircle2 size={13} />
          </button>
        )}
        <button
          title="Delete user"
          disabled={isSelf || busy === u.id}
          onClick={() => setConfirmDelete({ id: u.id, name: u.email })}
          className="p-2 rounded-md border border-slate-700 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-colors disabled:opacity-40"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-widest uppercase mb-1.5">
            <Shield size={14} />
            Super Admin Console
          </div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Verify, manage roles, and control platform access. Actions are recorded server-side.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-bold text-slate-300 hover:border-emerald-500/50 hover:text-white transition-colors self-start"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-slate-200' },
          { label: 'Verified', value: verifiedCount, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-400' },
          { label: 'Inactive', value: inactiveCount, icon: UserX, color: 'text-red-400' },
          { label: 'Admins & Super', value: adminCount, icon: ShieldCheck, color: 'text-sky-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4">
            <stat.icon className={`${stat.color} mb-2`} size={18} />
            <div className={`text-2xl font-sora font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {actionMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-6 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-400 flex items-center gap-2"
        >
          <CheckCircle2 size={14} />
          <span className="font-mono">{actionMsg}</span>
        </motion.div>
      )}

      {error && (
        <div className="p-3 mb-6 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-400 flex items-center gap-2">
          <XCircle size={14} />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="h-6 w-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading user directory...</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="glass-panel rounded-2xl overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Verification</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold">Last Sign-in</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => {
                    const isSelf = u.id === profile?.id;
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                              {initials(u.full_name, u.email)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-slate-200 font-semibold text-sm truncate flex items-center gap-2">
                                {u.full_name || 'Unnamed'}
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold uppercase tracking-wide">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-xs font-mono truncate flex items-center gap-1">
                                <Mail size={10} /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {roleBadge(u.role)}
                            <select
                              value={u.role}
                              disabled={busy === u.id || isSelf}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className="bg-[#0F172A] border border-slate-700 rounded-md text-[10px] py-1 px-1.5 text-slate-300 focus:border-emerald-500 focus:outline-none disabled:opacity-40"
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {u.is_verified ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                              <CheckCircle2 size={13} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-mono">
                              <Clock size={13} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                              <Sparkles size={13} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-mono">
                              <XCircle size={13} /> Suspended
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs">{fmtDate(u.created_at)}</td>
                        <td className="px-4 py-4 text-slate-400 text-xs">{fmtDate(u.last_sign_in_at)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">{renderActions(u)}</div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                        <KeyRound className="mx-auto mb-2 text-slate-500" size={24} />
                        No users found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const isSelf = u.id === profile?.id;
              return (
                <div key={u.id} className="glass-panel rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                        {initials(u.full_name, u.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-200 font-semibold text-sm truncate">
                          {u.full_name || 'Unnamed'}
                        </div>
                        <div className="text-slate-500 text-xs font-mono truncate">{u.email}</div>
                      </div>
                    </div>
                    {isSelf && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold uppercase tracking-wide shrink-0">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-3">
                    {roleBadge(u.role)}
                    {u.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-mono">
                        <Clock size={11} /> Pending
                      </span>
                    )}
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                        <Sparkles size={11} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-mono">
                        <XCircle size={11} /> Suspended
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-3 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-mono uppercase tracking-wider text-[9px] shrink-0">
                        Role
                      </span>
                      <select
                        value={u.role}
                        disabled={busy === u.id || isSelf}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="bg-[#0F172A] border border-slate-700 rounded-md text-[11px] py-1 px-1.5 text-slate-300 focus:border-emerald-500 focus:outline-none disabled:opacity-40"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-mono uppercase tracking-wider text-[9px] shrink-0">
                        Joined
                      </span>
                      <span className="text-slate-300">{fmtDate(u.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-mono uppercase tracking-wider text-[9px] shrink-0">
                        Last Sign-in
                      </span>
                      <span className="text-slate-300">{fmtDate(u.last_sign_in_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-600">
                      Manage
                    </span>
                    {renderActions(u)}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="glass-panel rounded-2xl py-12 text-center text-slate-400 text-sm">
                <KeyRound className="mx-auto mb-2 text-slate-500" size={24} />
                No users found yet.
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-6 max-w-sm w-full border border-red-900/40"
          >
            <div className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="font-sora font-bold text-white text-lg mb-1">Delete user?</h3>
            <p className="text-sm text-slate-400 mb-5 break-all">
              <span className="font-mono text-slate-300">{confirmDelete.name}</span> will be permanently
              removed from the platform along with all their leads, settings, and history. This cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Delete permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}