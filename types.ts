
export interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
  description?: string;
  location?: string;
  date?: string;
  highlights?: string[];
  additionalImages?: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// ERPnext API Types
export interface ERPnextProject {
  name: string;
  project_name?: string;
  expected_end_date?: string;
  status?: string;
  notes?: string;
  image?: string;
  [key: string]: any;
}

export interface ERPnextLead {
  name?: string;
  company_name: string;
  email_id: string;
  mobile_no?: string;
  custom_message?: string;
  source?: string;
  lead_owner?: string;
  [key: string]: any;
}

export interface ERPnextAPIResponse<T> {
  data: T[];
  message?: string;
}

export interface ERPnextCreateResponse {
  data: {
    name: string;
    [key: string]: any;
  };
  message?: string;
}
