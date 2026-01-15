
export enum JobStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ContentType {
  JOB = 'JOB',
  RESULT = 'RESULT',
  ADMIT_CARD = 'ADMIT_CARD',
  ADMISSION = 'ADMISSION',
  NEWS = 'NEWS'
}

export interface Job {
  id: string;
  job_title: string;
  department: string;
  post_name: string;
  qualification: string;
  age_limit: string;
  total_posts: number;
  start_date: string;
  last_date: string;
  apply_link: string;
  notification_pdf_url: string;
  district?: string;
  state: string;
  category: string;
  status: JobStatus;
  created_at: string;
  is_center_level: boolean;
  source_name: string;
  eligibility_details: string;
  how_to_apply_steps: string[];
  content_type: ContentType;
}

export interface User {
  id: string;
  name: string;
  whatsapp_number: string;
  qualification: string;
  age: number;
  district: string;
  category: string;
}

export interface Source {
  id: string;
  department_name: string;
  website_url: string;
  check_interval: number;
  last_checked?: string;
}

export interface ScrapingLog {
  id: string;
  source_id: string;
  status: 'SUCCESS' | 'FAILED';
  detected_links: number;
  message: string;
  timestamp: string;
}
