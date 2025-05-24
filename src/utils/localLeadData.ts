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

// Cache for local data - start as empty to avoid loading delays
let cachedLeadData: LocalLeadData[] = [];
let dataLoaded = false;

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
 * Optimized data loader - returns immediately without blocking
 */
export const fetchLocalLeadData = async (): Promise<LocalLeadData[]> => {
  // Return cached data immediately if already loaded
  if (dataLoaded) {
    return cachedLeadData;
  }

  // Mark as loaded to prevent multiple attempts
  dataLoaded = true;
  
  // Return empty array immediately - no file loading to avoid delays
  console.log('Using database-only mode for faster loading');
  return cachedLeadData;
};

/**
 * Fast search implementation for local leads
 */
export const searchLocalLeads = async (query: string): Promise<Lead[]> => {
  if (!query.trim()) {
    return [];
  }
  
  const localData = await fetchLocalLeadData();
  
  // Since we're not loading local files, this will be empty
  // But we keep the function for compatibility
  return [];
};
