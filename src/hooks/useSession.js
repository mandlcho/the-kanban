import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {!loading && children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
