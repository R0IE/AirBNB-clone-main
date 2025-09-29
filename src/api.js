
const API_BASE_URL = '/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }
    setAuthToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    request = async (url, options = {}) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${url}`, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    auth = {
        signInWithPassword: async ({ email, password }) => {
            try {
                const data = await this.request('/auth/signin', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });
                
                this.setAuthToken(data.token);
                
                return { 
                    data: { user: data.user }, 
                    error: null 
                };
            } catch (error) {
                return { 
                    data: null, 
                    error: { message: error.message } 
                };
            }
        },

        signUp: async ({ email, password }) => {
            try {
                const data = await this.request('/auth/signup', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });
                
                return { 
                    data: { user: data.user }, 
                    error: null 
                };
            } catch (error) {
                return { 
                    data: null, 
                    error: { message: error.message } 
                };
            }
        },

        signOut: async () => {
            try {
                await this.request('/auth/signout', { method: 'POST' });
                this.setAuthToken(null);
                return { error: null };
            } catch (error) {
                this.setAuthToken(null);
                return { error: null };
            }
        },

        getUser: () => {
            const token = this.token;
            if (!token) return { data: { user: null } };
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return { 
                    data: { 
                        user: { 
                            id: payload.userId, 
                            email: payload.email 
                        } 
                    } 
                };
            } catch (error) {
                return { data: { user: null } };
            }
        },

        onAuthStateChange: (callback) => {
            const { data } = this.getUser();
            const event = data.user ? 'SIGNED_IN' : 'SIGNED_OUT';
            callback(event, data.user);
            
            return {
                data: {
                    subscription: {
                        unsubscribe: () => {}
                    }
                }
            };
        }
    };

    from = (table) => {
        const self = this;
        return {
            select: (columns = '*') => ({
                eq: (column, value) => ({
                    single: async () => {
                        try {
                            let url;
                            if (table === 'houses' && column === 'id') {
                                url = `/houses/${value}`;
                            } else {
                                throw new Error(`Single select for ${table} with ${column} = ${value} not implemented`);
                            }
                            
                            const data = await self.request(url);
                            return { data, error: null };
                        } catch (error) {
                            return { data: null, error: { message: error.message } };
                        }
                    }
                }),
                order: (column, { ascending = true } = {}) => ({
                    async then(resolve) {
                        try {
                            let url;
                            if (table === 'houses') {
                                url = '/houses';
                            } else {
                                throw new Error(`Select all for ${table} not implemented`);
                            }
                            
                            const data = await self.request(url);
                            
                            if (column) {
                                data.sort((a, b) => {
                                    const aVal = a[column];
                                    const bVal = b[column];
                                    
                                    if (aVal < bVal) return ascending ? -1 : 1;
                                    if (aVal > bVal) return ascending ? 1 : -1;
                                    return 0;
                                });
                            }
                            
                            resolve({ data, error: null });
                        } catch (error) {
                            resolve({ data: null, error: { message: error.message } });
                        }
                    }
                })
            }),

            insert: (data) => ({
                async then(resolve) {
                    try {
                        let url;
                        if (table === 'houses') {
                            url = '/houses';
                        } else {
                            throw new Error(`Insert for ${table} not implemented`);
                        }
                        
                        const result = await self.request(url, {
                            method: 'POST',
                            body: JSON.stringify(data),
                        });
                        
                        resolve({ data: result, error: null });
                    } catch (error) {
                        resolve({ data: null, error: { message: error.message } });
                    }
                }
            }),

            update: (data) => ({
                eq: (column, value) => ({
                    async then(resolve) {
                        try {
                            let url;
                            if (table === 'houses' && column === 'id') {
                                url = `/houses/${value}`;
                            } else {
                                throw new Error(`Update for ${table} with ${column} = ${value} not implemented`);
                            }
                            
                            const result = await self.request(url, {
                                method: 'PUT',
                                body: JSON.stringify(data),
                            });
                            
                            resolve({ data: result, error: null });
                        } catch (error) {
                            resolve({ data: null, error: { message: error.message } });
                        }
                    }
                })
            }),

            delete: () => ({
                eq: (column, value) => ({
                    async then(resolve) {
                        try {
                            let url;
                            if (table === 'houses' && column === 'id') {
                                url = `/houses/${value}`;
                            } else {
                                throw new Error(`Delete for ${table} with ${column} = ${value} not implemented`);
                            }
                            
                            const result = await self.request(url, {
                                method: 'DELETE',
                            });
                            
                            resolve({ data: result, error: null });
                        } catch (error) {
                            resolve({ data: null, error: { message: error.message } });
                        }
                    }
                })
            })
        };
    }

    getUserHouses = async (userId) => {
        try {
            const data = await this.request(`/users/${userId}/houses`);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    getUnavailableDates = async (houseId, startDate = null, endDate = null) => {
        try {
            let url = `/houses/${houseId}/unavailable-dates`;
            const params = new URLSearchParams();
            
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const data = await this.request(url);
            return { data: data.data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    getBulkUnavailableDates = async (houseIds, startDate = null, endDate = null) => {
        try {
            const data = await this.request('/houses/unavailable-dates/bulk', {
                method: 'POST',
                body: JSON.stringify({
                    house_ids: houseIds,
                    start_date: startDate,
                    end_date: endDate
                }),
            });
            return { data: data.data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    addUnavailableDate = async (houseId, date, reason = 'blocked') => {
        try {
            const data = await this.request(`/houses/${houseId}/unavailable-dates`, {
                method: 'POST',
                body: JSON.stringify({ date, reason }),
            });
            return { data: data.data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    addUnavailableDateRange = async (houseId, startDate, endDate, reason = 'blocked') => {
        try {
            const data = await this.request(`/houses/${houseId}/unavailable-dates/range`, {
                method: 'POST',
                body: JSON.stringify({ start_date: startDate, end_date: endDate, reason }),
            });
            return { data: data.data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    removeUnavailableDate = async (houseId, date) => {
        try {
            const data = await this.request(`/houses/${houseId}/unavailable-dates/${date}`, {
                method: 'DELETE'
            });
            return { data: data.data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    uploadImages = async (files) => {
        try {
            const formData = new FormData();
            
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            const response = await fetch(`${API_BASE_URL}/upload-images`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }
}

export const apiService = new ApiService();

export const supabase = apiService;