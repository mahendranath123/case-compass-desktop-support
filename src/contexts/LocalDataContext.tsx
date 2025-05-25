
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Lead, Case, CaseStatus, Connectivity } from '@/types';
import { toast } from '@/components/ui/sonner';

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
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data for demo
const mockLeads: Lead[] = [
  {
    sr_no: '1',
    ckt: 'CKT001',
    cust_name: 'ABC Corp',
    address: '123 Business St, City',
    email_id: 'contact@abccorp.com',
    contact_name: 'John Doe',
    comm_date: '2024-01-15',
    usable_ip_address: '192.168.1.100',
    backup: 'Yes',
    device: 'Router-X1',
    bandwidth: '100 Mbps',
    remarks: 'Primary connection',
    pop_name: 'POP-Central',
    nas_ip_1: '10.0.1.1',
    switch_ip_1: '10.0.1.2',
    port_no_1: 'Gi0/1',
    vlan_id_1: '100',
    primary_pop: 'Yes',
    pop_name_2: 'POP-Backup',
    nas_ip_2: '10.0.2.1',
    switch_ip_2: '10.0.2.2',
    port_no_2: 'Gi0/2',
    vlan_id_2: '200',
    subnet_mask: '255.255.255.0',
    gateway: '192.168.1.1',
    sales_person: 'Alice Smith',
    testing_fe: 'Bob Johnson',
    mrtg: 'Active'
  },
  {
    sr_no: '2',
    ckt: 'CKT002',
    cust_name: 'XYZ Ltd',
    address: '456 Tech Ave, Metro',
    email_id: 'admin@xyzltd.com',
    contact_name: 'Jane Smith',
    comm_date: '2024-01-20',
    usable_ip_address: '192.168.2.100',
    backup: 'No',
    device: 'Switch-Y2',
    bandwidth: '50 Mbps',
    remarks: 'Secondary connection',
    pop_name: 'POP-East',
    nas_ip_1: '10.1.1.1',
    switch_ip_1: '10.1.1.2',
    port_no_1: 'Gi0/3',
    vlan_id_1: '150',
    primary_pop: 'No',
    pop_name_2: '',
    nas_ip_2: '',
    switch_ip_2: '',
    port_no_2: '',
    vlan_id_2: '',
    subnet_mask: '255.255.255.0',
    gateway: '192.168.2.1',
    sales_person: 'Charlie Brown',
    testing_fe: 'Diana Prince',
    mrtg: 'Inactive'
  }
];

const mockCases: Case[] = [
  {
    id: '1',
    leadCkt: 'CKT001',
    ipAddress: '192.168.1.100',
    connectivity: 'Stable',
    assignedDate: '2024-01-25',
    dueDate: '2024-02-01',
    caseRemarks: 'Routine maintenance check',
    status: 'Pending'
  },
  {
    id: '2',
    leadCkt: 'CKT002',
    ipAddress: '192.168.2.100',
    connectivity: 'Unstable',
    assignedDate: '2024-01-26',
    dueDate: '2024-01-30',
    caseRemarks: 'Connection issues reported',
    status: 'Overdue'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load data from localStorage if available
    const savedLeads = localStorage.getItem('supportAppLeads');
    const savedCases = localStorage.getItem('supportAppCases');
    
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (error) {
        console.error('Error parsing saved leads:', error);
      }
    }
    
    if (savedCases) {
      try {
        setCases(JSON.parse(savedCases));
      } catch (error) {
        console.error('Error parsing saved cases:', error);
      }
    }
  }, []);

  const saveToStorage = (leads: Lead[], cases: Case[]) => {
    localStorage.setItem('supportAppLeads', JSON.stringify(leads));
    localStorage.setItem('supportAppCases', JSON.stringify(cases));
  };

  const getLeadByCkt = (ckt: string): Lead | undefined => {
    return leads.find(lead => lead.ckt === ckt);
  };

  const searchLeads = async (query: string): Promise<Lead[]> => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = leads.filter(lead => {
      const cktMatches = lead.ckt.toLowerCase().includes(searchTerm);
      const nameMatches = lead.cust_name.toLowerCase().includes(searchTerm);
      const ipMatches = lead.usable_ip_address.toLowerCase().includes(searchTerm);
      
      return cktMatches || nameMatches || ipMatches;
    });
    
    return results.slice(0, 50);
  };

  const addLead = (newLead: Omit<Lead, 'sr_no'>) => {
    const leadWithId: Lead = {
      ...newLead,
      sr_no: (leads.length + 1).toString()
    };
    
    const updatedLeads = [...leads, leadWithId];
    setLeads(updatedLeads);
    saveToStorage(updatedLeads, cases);
    toast.success('Lead added successfully');
  };

  const addCase = (newCase: Omit<Case, 'id'>) => {
    const caseWithId: Case = {
      ...newCase,
      id: generateUUID()
    };
    
    const updatedCases = [...cases, caseWithId];
    setCases(updatedCases);
    saveToStorage(leads, updatedCases);
    toast.success('Case created successfully');
  };

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    const updatedCases = cases.map(c => 
      c.id === id ? { ...c, status } : c
    );
    
    setCases(updatedCases);
    saveToStorage(leads, updatedCases);
    toast.success(`Case status updated to ${status}`);
  };

  const updateCase = (updatedCase: Case) => {
    const updatedCases = cases.map(c => 
      c.id === updatedCase.id ? updatedCase : c
    );
    
    setCases(updatedCases);
    saveToStorage(leads, updatedCases);
    toast.success('Case updated successfully');
  };

  const deleteCase = (id: string) => {
    const filteredCases = cases.filter(c => c.id !== id);
    setCases(filteredCases);
    saveToStorage(leads, filteredCases);
    toast.success('Case deleted successfully');
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
      searchLeads,
      isLoading
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
