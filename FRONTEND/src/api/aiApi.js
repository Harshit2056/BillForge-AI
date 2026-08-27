import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/v1/ai",
    withCredentials:true
})

export const scanReceiptOCR = async(file)=>{
    try {

        const formData = new formData();
        formData.append("receipt",file);

        const response = await api.post("/scan-receipt",formData);

        return response.data
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export const querySalesNaturalLanguage = async(prompt)=>{
    try {
        const response = await api.post("/query",{prompt})

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const forecastStockDemand = async () =>{
    try {
        const response = await api.post("/forecast")

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export const getSmartPricingRecommendations = async()=>{
    try {
        const response = await api.post("/recommendations");

        return response.data;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}