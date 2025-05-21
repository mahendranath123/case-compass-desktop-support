
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Lead, Case, CaseStatus } from '@/types';
import { toast } from '@/components/ui/sonner';

// Utility function to generate UUID using the built-in crypto API
function generateUUID() {
  return crypto.randomUUID();
}

// Dummy lead data (would come from API in a real app)
const dummyLeads: Lead[] = [
  {
    sr_no: "1",
    ckt: "LD001",
    cust_name: "TechCorp Inc",
    address: "123 Tech Boulevard, Silicon Valley",
    email_id: "contact@techcorp.com",
    contact_name: "John Smith",
    comm_date: "2023-05-15",
    usable_ip_address: "192.168.1.100",
    backup: "Yes",
    device: "Cisco Router",
    bandwidth: "100 Mbps",
    remarks: "Premium customer, priority support"
  },
  {
    sr_no: "2",
    ckt: "LD002",
    cust_name: "DataStream Solutions",
    address: "456 Server Road, Cloud City",
    email_id: "support@datastream.net",
    contact_name: "Jane Doe",
    comm_date: "2023-06-22",
    usable_ip_address: "192.168.2.100",
    backup: "No",
    device: "Juniper Switch",
    bandwidth: "50 Mbps",
    remarks: "Frequent connectivity issues"
  },
  {
    sr_no: "3",
    ckt: "LD003",
    cust_name: "GlobalNet Services",
    address: "789 Network Avenue, Web District",
    email_id: "info@globalnet.com",
    contact_name: "Robert Johnson",
    comm_date: "2023-07-10",
    usable_ip_address: "192.168.3.100",
    backup: "Yes",
    device: "Fortinet Firewall",
    bandwidth: "200 Mbps",
    remarks: "New customer, setup completed"
  }
];

// Dummy initial cases
const dummyCases: Case[] = [
  {
    id: "1",
    leadCkt: "LD001",
    ipAddress: "192.168.1.100",
    connectivity: "Stable",
    assignedDate: "2023-11-15",
    dueDate: "2023-11-20",
    caseRemarks: "Routine maintenance checkup",
    status: "Pending"
  },
  {
    id: "2",
    leadCkt: "LD002",
    ipAddress: "192.168.2.100",
    connectivity: "Unstable",
    assignedDate: "2023-11-10",
    dueDate: "2023-11-12",
    caseRemarks: "Customer reported packet loss issues",
    status: "Overdue"
  },
  {
    id: "3",
    leadCkt: "LD003",
    ipAddress: "192.168.3.100",
    connectivity: "Stable",
    assignedDate: "2023-11-14",
    dueDate: "2023-11-25",
    caseRemarks: "Bandwidth upgrade scheduled",
    status: "Completed"
  }
];

interface DataContextType {
  leads: Lead[];
  cases: Case[];
  addCase: (newCase: Omit<Case, 'id'>) => void;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  updateCase: (updatedCase: Case) => void;
  getLeadByCkt: (ckt: string) => Lead | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('supportAppLeads');
    return savedLeads ? JSON.parse(savedLeads) : dummyLeads;
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const savedCases = localStorage.getItem('supportAppCases');
    return savedCases ? JSON.parse(savedCases) : dummyCases;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('supportAppLeads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('supportAppCases', JSON.stringify(cases));
  }, [cases]);

  const getLeadByCkt = (ckt: string): Lead | undefined => {
    return leads.find(lead => lead.ckt === ckt);
  };

  const addCase = (newCase: Omit<Case, 'id'>) => {
    const caseWithId: Case = {
      ...newCase,
      id: generateUUID()
    };
    
    setCases([...cases, caseWithId]);
    toast.success('Case created successfully');
  };

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    const updatedCases = cases.map(c => 
      c.id === id ? { ...c, status } : c
    );
    
    setCases(updatedCases);
    toast.success(`Case status updated to ${status}`);
  };

  const updateCase = (updatedCase: Case) => {
    const updatedCases = cases.map(c => 
      c.id === updatedCase.id ? updatedCase : c
    );
    
    setCases(updatedCases);
    toast.success('Case updated successfully');
  };

  return (
    <DataContext.Provider value={{ 
      leads, 
      cases, 
      addCase, 
      updateCaseStatus, 
      updateCase,
      getLeadByCkt
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
