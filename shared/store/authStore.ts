import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import type { Profile } from '@/shared/types';

interface AuthState {
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  loginWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  checkOnboarding: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  setProfile: (profile) => {
    set({ profile, isAuthenticated: !!profile, isLoading: false });
  },

  login: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      await get().fetchProfile();
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  },

  signup: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          plan: 'free',
        });
        if (profileError) return { error: profileError };
      }
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  },

  loginWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },

  loginWithMagicLink: async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: 'streak://auth/callback' },
      });
      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ profile: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ profile: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ profile, isAuthenticated: true, isLoading: false });
    } catch {
      set({ profile: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      const { profile } = get();
      if (!profile) return { error: new Error('No profile') };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) return { error };
      set({ profile: { ...profile, ...updates } });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  },

  checkOnboarding: () => {
    const { profile } = get();
    return !!(profile?.exam && profile?.selected_subjects?.length);
  },
}));
