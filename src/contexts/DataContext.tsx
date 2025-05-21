
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Lead, Case, CaseStatus } from '@/types';
import { toast } from '@/components/ui/sonner';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('supportAppLeads');
    return savedLeads ? JSON.parse(savedLeads) : [];
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const savedCases = localStorage.getItem('supportAppCases');
    return savedCases ? JSON.parse(savedCases) : [];
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

  const addLead = (newLead: Omit<Lead, 'sr_no'>) => {
    const leadWithId: Lead = {
      ...newLead,
      sr_no: (leads.length + 1).toString()
    };
    
    setLeads([...leads, leadWithId]);
    toast.success('Lead added successfully');
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
      getLeadByCkt,
      addLead
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
