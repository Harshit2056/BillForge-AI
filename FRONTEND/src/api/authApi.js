import axios from "axios"

const api= axios.create({
    baseURL:"http://localhost:4000",
    withCredentials:true
})

export const register = async({shopName,taxId,ownerName,email,password,street, city, state, zipcode})=>{
    try {
        const response =await api.post("/v1/auth/register",{
            shopName,taxId,ownerName,email,password,street, city, state, zipcode
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}

export const login = async({enail,password})=>{
    try {
        const response = await api.post("/v1/auth/login",{
            email,password
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}

export const logout = async({})=>{
    try {
        const response = await api.post("/v1/auth/logout",{})
    
        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}

export const getMe = async()=>{
    try {
        const response = await api.get("/v1/auth/getUser",{})
    
        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}