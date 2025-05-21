
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
  // Added SQL fields
  pop_name?: string;
  nas_ip_1?: string;
  switch_ip_1?: string;
  port_no_1?: string;
  vlan_id_1?: string;
  primary_pop?: string;
  pop_name_2?: string;
  nas_ip_2?: string;
  switch_ip_2?: string;
  port_no_2?: string;
  vlan_id_2?: string;
  subnet_mask?: string;
  gateway?: string;
  sales_person?: string;
  testing_fe?: string;
  mrtg?: string;
}

export type CaseStatus = "Pending" | "Overdue" | "Completed" | "OnHold";
export type Connectivity = "Stable" | "Unstable" | "Unknown";

export interface Case {
  id: string;
  leadCkt: string;
  ipAddress: string;
  connectivity: Connectivity;
  assignedDate: string; // Will now store full datetime ISO string
  dueDate: string; // Will now store full datetime ISO string
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
