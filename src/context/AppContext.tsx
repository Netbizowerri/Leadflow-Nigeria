/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, getSessionToken } from '../lib/supabase';
import {
  Lead,
  LeadStatus,
  WebhookLog,
  UserProfile,
  UserSettings,
} from '../types';

interface AuthResult {
  error: string | null;
}

interface AppContextProps {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  isVerified: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Configuration / settings
  hunterApiKey: string;
  privyrWebhookUrl: string;
  customWebhookUrl: string;
  webhookAuthHeader: string;
  webhookAuthValue: string;
  saveKeys: (hunterKey: string) => Promise<void>;
  saveWebhookConfig: (config: {
    privyrWebhookUrl?: string;
    customWebhookUrl?: string;
    webhookAuthHeader?: string;
    webhookAuthValue?: string;
  }) => Promise<void>;

  // Leads / CRM pipeline
  leads: Lead[];
  claimedLeadIds: string[];
  blockedLeadPhones: string[];
  addLeadManual: (lead: Omit<Lead, 'id' | 'dateAdded' | 'status'> & { id?: string }) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  blockLead: (phone: string) => Promise<void>;
  claimLeadAndSendToCRM: (lead: Lead) => Promise<boolean>;
  bulkSendToCRM: (leads: Lead[]) => Promise<{ successCount: number; failedCount: number }>;
  clearClaimedLeads: () => Promise<void>;

  // Search history
  searchHistory: string[];
  clearSearchHistory: () => Promise<void>;

  // Webhook history
  webhookHistory: WebhookLog[];
  testWebhook: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  user_id: '',
  hunter_api_key: '',
  privyr_webhook_url: '',
  custom_webhook_url: '',
  webhook_auth_header: 'Authorization',
  webhook_auth_value: '',
  created_at: '',
  updated_at: '',
};

// -------------------------------------------------------------
// Mapping helpers: DB snake_case <-> app camelCase
// -------------------------------------------------------------
function rowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    rating: row.rating != null ? Number(row.rating) : null,
    userRatingsTotal: row.user_ratings_total ?? null,
    category: row.category,
    status: row.status,
    source: row.source,
    notes: row.notes,
    dateAdded: row.date_added,
    originalSearchQuery: row.original_search_query ?? undefined,
    website: row.website ?? null,
    hasWebsite: row.has_website ?? false,
  };
}

function leadToRow(lead: Lead, userId: string): any {
  return {
    id: lead.id,
    user_id: userId,
    name: lead.name,
    phone: lead.phone,
    email: lead.email ?? '',
    address: lead.address,
    rating: lead.rating,
    user_ratings_total: lead.userRatingsTotal,
    category: lead.category,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    date_added: lead.dateAdded,
    original_search_query: lead.originalSearchQuery ?? null,
    website: lead.website ?? null,
    has_website: lead.hasWebsite ?? false,
  };
}

function logToRow(log: WebhookLog, userId: string): any {
  return {
    id: log.id,
    user_id: userId,
    timestamp: log.timestamp,
    lead_name: log.leadName,
    url: log.url,
    status: log.status,
    status_code: log.statusCode,
    response_preview: log.responsePreview,
  };
}

function rowToLog(row: any): WebhookLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    leadName: row.lead_name,
    url: row.url,
    status: row.status,
    statusCode: row.status_code,
    responsePreview: row.response_preview,
  };
}

function rowToSettings(row: any): UserSettings {
  return row ? { ...DEFAULT_SETTINGS, ...row } : { ...DEFAULT_SETTINGS };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // -----------------------------------------------------------
  // Auth state
  // -----------------------------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    void loadProfile(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user]);

  const isLoggedIn = !!user;
  const isSuperAdmin = profile?.role === 'super_admin' && profile.is_verified && profile.is_active;
  const isVerified = !!profile?.is_verified;

  // -----------------------------------------------------------
  // Data state (only hydrated once profile is verified)
  // -----------------------------------------------------------
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [claimedLeadIds, setClaimedLeadIds] = useState<string[]>([]);
  const [blockedLeadPhones, setBlockedLeadPhones] = useState<string[]>([]);
  const [webhookHistory, setWebhookHistory] = useState<WebhookLog[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    const [settingsRes, leadsRes, logsRes, historyRes, blockedRes] = await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('leads').select('*').eq('user_id', userId).order('date_added', { ascending: false }),
      supabase.from('webhook_logs').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
      supabase.from('search_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('blocked_phones').select('phone').eq('user_id', userId),
    ]);

    if (!settingsRes.error && settingsRes.data) setSettings(rowToSettings(settingsRes.data));
    if (!leadsRes.error && leadsRes.data) {
      setLeads(leadsRes.data.map(rowToLead));
      setClaimedLeadIds(leadsRes.data.filter((l: any) => l.claimed).map((l: any) => l.id));
    }
    if (!logsRes.error && logsRes.data) setWebhookHistory(logsRes.data.map(rowToLog));
    if (!historyRes.error && historyRes.data) {
      setSearchHistory(
        historyRes.data.map((h: any) => `${h.query} in ${h.location}`).slice(0, 10)
      );
    }
    if (!blockedRes.error && blockedRes.data) {
      setBlockedLeadPhones(blockedRes.data.map((b: any) => b.phone));
    }
    setLoaded(true);
  }, []);

  // Hydrate all user data once we have a verified profile
  useEffect(() => {
    if (!user || !profile) {
      setLeads([]);
      setClaimedLeadIds([]);
      setBlockedLeadPhones([]);
      setWebhookHistory([]);
      setSearchHistory([]);
      setLoaded(false);
      return;
    }
    void loadUserData(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.id, isVerified]);

  // -----------------------------------------------------------
  // Auth handlers
  // -----------------------------------------------------------
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // -----------------------------------------------------------
  // Settings handlers
  // -----------------------------------------------------------
  const saveKeys = async (hunterKey: string) => {
    if (!user) return;
    const next = { ...settings, hunter_api_key: hunterKey.trim() };
    await upsertSettings(next);
    setSettings(next);
  };

  const saveWebhookConfig = async (config: {
    privyrWebhookUrl?: string;
    customWebhookUrl?: string;
    webhookAuthHeader?: string;
    webhookAuthValue?: string;
  }) => {
    if (!user) return;
    const next: UserSettings = { ...settings };
    if (config.privyrWebhookUrl !== undefined) next.privyr_webhook_url = config.privyrWebhookUrl.trim();
    if (config.customWebhookUrl !== undefined) next.custom_webhook_url = config.customWebhookUrl.trim();
    if (config.webhookAuthHeader !== undefined) next.webhook_auth_header = config.webhookAuthHeader.trim();
    if (config.webhookAuthValue !== undefined) next.webhook_auth_value = config.webhookAuthValue.trim();
    await upsertSettings(next);
    setSettings(next);
  };

  const upsertSettings = async (next: UserSettings) => {
    if (!user) return;
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      hunter_api_key: next.hunter_api_key,
      privyr_webhook_url: next.privyr_webhook_url,
      custom_webhook_url: next.custom_webhook_url,
      webhook_auth_header: next.webhook_auth_header,
      webhook_auth_value: next.webhook_auth_value,
    });
  };

  // -----------------------------------------------------------
  // Leads handlers
  // -----------------------------------------------------------
  const addLeadManual = async (leadData: Omit<Lead, 'id' | 'dateAdded' | 'status'> & { id?: string }) => {
    if (!user || !profile) return;
    const generatedId = leadData.id || `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (leads.some((l) => l.id === generatedId || (l.phone && l.phone === leadData.phone))) return;

    const newLead: Lead = {
      ...leadData,
      id: generatedId,
      status: 'New',
      dateAdded: new Date().toISOString(),
    };

    const { error } = await supabase.from('leads').insert(leadToRow(newLead, user.id));
    if (!error) setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    if (!user) return;
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId).eq('user_id', user.id);
    if (!error) setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    if (!user) return;
    const { error } = await supabase.from('leads').update({ notes }).eq('id', leadId).eq('user_id', user.id);
    if (!error) setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes } : l)));
  };

  const deleteLead = async (leadId: string) => {
    if (!user) return;
    const { error } = await supabase.from('leads').delete().eq('id', leadId).eq('user_id', user.id);
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const blockLead = async (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed || !user) return;
    if (blockedLeadPhones.includes(trimmed)) return;
    const { error } = await supabase.from('blocked_phones').insert({ user_id: user.id, phone: trimmed });
    if (!error) setBlockedLeadPhones((prev) => [...prev, trimmed]);
  };

  const clearClaimedLeads = async () => {
    if (!user) return;
    setClaimedLeadIds([]);
  };

  // -----------------------------------------------------------
  // Search history
  // -----------------------------------------------------------
  const addSearchHistory = async (query: string, location: string) => {
    if (!user) return;
    const entry = `${query} in ${location}`;
    await supabase.from('search_history').insert({ user_id: user.id, query, location });
    setSearchHistory((prev) => [entry, ...prev.filter((e) => e !== entry)].slice(0, 10));
  };

  const clearSearchHistory = async () => {
    if (!user) return;
    await supabase.from('search_history').delete().eq('user_id', user.id);
    setSearchHistory([]);
  };

  // -----------------------------------------------------------
  // Webhook / CRM delivery
  // -----------------------------------------------------------
  const recordWebhookLog = async (log: WebhookLog) => {
    if (!user) return;
    const { error } = await supabase.from('webhook_logs').insert(logToRow(log, user.id));
    if (!error) setWebhookHistory((prev) => [log, ...prev]);
  };

  const claimLeadAndSendToCRM = async (lead: Lead): Promise<boolean> => {
    if (!user) return false;
    const crmUrls = [settings.privyr_webhook_url, settings.custom_webhook_url].filter(Boolean);
    if (crmUrls.length === 0) {
      // No CRM configured: claim the lead and store in pipeline
      await supabase
        .from('leads')
        .upsert({ ...leadToRow(lead, user.id), claimed: true });

      setClaimedLeadIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
      setLeads((prev) => prev.some((l) => l.id === lead.id)
        ? prev.map((l) => (l.id === lead.id ? { ...l, status: 'New' as LeadStatus } : l))
        : [{ ...lead, status: 'New' as LeadStatus, dateAdded: lead.dateAdded || new Date().toISOString() }, ...prev]);
      return true;
    }

    let overallSuccess = false;

    for (const url of crmUrls) {
      const isPrivyr = url === settings.privyr_webhook_url;
      const headersConfig: Record<string, string> = {};
      if (!isPrivyr && settings.webhook_auth_header && settings.webhook_auth_value) {
        headersConfig[settings.webhook_auth_header] = settings.webhook_auth_value;
      }

      const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      try {
        const token = await getSessionToken();
        const response = await fetch('/api/proxy-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            url,
            payload: {
              name: lead.name,
              phone: lead.phone,
              email: lead.email || '',
              address: lead.address,
              category: lead.category,
              rating: lead.rating,
              source: lead.source,
              notes: lead.notes || `Discovered with LeadFlow Nigeria. Needs website development. ${lead.userRatingsTotal ? `Total Google Reviews: ${lead.userRatingsTotal}` : ''}`,
              meta: {
                place_id: lead.id,
                dateDiscovered: lead.dateAdded || new Date().toISOString(),
                manualVerificationUrl: `https://www.google.com/maps/place/?q=place_id:${lead.id}`,
              },
            },
            headers: headersConfig,
          }),
        });

        const data = await response.json();
        const success = response.ok && data.success;

        await recordWebhookLog({
          id: logId,
          timestamp: new Date().toISOString(),
          leadName: lead.name,
          url: url || '',
          status: success ? 'success' : 'failure',
          statusCode: response.status,
          responsePreview: success ? 'Lead successfully delivered' : (data.error || 'Server error'),
        });

        if (success) overallSuccess = true;
      } catch (err: any) {
        await recordWebhookLog({
          id: logId,
          timestamp: new Date().toISOString(),
          leadName: lead.name,
          url: url || '',
          status: 'failure',
          statusCode: 500,
          responsePreview: err.message || 'Network error delivering webhook',
        });
      }
    }

    if (!overallSuccess) return false;

    // Persist the claimed lead
    await supabase
      .from('leads')
      .upsert({ ...leadToRow(lead, user.id), claimed: true });

    setClaimedLeadIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
    setLeads((prev) => prev.some((l) => l.id === lead.id)
      ? prev.map((l) => (l.id === lead.id ? { ...l, status: 'New' as LeadStatus } : l))
      : [{ ...lead, status: 'New' as LeadStatus, dateAdded: lead.dateAdded || new Date().toISOString() }, ...prev]);

    return true;
  };

  const bulkSendToCRM = async (leadsToBulk: Lead[]): Promise<{ successCount: number; failedCount: number }> => {
    let successCount = 0;
    let failedCount = 0;

    for (const lead of leadsToBulk) {
      const ok = await claimLeadAndSendToCRM(lead);
      if (ok) successCount++;
      else failedCount++;
    }

    return { successCount, failedCount };
  };

  const testWebhook = async (): Promise<{ success: boolean; message: string }> => {
    const url = settings.privyr_webhook_url || settings.custom_webhook_url;
    if (!url) {
      return { success: false, message: 'Please configure at least one Webhook URL first.' };
    }

    const headersConfig: Record<string, string> = {};
    if (!settings.privyr_webhook_url && settings.webhook_auth_header && settings.webhook_auth_value) {
      headersConfig[settings.webhook_auth_header] = settings.webhook_auth_value;
    }

    try {
      const token = await getSessionToken();
      const response = await fetch('/api/proxy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url,
          payload: {
            name: 'John Doe (Test Lead)',
            phone: '+2348031234567',
            email: 'john@example.com',
            address: '123 Herbert Macaulay Way, Yaba, Lagos, Nigeria',
            category: 'Real Estate Agents',
            rating: 4.5,
            source: 'Manual',
            notes: 'This is a test notification generated from LeadFlow Nigeria.',
          },
          headers: headersConfig,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: 'Test webhook sent successfully! Check your CRM app.' };
      }
      return { success: false, message: `Failed: ${data.error || 'Server responded with error'}` };
    } catch (err: any) {
      return { success: false, message: `Network error: ${err.message || err}` };
    }
  };

  const value: AppContextProps = {
    user,
    profile,
    isLoading,
    isLoggedIn,
    isSuperAdmin,
    isVerified,
    signIn,
    signUp,
    signOut,
    refreshProfile,

    hunterApiKey: settings.hunter_api_key,
    privyrWebhookUrl: settings.privyr_webhook_url,
    customWebhookUrl: settings.custom_webhook_url,
    webhookAuthHeader: settings.webhook_auth_header,
    webhookAuthValue: settings.webhook_auth_value,
    saveKeys,
    saveWebhookConfig,

    leads,
    claimedLeadIds,
    blockedLeadPhones,
    addLeadManual,
    updateLeadStatus,
    updateLeadNotes,
    deleteLead,
    blockLead,
    claimLeadAndSendToCRM,
    bulkSendToCRM,
    clearClaimedLeads,

searchHistory,
    clearSearchHistory,

    webhookHistory,
    testWebhook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}