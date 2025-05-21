
export interface Lead {
  sr_no: string;
  ckt: string;
  cust_name: string;
  address: string;
  email_id: string;
  contact_name: string;
  comm_date: string;
  usable_ip_address: string;
  backup: string;
  device: string;
  bandwidth: string;
  remarks: string;
}

export type CaseStatus = "Pending" | "Overdue" | "Completed" | "OnHold";
export type Connectivity = "Stable" | "Unstable" | "Unknown";

export interface Case {
  id: string;
  leadCkt: string;
  ipAddress: string;
  connectivity: Connectivity;
  assignedDate: string;
  dueDate: string;
  caseRemarks: string;
  status: CaseStatus;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
