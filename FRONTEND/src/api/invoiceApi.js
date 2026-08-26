import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/v1/invoice",
    withCredentials:true
})

export const createInvoice = async({ customer, items, paymentMode = "Cash", notes })=>{
    try {
        const response = await api.post("/",{
            customer, items, paymentMode, notes
            });

            return response.data
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const getInvoices = async({ page = 1, limit = 20 })=>{
    try {
        const response = await api.get("/",{ 
            page, limit
        })
        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const getInvoiceById = async(id)=>{
    try {
        const response = await api.get(`/${id}`)

        return response.data
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const getSalesAnalytics = async({ period = "30days", startDate, endDate })=>{
    try {
        const response = await api.get("/reports/analytics",{
            period, startDate, endDate
        })

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const downloadInvoicePDF = async(id)=>{
    try {
        const response = await api.get(`/${id}/pdf`)

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}