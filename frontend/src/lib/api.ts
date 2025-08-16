const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role: string
  }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me')
  }

  // Auction endpoints
  async getAuctions(params?: {
    status?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = `/auctions${queryParams.toString() ? `?${queryParams}` : ''}`
    return this.request<{ auctions: any[]; total: number }>(endpoint)
  }

  async getAuction(id: string) {
    return this.request<any>(`/auctions/${id}`)
  }

  async createAuction(auctionData: {
    itemName: string
    description: string
    startPrice: number
    bidIncrement: number
    goLiveAt: string
    durationMins: number
  }) {
    return this.request<any>('/auctions', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    })
  }

  async getMyAuctions() {
    return this.request<any[]>('/auctions/mine')
  }

  // Bid endpoints
  async placeBid(auctionId: string, amount: number) {
    return this.request<any>(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async getAuctionBids(auctionId: string) {
    return this.request<any[]>(`/auctions/${auctionId}/bids`)
  }

  // Seller decision endpoints
  async acceptBid(auctionId: string) {
    return this.request<any>(`/auctions/${auctionId}/accept`, {
      method: 'POST',
    })
  }

  async rejectBid(auctionId: string) {
    return this.request<any>(`/auctions/${auctionId}/reject`, {
      method: 'POST',
    })
  }

  async makeCounterOffer(auctionId: string, amount: number) {
    return this.request<any>(`/auctions/${auctionId}/counter-offer`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async makeAuctionDecision(id: string, decision: 'accept' | 'reject' | 'counter', counterAmount?: number) {
    return this.request<any>(`/auctions/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, counterAmount }),
    })
  }

  async endAuction(id: string) {
    return this.request<any>(`/auctions/${id}/end`, {
      method: 'POST',
    })
  }

  async sendInvoice(id: string) {
    return this.request<any>(`/auctions/${id}/send-invoice`, {
      method: 'POST',
    })
  }

  // Counter offer responses
  async acceptCounterOffer(counterOfferId: string) {
    return this.request<any>(`/counter-offers/${counterOfferId}/accept`, {
      method: 'POST',
    })
  }

  async rejectCounterOffer(counterOfferId: string) {
    return this.request<any>(`/counter-offers/${counterOfferId}/reject`, {
      method: 'POST',
    })
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams}` : ''}`
    return this.request<{ notifications: any[]; total: number }>(endpoint)
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', {
      method: 'PATCH',
    })
  }

  async getUnreadNotificationCount() {
    return this.request<{ count: number }>('/notifications/unread/count')
  }

  // Counter Offers
  async getCounterOffers() {
    return this.request<any[]>('/counter-offers')
  }

  async getPendingCounterOffers() {
    return this.request<{ asBuyer: any[], asSeller: any[], total: number }>('/counter-offers/pending')
  }

  async getCounterOfferById(id: string) {
    return this.request<any>(`/counter-offers/${id}`)
  }

  async respondToCounterOffer(id: string, response: 'accept' | 'reject') {
    return this.request<any>(`/counter-offers/${id}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
