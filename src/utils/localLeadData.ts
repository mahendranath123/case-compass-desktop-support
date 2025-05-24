
// Utility functions to handle local JSON lead data
import { Lead } from "@/types";

// Define the structure of the JSON data based on the provided schema
export interface LocalLeadData {
  sr_no: string;
  ckt: string;
  cust_name: string;
  address: string;
  email_id: string;
  empty: string;
  contact_name: string;
  comm_date: string;
  pop_name: string;
  nas_ip_1: string;
  switch_ip_1: string;
  port_no_1: string;
  vlan_id_1: string;
  primary_pop: string;
  pop_name_2: string;
  nas_ip_2: string;
  switch_ip_2: string;
  port_no_2: string;
  vlan_id_2: string;
  backup: string;
  usable_ip_address: string;
  subnet_mask: string;
  gateway: string;
  bandwidth: string;
  sales_person: string;
  testing_fe: string;
  device: string;
  remarks: string;
  mrtg: string;
}

// Create a cache for the JSON data to avoid repeated fetches
let cachedLeadData: LocalLeadData[] | null = null;
let fetchAttempted = false;

/**
 * Map the local JSON data format to the Lead type used in the application
 */
export const mapJsonToLead = (jsonLead: LocalLeadData): Lead => {
  return {
    sr_no: jsonLead.sr_no || '',
    ckt: jsonLead.ckt || '',
    cust_name: jsonLead.cust_name || '',
    address: jsonLead.address || '',
    email_id: jsonLead.email_id || '',
    contact_name: jsonLead.contact_name || '',
    comm_date: jsonLead.comm_date || '',
    usable_ip_address: jsonLead.usable_ip_address || '',
    backup: jsonLead.backup || '',
    device: jsonLead.device || '',
    bandwidth: jsonLead.bandwidth || '',
    remarks: jsonLead.remarks || '',
    pop_name: jsonLead.pop_name || '',
    nas_ip_1: jsonLead.nas_ip_1 || '',
    switch_ip_1: jsonLead.switch_ip_1 || '',
    port_no_1: jsonLead.port_no_1 || '',
    vlan_id_1: jsonLead.vlan_id_1 || '',
    primary_pop: jsonLead.primary_pop || '',
    pop_name_2: jsonLead.pop_name_2 || '',
    nas_ip_2: jsonLead.nas_ip_2 || '',
    switch_ip_2: jsonLead.switch_ip_2 || '',
    port_no_2: jsonLead.port_no_2 || '',
    vlan_id_2: jsonLead.vlan_id_2 || '',
    subnet_mask: jsonLead.subnet_mask || '',
    gateway: jsonLead.gateway || '',
    sales_person: jsonLead.sales_person || '',
    testing_fe: jsonLead.testing_fe || '',
    mrtg: jsonLead.mrtg || ''
  };
};

/**
 * Fetch the local JSON lead data with improved error handling
 */
export const fetchLocalLeadData = async (): Promise<LocalLeadData[]> => {
  // Return cached data if available
  if (cachedLeadData) {
    return cachedLeadData;
  }

  // Don't retry if we already attempted and failed
  if (fetchAttempted) {
    return [];
  }

  fetchAttempted = true;

  try {
    // Try multiple possible file locations
    const possiblePaths = [
      '/lead_demo_yourgpt.json',
      '/public/lead_demo_yourgpt.json',
      '/data/lead_demo_yourgpt.json'
    ];

    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          cachedLeadData = Array.isArray(data) ? data : [];
          console.log(`Local lead data loaded successfully from ${path}`, cachedLeadData);
          return cachedLeadData;
        }
      } catch (pathError) {
        // Continue to next path
        continue;
      }
    }

    // If no file found, return empty array without error
    console.log('No local lead data file found, using database only');
    cachedLeadData = [];
    return cachedLeadData;
  } catch (error) {
    console.log('Local lead data not available:', error);
    cachedLeadData = [];
    return cachedLeadData;
  }
};

/**
 * Fast search implementation for local leads
 */
export const searchLocalLeads = async (query: string): Promise<Lead[]> => {
  if (!query.trim()) {
    return [];
  }
  
  const localData = await fetchLocalLeadData();
  
  if (localData.length === 0) {
    return [];
  }
  
  const searchTerm = query.toLowerCase();
  
  // Optimized search with early termination
  const results: LocalLeadData[] = [];
  const maxResults = 50; // Limit results for performance
  
  for (const lead of localData) {
    if (results.length >= maxResults) break;
    
    // Clean and normalize the CKT field for comparison
    const leadCkt = (lead.ckt || '').toLowerCase();
    const cktWithoutPrefix = leadCkt.replace(/^ckt/i, '');
    
    // Quick checks for exact matches first (fastest)
    if (leadCkt === searchTerm || cktWithoutPrefix === searchTerm) {
      results.unshift(lead); // Add exact matches to front
      continue;
    }
    
    // Then check for partial matches
    const cktMatches = 
      leadCkt.includes(searchTerm) || 
      cktWithoutPrefix.includes(searchTerm);
    
    const nameMatches = (lead.cust_name || '').toLowerCase().includes(searchTerm);
    const addressMatches = (lead.address || '').toLowerCase().includes(searchTerm);
    const contactMatches = (lead.contact_name || '').toLowerCase().includes(searchTerm);
    const emailMatches = (lead.email_id || '').toLowerCase().includes(searchTerm);
    const ipAddressMatches = (lead.usable_ip_address || '').includes(searchTerm);
    
    if (cktMatches || nameMatches || addressMatches || contactMatches || emailMatches || ipAddressMatches) {
      results.push(lead);
    }
  }
  
  console.log(`Fast search completed. Found ${results.length} matches for "${searchTerm}"`);
  
  // Map to the application Lead type
  return results.map(mapJsonToLead);
};
