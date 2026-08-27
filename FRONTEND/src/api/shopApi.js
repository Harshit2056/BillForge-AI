import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/v1/shops",
    withCredentials:true
})

export const getShopProfile = async()=>{
    try {
        const response = await api.get("/profile")

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export const updateShopProfile = async({shopName,taxId,street, city, state, zipcode})=>{
    try {
        const response = await api.put("/profile",{
            shopName,taxId,street, city, state, zipcode
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export const addStaffMember = async({name,email,password,role})=>{
    try {
        const response = await api.post("/staff",{
            name,email,password,role
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export const getAllStaffMembers = async()=>{
    try {
        const response = await api.get("/staff")

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export const removeStaffMember = async(staffId)=>{
    try {
        const response = await api.delete(`/staff/${staffId}`)

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}