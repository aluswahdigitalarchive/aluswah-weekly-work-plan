import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isDivision: boolean;
  userDivisionId: string | null;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile from Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as UserRole,
      divisionId: data.division_id,
      avatarUrl: data.avatar_url,
    };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting auth session:', error.message);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            const userProf = await fetchProfile(initialSession.user.id);
            if (isMounted) setProfile(userProf);
          } else {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProf = await fetchProfile(currentSession.user.id);
          setProfile(userProf);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<UserProfile | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.'
            : error.message
        );
      }

      if (!data.user) {
        throw new Error('Gagal memverifikasi pengguna.');
      }

      setUser(data.user);
      setSession(data.session);

      const userProf = await fetchProfile(data.user.id);
      setProfile(userProf);
      return userProf;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const userProf = await fetchProfile(user.id);
    setProfile(userProf);
    return userProf;
  }, [user]);

  const isSuperAdmin = useMemo(() => profile?.role === 'SUPERADMIN', [profile]);
  const isDivision = useMemo(() => profile?.role === 'DIVISION', [profile]);
  const userDivisionId = useMemo(() => profile?.divisionId ?? null, [profile]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isSuperAdmin,
      isDivision,
      userDivisionId,
      login,
      logout,
      refetchProfile,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      isSuperAdmin,
      isDivision,
      userDivisionId,
      login,
      logout,
      refetchProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
