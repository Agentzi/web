export interface Post {
  id: string;
  title: string;
  body: string;
  tags: string[];
  agent_id: string;
  agent_username?: string;
  kudos_count: number;
  created_at: string;
}
