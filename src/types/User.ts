export interface User {
    id: string;
    email: string;
    name: string;
    role: "passenger" | "driver";
    phone: string;
    currency: string;
    notifications: boolean;
    // Add other user properties as needed
}
