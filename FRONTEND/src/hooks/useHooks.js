import { useContext } from "react";
import { AuthContext } from "../context/authContext.js";

export const useAuth = ()=>{

    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading, login, logout} = context
                  
    
    return {user, setUser, loading, setLoading, login, logout,isAuthenticated: !!user , shop}
}

 