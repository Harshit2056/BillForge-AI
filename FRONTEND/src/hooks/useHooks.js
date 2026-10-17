import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading, login, logout, shop } = context || {};
    
    return { user, setUser, loading, setLoading, login, logout, isAuthenticated: !!user, shop };
};

 