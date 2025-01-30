export interface Search {
  id: string;
  keywords: string;
  created_at: string;
  saved: boolean;
  user_id?: string;
  filters?: Record<string, any>;
}
