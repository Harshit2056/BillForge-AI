import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/v1/products",
    withCredentials:true
})

export const getProducts = async({search="",category="",limit =10,page=1,lowStock=false})=>{
    try {
        const response =await api.get("/",{
            search,category,limit,lowStock,page
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const getProductById = async (id)=>{
    try {
        const response = await api.get(`/${id}`)

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const createProduct = async ({name,price,category,stockQuantity,lowStockThreshold,taxRate,sku,shopId})=>{
    try {
        const response = await api.post("/",{
            name,price,category,stockQuantity,lowStockThreshold,taxRate,sku,shopId
        });

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const updateProduct = async ({name,price,lowStockThreshold,taxRate,id})=>{
    try {
        const response = await api.put(`/${id}`,{
            name,price,lowStockThreshold,taxRate
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const adjustStockQuantity = async({ quantity, reason ,id})=>{
    try {
        const response = await api.patch(`/${id}/stock`,{
            quantity,reason
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const deleteProduct = async(id)=>{
    try {
        const response = await api.delete(`/${id}`)

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error
    }
}