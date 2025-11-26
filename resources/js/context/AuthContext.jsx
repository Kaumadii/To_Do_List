import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        fetch("/api/me")
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) setUser(data);
            })
            .finally(() => setChecking(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, checking }}>
            {children}
        </AuthContext.Provider>
    );
}
