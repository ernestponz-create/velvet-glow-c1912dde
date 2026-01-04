import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ProviderProfile {
  id: string;
  user_id: string;
  clinic_name: string;
  practice_type: string;
  primary_specialty: string;
  secondary_specialties: string[];
  address: string;
  city: string;
  phone: string;
  website: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  years_in_practice: string | null;
  credentials: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  approved_at: string | null;
}

interface ProviderAuthContextType {
  user: User | null;
  session: Session | null;
  providerProfile: ProviderProfile | null;
  userRole: 'user' | 'provider' | 'admin' | null;
  isLoading: boolean;
  isProvider: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
  refreshProviderProfile: () => Promise<void>;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export const ProviderAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'provider' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
    if (!error && data) {
      setUserRole(data as 'user' | 'provider' | 'admin');
      return data;
    }
    return null;
  };

  const fetchProviderProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("provider_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setProviderProfile(data as ProviderProfile);
    }
    return data;
  };

  const refreshProviderProfile = async () => {
    if (user) {
      await fetchProviderProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProviderProfile(null);
    setUserRole(null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchProviderProfile(session.user.id);
          }, 0);
        } else {
          setProviderProfile(null);
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchUserRole(session.user.id),
          fetchProviderProfile(session.user.id)
        ]).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isProvider = userRole === 'provider';
  const isApproved = providerProfile?.status === 'approved';

  return (
    <ProviderAuthContext.Provider
      value={{
        user,
        session,
        providerProfile,
        userRole,
        isLoading,
        isProvider,
        isApproved,
        signOut,
        refreshProviderProfile,
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  );
};

export const useProviderAuth = () => {
  const context = useContext(ProviderAuthContext);
  if (context === undefined) {
    throw new Error("useProviderAuth must be used within a ProviderAuthProvider");
  }
  return context;
};
