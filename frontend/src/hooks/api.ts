import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { apiClient } from '../lib/api'
import { wsService } from '../lib/websocket'
import toast from 'react-hot-toast'

// Query Keys
export const queryKeys = {
  auctions: {
    all: ['auctions'] as const,
    lists: () => [...queryKeys.auctions.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.auctions.lists(), filters] as const,
    details: () => [...queryKeys.auctions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.auctions.details(), id] as const,
    mine: () => [...queryKeys.auctions.all, 'mine'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.notifications.lists(), filters] as const,
  },
  bids: {
    all: ['bids'] as const,
    byAuction: (auctionId: string) => [...queryKeys.bids.all, 'auction', auctionId] as const,
  },
}

// Auction Hooks
export function useAuctions(filters?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: queryKeys.auctions.list(filters),
    queryFn: () => apiClient.getAuctions(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useAuction(id: string) {
  return useQuery({
    queryKey: queryKeys.auctions.detail(id),
    queryFn: () => apiClient.getAuction(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds for real-time data
  })
}

export function useMyAuctions() {
  return useQuery({
    queryKey: queryKeys.auctions.mine(),
    queryFn: () => apiClient.getMyAuctions(),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useCreateAuction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (auctionData: Parameters<typeof apiClient.createAuction>[0]) =>
      apiClient.createAuction(auctionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.lists() })
      toast.success('Auction created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create auction')
    },
  })
}

// Bid Hooks
export function useAuctionBids(auctionId: string) {
  return useQuery({
    queryKey: queryKeys.bids.byAuction(auctionId),
    queryFn: () => apiClient.getAuctionBids(auctionId),
    enabled: !!auctionId,
    staleTime: 5 * 1000, // 5 seconds for real-time bidding
  })
}

export function usePlaceBid() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()
  
  return useMutation({
    mutationFn: ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      // Use WebSocket for real-time bidding if connected, otherwise fall back to API
      if (wsService.connected && currentUser?.user?.id) {
        return new Promise((resolve, reject) => {
          try {
            wsService.placeBid(auctionId, amount, currentUser.user.id)
            resolve({ success: true })
          } catch (error) {
            reject(error)
          }
        })
      } else {
        return apiClient.placeBid(auctionId, amount)
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bids.byAuction(variables.auctionId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.auctions.detail(variables.auctionId) 
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.lists() })
      toast.success('Bid placed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place bid')
    },
  })
}

// Seller Decision Hooks
export function useAcceptBid() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (auctionId: string) => apiClient.acceptBid(auctionId),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.detail(auctionId) })
      toast.success('Bid accepted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept bid')
    },
  })
}

export function useRejectBid() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (auctionId: string) => apiClient.rejectBid(auctionId),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.detail(auctionId) })
      toast.success('Bid rejected')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject bid')
    },
  })
}

export function useMakeCounterOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ auctionId, amount }: { auctionId: string; amount: number }) =>
      apiClient.makeCounterOffer(auctionId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.detail(variables.auctionId) })
      toast.success('Counter offer sent!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send counter offer')
    },
  })
}

// Counter Offer Response Hooks
export function useAcceptCounterOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (counterOfferId: string) => apiClient.acceptCounterOffer(counterOfferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
      toast.success('Counter offer accepted!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept counter offer')
    },
  })
}

export function useRejectCounterOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (counterOfferId: string) => apiClient.rejectCounterOffer(counterOfferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
      toast.success('Counter offer rejected')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject counter offer')
    },
  })
}

// Notification Hooks
export function useNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => apiClient.getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark notification as read')
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
      toast.success('All notifications marked as read')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark all notifications as read')
    },
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: () => apiClient.getUnreadNotificationCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Counter Offer Hooks
export function useCounterOffers() {
  return useQuery({
    queryKey: ['counter-offers'],
    queryFn: () => apiClient.getCounterOffers(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function usePendingCounterOffersCount() {
  return useQuery({
    queryKey: ['counter-offers', 'pending', 'count'],
    queryFn: async () => {
      const data = await apiClient.getPendingCounterOffers()
      return { count: data.asBuyer.length } // Only count pending counter-offers as buyer
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function usePendingCounterOffers() {
  return useQuery({
    queryKey: ['counter-offers', 'pending'],
    queryFn: () => apiClient.getPendingCounterOffers(),
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Always refetch when component mounts
    refetchInterval: 5000, // Poll every 5 seconds as backup
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  })
}

export function useCounterOffer(id: string) {
  return useQuery({
    queryKey: ['counter-offers', id],
    queryFn: () => apiClient.getCounterOfferById(id),
    enabled: !!id,
  })
}

export function useRespondToCounterOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, response }: { id: string, response: 'accept' | 'reject' }) => 
      apiClient.respondToCounterOffer(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      toast.success('Response sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to respond to counter-offer')
    },
  })
}

export function useMakeAuctionDecision() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ auctionId, decision, counterAmount }: { 
      auctionId: string, 
      decision: 'accept' | 'reject' | 'counter', 
      counterAmount?: number 
    }) => apiClient.makeAuctionDecision(auctionId, decision, counterAmount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
      
      // Provide specific feedback based on the decision made
      if (variables.decision === 'accept') {
        toast.success('Bid accepted! Sale confirmed.', {
          icon: '🎉',
          duration: 6000
        })
      } else if (variables.decision === 'reject') {
        toast.error('Bid rejected. Auction closed with no winner.', {
          icon: '❌',
          duration: 4000
        })
      } else if (variables.decision === 'counter') {
        toast.success(`Counter-offer of $${variables.counterAmount} sent to buyer!`, {
          icon: '📤',
          duration: 6000,
          style: {
            background: '#f59e0b',
            color: '#fff',
          }
        })
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process decision')
    },
  })
}

export function useEndAuction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.endAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      toast.success('Auction ended successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to end auction')
    },
  })
}

export function useSendInvoice() {
  
  return useMutation({
    mutationFn: (id: string) => apiClient.sendInvoice(id),
    onSuccess: () => {
      toast.success('Invoice sent successfully to buyer!', {
        icon: '📧',
        duration: 6000,
        style: {
          background: '#059669',
          color: '#fff',
        }
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invoice')
    },
  })
}

// Auth Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if user is not authenticated
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: async (data) => {
      apiClient.setToken(data.token)
      
      // Set the user data directly in the cache
      queryClient.setQueryData(['auth', 'currentUser'], { user: data.user })
      
      // Invalidate all queries to ensure fresh data
      queryClient.invalidateQueries()
      
      // Connect WebSocket after user data is available
      wsService.connect(data.token)
      
      toast.success('Logged in successfully!')
      
      // Navigate to home page
      router.navigate({ to: '/' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed')
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: Parameters<typeof apiClient.register>[0]) =>
      apiClient.register(userData),
    onSuccess: async (data) => {
      apiClient.setToken(data.token)
      
      // Clear all queries first
      queryClient.clear()
      
      // Immediately fetch current user data
      await queryClient.prefetchQuery({
        queryKey: ['auth', 'currentUser'],
        queryFn: () => apiClient.getCurrentUser(),
      })
      
      // Connect WebSocket after user data is available
      wsService.connect(data.token)
      
      toast.success('Account created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      apiClient.setToken(null)
      wsService.disconnect() // Disconnect WebSocket on logout
      queryClient.clear()
      toast.success('Logged out successfully!')
    },
    onError: (_error: any) => {
      // Even if logout fails on server, clear local state
      apiClient.setToken(null)
      wsService.disconnect() // Disconnect WebSocket on logout
      queryClient.clear()
      toast.success('Logged out')
    },
  })
}
