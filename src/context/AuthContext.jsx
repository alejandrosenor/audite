import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadProfile(userId) {
        if (!userId) {
            setProfile(null);
            return null;
        }

        const { error: streakError } =
            await supabase.rpc("refresh_my_streak");

        if (streakError) {
            console.error(
                "Error actualizando la racha:",
                streakError.message,
            );
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error cargando el perfil:", error.message);
            setProfile(null);
            return null;
        }

        setProfile(data);
        return data;
    }

    useEffect(() => {
        let mounted = true;

        async function initializeAuth() {
            const {
                data: { session: initialSession },
                error,
            } = await supabase.auth.getSession();

            if (!mounted) return;

            if (error) {
                console.error("Error recuperando la sesión:", error.message);
            }

            setSession(initialSession);
            setUser(initialSession?.user ?? null);

            if (initialSession?.user) {
                await loadProfile(initialSession.user.id);
            }

            if (mounted) {
                setLoading(false);
            }
        }

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
                setTimeout(() => {
                    loadProfile(newSession.user.id);
                }, 0);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    async function signUp({ email, password, username, avatar }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    avatar,
                },
            },
        });

        return { data, error };
    }

    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { data, error };
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error cerrando sesión:", error.message);
        }

        return { error };
    }

    async function refreshProfile() {
        if (!user) return null;
        return loadProfile(user.id);
    }

    const value = useMemo(
        () => ({
            session,
            user,
            profile,
            loading,
            signUp,
            signIn,
            signOut,
            refreshProfile,
        }),
        [session, user, profile, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe utilizarse dentro de AuthProvider");
    }

    return context;
}