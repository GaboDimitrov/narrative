import { Database } from '@taleify/supabase';

type Story = Database['public']['Tables']['stories']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];

export type RootStackParamList = {
  MainTabs: undefined;
  StoryDetail: { story: Story };
  Player: {
    chapter: Chapter;
    story: Story;
    startPosition: number;
  };
};

export type AuthStackParamList = {
  Auth: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
