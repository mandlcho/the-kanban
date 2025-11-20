import { useState, useEffect, createContext, useContext } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      setError(
        "Supabase environment variables are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before deploying."
      );
      return undefined;
    }

    let subscription;

    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(session);
      } catch (getSessionError) {
        console.error("Error fetching Supabase session:", getSessionError);
        setError(getSessionError.message || "Unable to load the current session.");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    subscription = data?.subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    loading,
    error,
    isSupabaseConfigured
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
