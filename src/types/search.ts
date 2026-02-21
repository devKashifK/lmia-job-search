export interface Search {
  id: string;
  keyword: string;
  created_at: string;
  saved: boolean;
  filters?: Record<string, any>;
}
