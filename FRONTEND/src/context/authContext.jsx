import { Children, createContext, useState, useEffect } from "react";
import { getCurrentUser, userLogin } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({children})=>{

    const [user,setUser]= useState(null)
    const [loading,setLoading]= useState(true)

    useEffect (()=>{
        const getAndSettUser= async() =>{

        try {
            const data = await getCurrentUser();
            if(data && data.data){
                setUser(data.data)
            }
            else{
                setUser(null)
            }
        } catch (error) {
            console.log(error.message)
            setUser(null)
        }
        finally{
            setLoading(false)
        }
        }

    getAndSettUser();
    },[])


    const login = async({email,password}) =>{
        setLoading(true)
        try {
            const data=await userLogin({email,password})
            setUser(data.data.loggedInUser)
            return true;
        } catch (error) {
            console.log(error.message)
            setUser(null)
        } finally{
            setLoading(false)
        }
    }

    



return (
    <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
        {children}
    </AuthContext.Provider>
)
}

