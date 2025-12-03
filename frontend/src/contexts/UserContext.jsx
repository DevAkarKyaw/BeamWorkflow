import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authStatus, setAuthStatus] = useState('pending'); // 'pending', 'authenticated', 'unauthenticated'
    const storageKey = 'beamworkflow_user';

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
                setAuthStatus('authenticated');
            } catch {
                setUser(null);
                setAuthStatus('unauthenticated');
            }
        } else {
            setAuthStatus('unauthenticated');
        }
    }, []);

    const createUser = useCallback((rememberMe, userData) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        const userString = JSON.stringify(userData);
        storage.setItem(storageKey, userString);
        setUser(userData);
        setAuthStatus('authenticated');
    }, []);

    const updateUser = useCallback((update, value) => {
        const storage = localStorage.getItem(storageKey) ? localStorage : sessionStorage;
        const current = JSON.parse(storage.getItem(storageKey));

        const newUserData = { ...current, [update]: value };

        storage.setItem(storageKey, JSON.stringify(newUserData));
        setUser(newUserData);
    }, []);

    const clearUser = useCallback(() => {
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
        setUser(null);
        setAuthStatus('unauthenticated');
    }, []);

    const contextValue = useMemo(() => ({
        user,
        authStatus,
        storageKey,
        createUser,
        updateUser,
        clearUser
    }), [user, authStatus, storageKey, createUser, updateUser, clearUser]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserContextProvider');
    }
    return context;
};
