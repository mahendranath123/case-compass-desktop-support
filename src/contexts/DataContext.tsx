import React, { createContext, useState, useContext, useEffect } from 'react';
import { Lead, Case, CaseStatus, Connectivity } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { searchLocalLeads, fetchLocalLeadData, mapJsonToLead } from '@/utils/localLeadData';

// Utility function to generate UUID using the built-in crypto API
function generateUUID() {
  return crypto.randomUUID();
}

interface DataContextType {
  leads: Lead[];
  cases: Case[];
  addCase: (newCase: Omit<Case, 'id'>) => void;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  updateCase: (updatedCase: Case) => void;
  getLeadByCkt: (ckt: string) => Lead | undefined;
  addLead: (newLead: Omit<Lead, 'sr_no'>) => void;
  deleteCase: (id: string) => void;
  searchLeads: (query: string) => Promise<Lead[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Type adapters for converting between local types and Supabase types
const mapSupabaseLeadToLead = (dbLead: any): Lead => {
  return {
    sr_no: dbLead.sr_no,
    ckt: dbLead.ckt,
    cust_name: dbLead.cust_name,
    address: dbLead.address || '',
    email_id: dbLead.email_id || '',
    contact_name: dbLead.contact_name || '',
    comm_date: dbLead.comm_date || '',
    usable_ip_address: dbLead.usable_ip_address || '',
    backup: dbLead.backup || '',
    device: dbLead.device || '',
    bandwidth: dbLead.bandwidth || '',
    remarks: dbLead.remarks || '',
    pop_name: dbLead.pop_name,
    nas_ip_1: dbLead.nas_ip_1,
    switch_ip_1: dbLead.switch_ip_1,
    port_no_1: dbLead.port_no_1,
    vlan_id_1: dbLead.vlan_id_1,
    primary_pop: dbLead.primary_pop,
    pop_name_2: dbLead.pop_name_2,
    nas_ip_2: dbLead.nas_ip_2,
    switch_ip_2: dbLead.switch_ip_2,
    port_no_2: dbLead.port_no_2,
    vlan_id_2: dbLead.vlan_id_2,
    subnet_mask: dbLead.subnet_mask,
    gateway: dbLead.gateway,
    sales_person: dbLead.sales_person,
    testing_fe: dbLead.testing_fe,
    mrtg: dbLead.mrtg
  };
};

const mapSupabaseCaseToCase = (dbCase: any): Case => {
  return {
    id: dbCase.id,
    leadCkt: dbCase.lead_ckt,
    ipAddress: dbCase.ip_address || '',
    connectivity: (dbCase.connectivity as Connectivity) || 'Unknown',
    assignedDate: dbCase.assigned_date,
    dueDate: dbCase.due_date,
    caseRemarks: dbCase.case_remarks || '',
    status: (dbCase.status as CaseStatus) || 'Pending'
  };
};

const mapCaseToSupabaseCase = (caseItem: Omit<Case, 'id'>): any => {
  return {
    lead_ckt: caseItem.leadCkt,
    ip_address: caseItem.ipAddress,
    connectivity: caseItem.connectivity,
    assigned_date: caseItem.assignedDate,
    due_date: caseItem.dueDate,
    case_remarks: caseItem.caseRemarks,
    status: caseItem.status
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [localLeadsLoaded, setLocalLeadsLoaded] = useState(false);

  // Load local JSON lead data on component mount
  useEffect(() => {
    const loadLocalLeads = async () => {
      try {
        const localData = await fetchLocalLeadData();
        if (localData.length > 0) {
          const mappedLeads = localData.map(mapJsonToLead);
          setLeads(prevLeads => {
            // Combine local and Supabase leads, ensuring no duplicates by ckt
            const existingCkts = new Set(prevLeads.map(lead => lead.ckt));
            const uniqueLocalLeads = mappedLeads.filter(lead => !existingCkts.has(lead.ckt));
            return [...prevLeads, ...uniqueLocalLeads];
          });
          setLocalLeadsLoaded(true);
          console.log('Local JSON lead data loaded successfully', localData);
          toast.success(`Loaded ${localData.length} local leads successfully`);
        }
      } catch (error) {
        console.error('Error loading local JSON lead data:', error);
        toast.error('Failed to load local lead data');
      }
    };
    
    loadLocalLeads();
  }, []);

  // Fetch leads from Supabase on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const mappedLeads = data.map(mapSupabaseLeadToLead);
          setLeads(mappedLeads);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads data');
        
        // Fallback to localStorage if Supabase fetch fails
        const savedLeads = localStorage.getItem('supportAppLeads');
        if (savedLeads) {
          setLeads(JSON.parse(savedLeads));
        }
      }
    };

    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const mappedCases = data.map(mapSupabaseCaseToCase);
          setCases(mappedCases);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast.error('Failed to load cases data');
        
        // Fallback to localStorage if Supabase fetch fails
        const savedCases = localStorage.getItem('supportAppCases');
        if (savedCases) {
          setCases(JSON.parse(savedCases));
        }
      }
    };

    fetchLeads();
    fetchCases();
  }, []);

  const getLeadByCkt = (ckt: string): Lead | undefined => {
    return leads.find(lead => lead.ckt === ckt);
  };

  const searchLeads = async (query: string): Promise<Lead[]> => {
    if (!query.trim()) return [];
    
    try {
      // First, search local JSON data
      const localResults = await searchLocalLeads(query);
      
      // If we have results from local data, return them
      if (localResults.length > 0) {
        console.log('Local search results:', localResults);
        return localResults;
      }
      
      // If no local results, try Supabase search
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`ckt.ilike.%${query}%,cust_name.ilike.%${query}%`);
        
      if (error) {
        throw error;
      }
      
      return data ? data.map(mapSupabaseLeadToLead) : [];
    } catch (error) {
      console.error('Error searching leads:', error);
      toast.error('Failed to search leads');
      
      // Fallback to local filtering if both local JSON and Supabase search fail
      return leads.filter(lead => 
        lead.ckt.toLowerCase().includes(query.toLowerCase()) || 
        lead.cust_name.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  const addLead = async (newLead: Omit<Lead, 'sr_no'>) => {
    try {
      const srNo = (leads.length + 1).toString();
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          sr_no: srNo,
          ckt: newLead.ckt,
          cust_name: newLead.cust_name,
          address: newLead.address,
          email_id: newLead.email_id,
          contact_name: newLead.contact_name,
          comm_date: newLead.comm_date,
          usable_ip_address: newLead.usable_ip_address,
          backup: newLead.backup,
          device: newLead.device,
          bandwidth: newLead.bandwidth,
          remarks: newLead.remarks,
          pop_name: newLead.pop_name,
          nas_ip_1: newLead.nas_ip_1,
          switch_ip_1: newLead.switch_ip_1,
          port_no_1: newLead.port_no_1,
          vlan_id_1: newLead.vlan_id_1,
          primary_pop: newLead.primary_pop,
          pop_name_2: newLead.pop_name_2,
          nas_ip_2: newLead.nas_ip_2,
          switch_ip_2: newLead.switch_ip_2,
          port_no_2: newLead.port_no_2,
          vlan_id_2: newLead.vlan_id_2,
          subnet_mask: newLead.subnet_mask,
          gateway: newLead.gateway,
          sales_person: newLead.sales_person,
          testing_fe: newLead.testing_fe,
          mrtg: newLead.mrtg
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const leadWithId = mapSupabaseLeadToLead(data);
        setLeads([...leads, leadWithId]);
        toast.success('Lead added successfully');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
      
      // Fallback to localStorage if Supabase insertion fails
      const leadWithId: Lead = {
        ...newLead,
        sr_no: (leads.length + 1).toString()
      };
      
      setLeads([...leads, leadWithId]);
      localStorage.setItem('supportAppLeads', JSON.stringify([...leads, leadWithId]));
      toast.success('Lead added successfully (locally)');
    }
  };

  const addCase = async (newCase: Omit<Case, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .insert(mapCaseToSupabaseCase(newCase))
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const caseWithId = mapSupabaseCaseToCase(data);
        setCases([...cases, caseWithId]);
        toast.success('Case created successfully');
      }
    } catch (error) {
      console.error('Error adding case:', error);
      toast.error('Failed to add case');
      
      // Fallback to localStorage if Supabase insertion fails
      const caseWithId: Case = {
        ...newCase,
        id: generateUUID()
      };
      
      setCases([...cases, caseWithId]);
      localStorage.setItem('supportAppCases', JSON.stringify([...cases, caseWithId]));
      toast.success('Case created successfully (locally)');
    }
  };

  const updateCaseStatus = async (id: string, status: CaseStatus) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      const updatedCases = cases.map(c => 
        c.id === id ? { ...c, status } : c
      );
      
      setCases(updatedCases);
      toast.success(`Case status updated to ${status}`);
    } catch (error) {
      console.error('Error updating case status:', error);
      toast.error('Failed to update case status');
      
      // Fallback to localStorage if Supabase update fails
      const updatedCases = cases.map(c => 
        c.id === id ? { ...c, status } : c
      );
      
      setCases(updatedCases);
      localStorage.setItem('supportAppCases', JSON.stringify(updatedCases));
      toast.success(`Case status updated to ${status} (locally)`);
    }
  };

  const updateCase = async (updatedCase: Case) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update(mapCaseToSupabaseCase(updatedCase))
        .eq('id', updatedCase.id);
        
      if (error) {
        throw error;
      }
      
      const updatedCases = cases.map(c => 
        c.id === updatedCase.id ? updatedCase : c
      );
      
      setCases(updatedCases);
      toast.success('Case updated successfully');
    } catch (error) {
      console.error('Error updating case:', error);
      toast.error('Failed to update case');
      
      // Fallback to localStorage if Supabase update fails
      const updatedCases = cases.map(c => 
        c.id === updatedCase.id ? updatedCase : c
      );
      
      setCases(updatedCases);
      localStorage.setItem('supportAppCases', JSON.stringify(updatedCases));
      toast.success('Case updated successfully (locally)');
    }
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setCases(cases.filter(c => c.id !== id));
      toast.success('Case deleted successfully');
    } catch (error) {
      console.error('Error deleting case:', error);
      toast.error('Failed to delete case');
      
      // Fallback to localStorage if Supabase deletion fails
      const filteredCases = cases.filter(c => c.id !== id);
      setCases(filteredCases);
      localStorage.setItem('supportAppCases', JSON.stringify(filteredCases));
      toast.success('Case deleted successfully (locally)');
    }
  };

  return (
    <DataContext.Provider value={{ 
      leads, 
      cases, 
      addCase, 
      updateCaseStatus, 
      updateCase,
      getLeadByCkt,
      addLead,
      deleteCase,
      searchLeads
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
