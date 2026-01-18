export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string;
          title: string;
          author: string;
          description: string | null;
          cover_url: string | null;
          voice_id: string | null;
          voice_name: string | null;
          creator_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          description?: string | null;
          cover_url?: string | null;
          voice_id?: string | null;
          voice_name?: string | null;
          creator_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          description?: string | null;
          cover_url?: string | null;
          voice_id?: string | null;
          voice_name?: string | null;
          creator_id?: string | null;
          created_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          story_id: string;
          title: string;
          order_index: number;
          audio_url: string;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          title: string;
          order_index: number;
          audio_url: string;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          title?: string;
          order_index?: number;
          audio_url?: string;
          duration_ms?: number | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          created_at?: string;
        };
      };
      playback_progress: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          position_ms: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          position_ms?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          chapter_id?: string;
          position_ms?: number;
          updated_at?: string;
        };
      };
      waitlist_emails: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
