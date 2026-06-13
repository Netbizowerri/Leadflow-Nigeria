/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, LeadStatus, WebhookLog } from '../types';

interface AppContextProps {
  isLoggedIn: boolean;
  hunterApiKey: string;
  privyrWebhookUrl: string;
  customWebhookUrl: string;
  webhookAuthHeader: string;
  webhookAuthValue: string;
  leads: Lead[];
  claimedLeadIds: string[];
  blockedLeadPhones: string[];
  webhookHistory: WebhookLog[];
  searchHistory: string[];
  login: () => void;
  logout: () => void;
  saveKeys: (hunterKey: string) => void;
  saveWebhookConfig: (config: {
    privyrWebhookUrl?: string;
    customWebhookUrl?: string;
    webhookAuthHeader?: string;
    webhookAuthValue?: string;
  }) => void;
  addLeadManual: (lead: Omit<Lead, 'id' | 'dateAdded' | 'status'> & { id?: string }) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  deleteLead: (leadId: string) => void;
  blockLead: (phone: string) => void;
  claimLeadAndSendToCRM: (lead: Lead) => Promise<boolean>;
  bulkSendToCRM: (leads: Lead[]) => Promise<{ successCount: number; failedCount: number }>;
  clearClaimedLeads: () => void;
  addSearchHistory: (query: string, location: string) => void;
  clearSearchHistory: () => void;
  testWebhook: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // --- Persistent States ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lf_is_logged_in') === 'true';
  });

  const [hunterApiKey, setHunterApiKey] = useState<string>(() => {
    return localStorage.getItem('lf_hunter_api_key') || '';
  });

  const [privyrWebhookUrl, setPrivyrWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('lf_privyr_webhook_url') || '';
  });

  const [customWebhookUrl, setCustomWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('lf_custom_webhook_url') || '';
  });

  const [webhookAuthHeader, setWebhookAuthHeader] = useState<string>(() => {
    return localStorage.getItem('lf_webhook_auth_header') || 'Authorization';
  });

  const [webhookAuthValue, setWebhookAuthValue] = useState<string>(() => {
    return localStorage.getItem('lf_webhook_auth_value') || '';
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('lf_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [claimedLeadIds, setClaimedLeadIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lf_claimed_lead_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [webhookHistory, setWebhookHistory] = useState<WebhookLog[]>(() => {
    const saved = localStorage.getItem('lf_webhook_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('lf_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [blockedLeadPhones, setBlockedLeadPhones] = useState<string[]>(() => {
    const saved = localStorage.getItem('lf_blocked_phones');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Effects to Sync with LocalStorage ---
  useEffect(() => {
    localStorage.setItem('lf_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('lf_hunter_api_key', hunterApiKey);
  }, [hunterApiKey]);

  useEffect(() => {
    localStorage.setItem('lf_privyr_webhook_url', privyrWebhookUrl);
  }, [privyrWebhookUrl]);

  useEffect(() => {
    localStorage.setItem('lf_custom_webhook_url', customWebhookUrl);
  }, [customWebhookUrl]);

  useEffect(() => {
    localStorage.setItem('lf_webhook_auth_header', webhookAuthHeader);
  }, [webhookAuthHeader]);

  useEffect(() => {
    localStorage.setItem('lf_webhook_auth_value', webhookAuthValue);
  }, [webhookAuthValue]);

  useEffect(() => {
    localStorage.setItem('lf_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('lf_claimed_lead_ids', JSON.stringify(claimedLeadIds));
  }, [claimedLeadIds]);

  useEffect(() => {
    localStorage.setItem('lf_webhook_history', JSON.stringify(webhookHistory));
  }, [webhookHistory]);

  useEffect(() => {
    localStorage.setItem('lf_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('lf_blocked_phones', JSON.stringify(blockedLeadPhones));
  }, [blockedLeadPhones]);

  // --- Auth Handlers ---
  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // --- API / Key Configuration ---
  const saveKeys = (hunterKey: string) => {
    setHunterApiKey(hunterKey.trim());
  };

  const saveWebhookConfig = (config: {
    privyrWebhookUrl?: string;
    customWebhookUrl?: string;
    webhookAuthHeader?: string;
    webhookAuthValue?: string;
  }) => {
    if (config.privyrWebhookUrl !== undefined) setPrivyrWebhookUrl(config.privyrWebhookUrl.trim());
    if (config.customWebhookUrl !== undefined) setCustomWebhookUrl(config.customWebhookUrl.trim());
    if (config.webhookAuthHeader !== undefined) setWebhookAuthHeader(config.webhookAuthHeader.trim());
    if (config.webhookAuthValue !== undefined) setWebhookAuthValue(config.webhookAuthValue.trim());
  };

  // --- Leads Handlers ---
  const addLeadManual = (leadData: Omit<Lead, 'id' | 'dateAdded' | 'status'> & { id?: string }) => {
    const generatedId = leadData.id || `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check duplication
    if (leads.some(l => l.id === generatedId || (l.phone && l.phone === leadData.phone))) {
      return; // Already exists
    }

    const newLead: Lead = {
      ...leadData,
      id: generatedId,
      status: 'New',
      dateAdded: new Date().toISOString(),
    };

    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes } : l));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const clearClaimedLeads = () => {
    setClaimedLeadIds([]);
  };

  const addSearchHistory = (query: string, location: string) => {
    const entry = `${query} in ${location}`;
    setSearchHistory(prev => {
      const filtered = prev.filter(e => e !== entry);
      return [entry, ...filtered].slice(0, 10); // Keep top 10
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const blockLead = (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) return;
    setBlockedLeadPhones(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
  };

  // --- Webhook / CRM delivery mechanism (REST API call to our backend proxy) ---
  const claimLeadAndSendToCRM = async (lead: Lead): Promise<boolean> => {
    const crmUrls = [privyrWebhookUrl, customWebhookUrl].filter(Boolean);
    if (crmUrls.length === 0) {
      // Even if no CRM configured, let's claim it and save to local Leads database
      setClaimedLeadIds(prev => [...prev, lead.id]);
      
      // Auto save as "New" lead in local leads database if not already there
      if (!leads.some(l => l.id === lead.id)) {
        setLeads(prev => [{ ...lead, status: 'New', dateAdded: new Date().toISOString() }, ...prev]);
      } else {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'New' } : l));
      }
      return true;
    }

    let overallSuccess = false;

    // Send to webhooks sequentially
    for (const url of crmUrls) {
      const isPrivyr = url === privyrWebhookUrl;
      const headersConfig: Record<string, string> = {};
      
      if (!isPrivyr && webhookAuthHeader && webhookAuthValue) {
        headersConfig[webhookAuthHeader] = webhookAuthValue;
      }

      const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      try {
        const response = await fetch('/api/proxy-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
                manualVerificationUrl: `https://www.google.com/maps/place/?q=place_id:${lead.id}`
              }
            },
            headers: headersConfig
          }),
        });

        const data = await response.json();
        const success = response.ok && data.success;

        // Log the event
        const newLog: WebhookLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          leadName: lead.name,
          url: url || '',
          status: success ? 'success' : 'failure',
          statusCode: response.status,
          responsePreview: success ? 'Lead successfully delivered' : (data.error || 'Server error'),
        };

        setWebhookHistory(prev => [newLog, ...prev]);

        if (success) {
          overallSuccess = true;
        }
      } catch (err: any) {
        const newLog: WebhookLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          leadName: lead.name,
          url: url || '',
          status: 'failure',
          statusCode: 500,
          responsePreview: err.message || 'Network error delivering webhook',
        };
        setWebhookHistory(prev => [newLog, ...prev]);
      }
    }

    // Claim the lead: hide from searches, store in local DB
    setClaimedLeadIds(prev => [...prev, lead.id]);
    
    // Save to local leads DB so the developer can review what was sent
    if (!leads.some(l => l.id === lead.id)) {
      setLeads(prev => [{ ...lead, status: 'New', dateAdded: new Date().toISOString() }, ...prev]);
    } else {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'New' } : l));
    }

    return overallSuccess || crmUrls.length > 0;
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
    const url = privyrWebhookUrl || customWebhookUrl;
    if (!url) {
      return { success: false, message: 'Please configure at least one Webhook URL first.' };
    }

    const headersConfig: Record<string, string> = {};
    if (!privyrWebhookUrl && webhookAuthHeader && webhookAuthValue) {
      headersConfig[webhookAuthHeader] = webhookAuthValue;
    }

    try {
      const response = await fetch('/api/proxy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          payload: {
            name: "John Doe (Test Lead)",
            phone: "+2348031234567",
            email: "john@example.com",
            address: "123 Herbert Macaulay Way, Yaba, Lagos, Nigeria",
            category: "Real Estate Agents",
            rating: 4.5,
            source: 'Manual',
            notes: "This is a test notification generated from LeadFlow Nigeria."
          },
          headers: headersConfig
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: 'Test webhook sent successfully! Check your CRM app.' };
      } else {
        return { success: false, message: `Failed: ${data.error || 'Server responded with error'}` };
      }
    } catch (err: any) {
      return { success: false, message: `Network error: ${err.message || err}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        hunterApiKey,
        privyrWebhookUrl,
        customWebhookUrl,
        webhookAuthHeader,
        webhookAuthValue,
        leads,
        claimedLeadIds,
        blockedLeadPhones,
        webhookHistory,
        searchHistory,
        login,
        logout,
        saveKeys,
        saveWebhookConfig,
        addLeadManual,
        updateLeadStatus,
        updateLeadNotes,
        deleteLead,
        blockLead,
        claimLeadAndSendToCRM,
        bulkSendToCRM,
        clearClaimedLeads,
        addSearchHistory,
        clearSearchHistory,
        testWebhook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
