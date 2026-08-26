import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/v1/ai",
    withCredentials:true
})

export const scanReceiptOCR = async()=>{
    
}