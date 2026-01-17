import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (!session) {
        Alert.alert('Success', 'Please check your email for verification!');
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return { signIn, signUp, signOut, loading };
}
