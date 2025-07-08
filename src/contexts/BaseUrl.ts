// 使用環境變數，如果未設置則使用生產環境 URL 作為預設值
//const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://rent-car-one-rust.vercel.app";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://vercel-express-app-production.up.railway.app";

export default baseUrl;
