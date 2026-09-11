/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Not Interested';

export interface Lead {
  id: string; // place_id for Google maps or custom ID
  name: string;
  phone: string;
  email: string | null;
  address: string;
  rating: number | null;
  userRatingsTotal: number | null;
  category: string;
  status: LeadStatus;
  source: 'Google Maps' | 'Nigerian Directories' | 'VConnect' | 'BusinessList' | 'Manual';
  notes: string;
  dateAdded: string; // ISO string
  originalSearchQuery?: string;
  website?: string | null;
  hasWebsite?: boolean;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  leadName: string;
  url: string;
  status: 'success' | 'failure';
  statusCode: number | null;
  responsePreview: string;
}

export type ScanStatus =
  | 'idle'
  | 'searching'
  | 'paginating'
  | 'details'
  | 'filtering'
  | 'enriching'
  | 'completed'
  | 'failed';

export interface ScanProgress {
  status: ScanStatus;
  progress: number;
  statusText: string;
  resultsFound: number;
  resultsNoWebsite: number;
}

// -------------------------------------------------------------
// Supabase domain types
// -------------------------------------------------------------

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  hunter_api_key: string;
  privyr_webhook_url: string;
  custom_webhook_url: string;
  webhook_auth_header: string;
  webhook_auth_value: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser extends UserProfile {
  last_sign_in_at: string | null;
  created_at: string;
  id: string;
}