import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsService } from '../lib/websocket'
import { queryKeys, useCurrentUser } from './api'
import toast from 'react-hot-toast'

export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()

  useEffect(() => {
    // Ensure WebSocket connection when component mounts
    const token = localStorage.getItem('auth_token')
    if (token && currentUser?.user) {
      console.log('🔄 useRealtimeNotifications: Ensuring WebSocket connection for notifications')
      wsService.connect(token)
    }

    const handleNewNotification = (data: any) => {
      console.log('🔔 New notification received:', data)
      console.log('🔍 Current user info:', {
        currentUserId: currentUser?.user?.id,
        notificationUserId: data.userId,
        userIdType: typeof currentUser?.user?.id,
        notificationUserIdType: typeof data.userId,
        areEqual: currentUser?.user?.id === data.userId
      })
      
      // Only show notifications for the current user
      if (!currentUser?.user) {
        console.log('❌ No current user found, ignoring notification')
        return;
      }
      
      // Convert both IDs to strings for comparison to handle any type differences
      const currentUserId = String(currentUser.user.id)
      const notificationUserId = String(data.userId)
      
      if (notificationUserId !== currentUserId) {
        console.log('❌ Notification not for current user, ignoring', {
          expected: currentUserId,
          received: notificationUserId
        })
        return;
      }
      
      console.log('✅ Notification is for current user, processing...')
      
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
      // Also invalidate unread count
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] })
      // Invalidate counter-offers if it's a counter-offer related notification
      if (data.type && (data.type.includes('counter') || data.type === 'counter_offer')) {
        console.log('🔄 Invalidating counter-offers queries due to notification type:', data.type)
        queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
        queryClient.invalidateQueries({ queryKey: ['counter-offers', 'pending'] })
      }
      
      // Show toast notification based on type
      try {
        const payload = JSON.parse(data.payload || '{}')
        console.log('📦 Parsed notification payload:', payload)
        
        if (data.type === 'new_bid') {
          toast.success(`New bid of $${payload.bidAmount} on "${payload.auctionName}" by ${payload.bidderName}`, {
            icon: '💰'
          })
        } else if (data.type === 'outbid') {
          toast.error(`You've been outbid! New bid: $${payload.newBidAmount} on "${payload.auctionName}"`, {
            icon: '😞'
          })
        } else if (data.type === 'auction_ended') {
          toast(`Auction "${payload.auctionName}" has ended`, { 
            icon: 'ℹ️' 
          })
        } else if (data.type === 'counter_accepted') {
          toast.success(`🎉 Counter-offer accepted! ${payload.buyerName} accepted your $${payload.amount} counter-offer for "${payload.auctionName}"`, {
            icon: '✅'
          })
        } else if (data.type === 'counter_rejected') {
          toast.error(`❌ Counter-offer rejected. ${payload.buyerName} rejected your $${payload.amount} counter-offer for "${payload.auctionName}"`, {
            icon: '❌'
          })
        } else if (data.type === 'counter_offer') {
          console.log('📨 Counter-offer notification received:', payload)
          toast(`🤝 New Counter-offer: $${payload.counterAmount} for "${payload.auctionName}"`, {
            icon: '💰',
            duration: 8000,
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          })
        } else if (data.type === 'bid_accepted') {
          toast.success(`🎉 Your bid has been accepted for "${payload.auctionName}"!`, {
            icon: '✅',
            duration: 6000
          })
        } else if (data.type === 'bid_rejected') {
          toast.error(`❌ Your bid was rejected for "${payload.auctionName}"`, {
            icon: '😞',
            duration: 6000
          })
        } else {
          console.log('❓ Unknown notification type:', data.type)
        }
      } catch (error) {
        console.error('Error parsing notification payload:', error, data)
      }
    }

    const handleCounterOfferReceived = (data: any) => {
      console.log('📨 Counter-offer received (WebSocket event):', data)
      
      // Invalidate counter-offers queries to trigger refetch
      console.log('🔄 Invalidating counter-offers queries due to counter_offer:received event')
      queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
      queryClient.invalidateQueries({ queryKey: ['counter-offers', 'pending'] })
      
      // Always show toast for counter-offer received event (this is a backup)
      toast(`🤝 Counter-offer received: $${data.counterAmount} for "${data.auctionName}"`, {
        duration: 8000,
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      })
    }

    const handleBidAccepted = (data: any) => {
      console.log('Bid accepted:', data)
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      
      toast.success(`🎉 Congratulations! Your bid has been accepted for "${data.auctionName}"!`, {
        duration: 8000,
      })
    }

    const handleBidRejected = (data: any) => {
      console.log('Bid rejected:', data)
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      
      toast.error(`❌ Your bid was rejected for "${data.auctionName}"`, {
        duration: 6000,
      })
    }

    const handleCounterOfferAccepted = (data: any) => {
      console.log('Counter-offer accepted:', data)
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
      queryClient.invalidateQueries({ queryKey: ['counter-offers', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      
      toast.success(`✅ Counter-offer accepted! Sale confirmed for "${data.auctionName}"`, {
        duration: 8000,
      })
    }

    const handleCounterOfferRejected = (data: any) => {
      console.log('Counter-offer rejected:', data)
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['counter-offers'] })
      queryClient.invalidateQueries({ queryKey: ['counter-offers', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      
      toast.error(`❌ Counter-offer rejected for "${data.auctionName}"`, {
        duration: 6000,
      })
    }

    // Listen for notification events
    wsService.on('notification:new', handleNewNotification)
    wsService.on('counter_offer:received', handleCounterOfferReceived)
    wsService.on('bid:accepted', handleBidAccepted)
    wsService.on('bid:rejected', handleBidRejected)
    wsService.on('counter_offer:accepted', handleCounterOfferAccepted)
    wsService.on('counter_offer:rejected', handleCounterOfferRejected)

    return () => {
      wsService.off('notification:new', handleNewNotification)
      wsService.off('counter_offer:received', handleCounterOfferReceived)
      wsService.off('bid:accepted', handleBidAccepted)
      wsService.off('bid:rejected', handleBidRejected)
      wsService.off('counter_offer:accepted', handleCounterOfferAccepted)
      wsService.off('counter_offer:rejected', handleCounterOfferRejected)
    }
  }, [queryClient, currentUser])
}
