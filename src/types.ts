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
  source: 'Google Maps' | 'VConnect' | 'BusinessList' | 'Manual';
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
