import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    acceptFriendRequest, cancelFriendRequest, getIncomingFriendRequests, getMyFriends,
    rejectFriendRequest, removeFriend, searchSocialProfiles, sendFriendRequest,
} from "../services/social";
import SocialUserCard from "../components/SocialUserCard";
import "./Social.css";

const TABS = { FRIENDS: "friends", REQUESTS: "requests", SEARCH: "search" };

function Social() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS.FRIENDS);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [actionId, setActionId] = useState("");
    const [message, setMessage] = useState("");

    const loadSocialData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true); setMessage("");
        try {
            const [nextFriends, nextRequests] = await Promise.all([getMyFriends(), getIncomingFriendRequests()]);
            setFriends(nextFriends);
            setRequests(nextRequests.map((request) => ({
                ...request, id: request.requester_id,
                friendship_status: "pending", friendship_direction: "incoming",
            })));
        } catch (error) {
            console.error(error); setMessage("No hemos podido cargar tu espacio social.");
        } finally { setLoading(false); }
    }, [user?.id]);

    useEffect(() => { loadSocialData(); }, [loadSocialData]);

    useEffect(() => {
        if (activeTab !== TABS.SEARCH) return;
        const clean = query.trim();
        if (clean.length < 2) { setSearchResults([]); setSearching(false); return; }
        const timeoutId = window.setTimeout(async () => {
            setSearching(true); setMessage("");
            try { setSearchResults(await searchSocialProfiles(clean)); }
            catch (error) { console.error(error); setMessage("No hemos podido buscar usuarios."); }
            finally { setSearching(false); }
        }, 350);
        return () => window.clearTimeout(timeoutId);
    }, [activeTab, query]);

    async function executeAction(key, callback) {
        if (actionId) return;
        setActionId(key); setMessage("");
        try {
            await callback(); await loadSocialData();
            if (activeTab === TABS.SEARCH && query.trim().length >= 2) {
                setSearchResults(await searchSocialProfiles(query.trim()));
            }
        } catch (error) {
            console.error(error); setMessage(error instanceof Error ? error.message : "No hemos podido completar la acción.");
        } finally { setActionId(""); }
    }

    const handlers = {
        send: (p) => executeAction(`send-${p.id}`, () => sendFriendRequest({ requesterId: user.id, receiverId: p.id })),
        accept: (p) => executeAction(`accept-${p.friendship_id}`, () => acceptFriendRequest({ friendshipId: p.friendship_id, userId: user.id })),
        reject: (p) => executeAction(`reject-${p.friendship_id}`, () => rejectFriendRequest({ friendshipId: p.friendship_id, userId: user.id })),
        cancel: (p) => executeAction(`cancel-${p.friendship_id}`, () => cancelFriendRequest({ friendshipId: p.friendship_id, userId: user.id })),
        remove: (p) => executeAction(`remove-${p.friendship_id}`, () => removeFriend({ friendshipId: p.friendship_id })),
    };

    const friendProfiles = useMemo(() => friends.map((friend) => ({
        ...friend, id: friend.friend_id, friendship_status: "accepted", friendship_direction: null,
    })), [friends]);

    const visibleProfiles = activeTab === TABS.FRIENDS ? friendProfiles : activeTab === TABS.REQUESTS ? requests : searchResults;

    if (loading) return <section className="social-page"><p className="social-page__eyebrow">TU COMUNIDAD</p><h1>Cargando Social...</h1></section>;

    return (
        <section className="social-page">
            <header className="social-page__header"><p className="social-page__eyebrow">TU COMUNIDAD</p><h1>Social</h1><p>Encuentra personas, conecta y descubre qué están escuchando.</p></header>
            {message && <p className="social-page__message">{message}</p>}
            <nav className="social-tabs">
                <button type="button" className={activeTab===TABS.FRIENDS?"active":""} onClick={() => setActiveTab(TABS.FRIENDS)}>Amigos <span>{friends.length}</span></button>
                <button type="button" className={activeTab===TABS.REQUESTS?"active":""} onClick={() => setActiveTab(TABS.REQUESTS)}>Solicitudes {requests.length>0&&<span>{requests.length}</span>}</button>
                <button type="button" className={activeTab===TABS.SEARCH?"active":""} onClick={() => setActiveTab(TABS.SEARCH)}>Buscar</button>
            </nav>
            {activeTab===TABS.SEARCH && <label className="social-search"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nombre o usuario" />{query&&<button type="button" onClick={()=>setQuery("")} aria-label="Limpiar búsqueda">×</button>}</label>}
            {searching && <p className="social-page__status">Buscando usuarios...</p>}
            {!searching && visibleProfiles.length===0 ? (
                <article className="social-empty"><span>{activeTab===TABS.FRIENDS?"👥":activeTab===TABS.REQUESTS?"📨":"🔎"}</span><h2>{activeTab===TABS.FRIENDS?"Todavía no tienes amigos en Audite":activeTab===TABS.REQUESTS?"No tienes solicitudes pendientes":query.trim().length<2?"Busca a otros usuarios":"No hemos encontrado coincidencias"}</h2><p>{activeTab===TABS.FRIENDS?"Entra en Buscar y envía tu primera solicitud.":activeTab===TABS.REQUESTS?"Cuando alguien quiera conectar contigo, aparecerá aquí.":"Escribe al menos dos caracteres."}</p></article>
            ) : (
                <div className="social-user-list">{visibleProfiles.map((profile)=><SocialUserCard key={profile.id} profile={profile} actionLoading={Boolean(actionId)} onSendRequest={handlers.send} onAcceptRequest={handlers.accept} onRejectRequest={handlers.reject} onCancelRequest={handlers.cancel} onRemoveFriend={handlers.remove} />)}</div>
            )}
        </section>
    );
}
export default Social;
