
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
