
export interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  status: 'active' | 'inactive';
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}
