
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const endpoints = {
    // Auth
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    users: `${API_BASE_URL}/auth/users`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password-confirm`,
    resetPasswordSelf: `${API_BASE_URL}/auth/reset-password`,
    adminResetPassword: `${API_BASE_URL}/auth/admin/reset-password`,

    // Inventory
    inventory: `${API_BASE_URL}/inventory`,
    processOrder: `${API_BASE_URL}/inventory/order`,

    // Recipes
    recipes: `${API_BASE_URL}/recipes`,

    // Analytics
    analytics: `${API_BASE_URL}/analytics`
};
