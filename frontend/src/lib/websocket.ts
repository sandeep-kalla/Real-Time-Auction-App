import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000'

export interface AuctionUpdate {
  type: 'auction_state' | 'new_bid' | 'bid:outbid' | 'auction:ended' | 'seller:decision_required' | 'seller:accepted' | 'seller:rejected' | 'counter:offer' | 'counter:accepted' | 'counter:rejected'
  auctionId: string
  data: any
}

class WebSocketService {
  private socket: Socket | null = null
  private isConnected = false
  private currentAuctionId: string | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(token?: string) {
    const authToken = token || localStorage.getItem('auth_token')
    if (!authToken) {
      console.warn('No auth token available for WebSocket connection')
      return null
    }

    if (this.socket?.connected) {
      console.log('WebSocket already connected')
      return this.socket
    }

    // If we have a socket that's connecting, wait for it
    if (this.socket && !this.socket.connected) {
      console.log('WebSocket connection in progress...')
      return this.socket
    }

    // Disconnect any existing socket first
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    console.log('Connecting to WebSocket...', WS_URL)

    // Connect to the /ws namespace to match backend
    this.socket = io(`${WS_URL}/ws`, {
      auth: {
        token: authToken
      },
      transports: ['websocket'],
      upgrade: true,
      forceNew: true, // Force new connection to prevent issues
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.emit('connection', { status: 'connected' })
      
      // Log the user's personal room for debugging
      console.log('🔗 WebSocket connected, user should be auto-joined to personal notifications')
      
      // Rejoin current auction room if we were in one
      if (this.currentAuctionId) {
        this.socket!.emit('join', this.currentAuctionId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected = false
      this.emit('connection', { status: 'disconnected', reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
      this.emit('connection', { status: 'error', error })
    })

    // Auction-specific events - matching backend
    this.socket.on('auction_state', (data) => {
      this.emit('auction_state', data)
    })

    this.socket.on('new_bid', (data) => {
      this.emit('new_bid', data)
    })

    this.socket.on('error', (data) => {
      this.emit('error', data)
    })

    // Legacy event handlers for backward compatibility
    this.socket.on('bid:placed', (data) => {
      this.emit('bid:placed', data)
    })

    this.socket.on('bid:outbid', (data) => {
      this.emit('bid:outbid', data)
    })

    this.socket.on('auction:ended', (data) => {
      this.emit('auction:ended', data)
    })

    this.socket.on('seller:decision_required', (data) => {
      this.emit('seller:decision_required', data)
    })

    this.socket.on('seller:accepted', (data) => {
      this.emit('seller:accepted', data)
    })

    this.socket.on('seller:rejected', (data) => {
      this.emit('seller:rejected', data)
    })

    this.socket.on('counter:offer', (data) => {
      this.emit('counter:offer', data)
    })

    this.socket.on('counter:accepted', (data) => {
      this.emit('counter:accepted', data)
    })

    this.socket.on('counter:rejected', (data) => {
      this.emit('counter:rejected', data)
    })

    // Notification events
    this.socket.on('notification:new', (data) => {
      console.log('📨 WebSocket notification:new received:', data)
      this.emit('notification:new', data)
    })

    // Counter-offer specific events
    this.socket.on('counter_offer:received', (data) => {
      console.log('📨 WebSocket counter_offer:received:', data)
      this.emit('counter_offer:received', data)
    })

    this.socket.on('bid:accepted', (data) => {
      console.log('📨 WebSocket bid:accepted:', data)
      this.emit('bid:accepted', data)
    })

    this.socket.on('bid:rejected', (data) => {
      console.log('📨 WebSocket bid:rejected:', data)
      this.emit('bid:rejected', data)
    })

    this.socket.on('counter_offer:accepted', (data) => {
      console.log('📨 WebSocket counter_offer:accepted:', data)
      this.emit('counter_offer:accepted', data)
    })

    this.socket.on('counter_offer:rejected', (data) => {
      console.log('📨 WebSocket counter_offer:rejected:', data)
      this.emit('counter_offer:rejected', data)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.currentAuctionId = null
    }
  }

  // Join a specific auction room for real-time updates
  joinAuctionRoom(auctionId: string) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected')
      return
    }

    // Don't rejoin the same room
    if (this.currentAuctionId === auctionId) {
      console.log(`Already in auction room: ${auctionId}`)
      return
    }

    // Leave previous room if any
    if (this.currentAuctionId && this.currentAuctionId !== auctionId) {
      this.leaveAuctionRoom(this.currentAuctionId)
    }

    this.currentAuctionId = auctionId
    // Match backend event name
    this.socket.emit('join', auctionId)
    console.log(`Joined auction room: ${auctionId}`)
  }

  leaveAuctionRoom(auctionId: string) {
    if (!this.socket?.connected) {
      return
    }

    // The backend doesn't have a leave event, so we'll just update our state
    console.log(`Left auction room: ${auctionId}`)
    
    if (this.currentAuctionId === auctionId) {
      this.currentAuctionId = null
    }
  }

  // Place a bid (optimistic update)
  placeBid(auctionId: string, amount: number, userId: string) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }

    // Match backend event name and structure
    this.socket.emit('place_bid', { auctionId, amount, userId })
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function) {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return

    if (callback) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    } else {
      this.listeners.set(event, [])
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  // Public method for testing
  public testEmit(event: string, data: any) {
    this.emit(event, data)
  }

  // Getters
  get connected() {
    return this.isConnected
  }

  get currentRoom() {
    return this.currentAuctionId
  }
}

export const wsService = new WebSocketService()

// React hook for WebSocket connection
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(() => {
    // Initialize based on current connection state
    return wsService.connected ? 'connected' : 'disconnected'
  })

  useEffect(() => {
    const handleConnection = (data: any) => {
      setConnectionStatus(data.status)
    }

    wsService.on('connection', handleConnection)

    // Check current connection state on mount
    if (wsService.connected) {
      setConnectionStatus('connected')
    }

    return () => {
      wsService.off('connection', handleConnection)
    }
  }, [])

  const connect = (token?: string) => {
    setConnectionStatus('connecting')
    wsService.connect(token)
  }

  const disconnect = () => {
    wsService.disconnect()
    setConnectionStatus('disconnected')
  }

  return {
    connectionStatus,
    connect,
    disconnect,
    isConnected: connectionStatus === 'connected',
    joinAuctionRoom: wsService.joinAuctionRoom.bind(wsService),
    leaveAuctionRoom: wsService.leaveAuctionRoom.bind(wsService),
    on: wsService.on.bind(wsService),
    off: wsService.off.bind(wsService),
  }
}

// React hook for auction room connection
export function useAuctionRoom(auctionId: string) {
  const { isConnected, connect, joinAuctionRoom, leaveAuctionRoom } = useWebSocket()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    
    // If we have a token but aren't connected, try to connect
    if (token && !isConnected) {
      console.log('Auction room: WebSocket not connected, attempting to connect...')
      connect(token)
      
      // Retry logic with exponential backoff
      const retryTimer = setTimeout(() => {
        if (!isConnected && retryCount < 3) {
          console.log(`Auction room: Retrying connection (attempt ${retryCount + 1})`)
          setRetryCount(prev => prev + 1)
          connect(token)
        }
      }, Math.min(1000 * Math.pow(2, retryCount), 5000)) // Max 5 seconds
      
      return () => clearTimeout(retryTimer)
    } else if (isConnected) {
      // Reset retry count when connected
      setRetryCount(0)
    }
  }, [isConnected, connect, retryCount])

  useEffect(() => {
    if (isConnected && auctionId) {
      console.log(`Auction room: Joining auction ${auctionId}`)
      joinAuctionRoom(auctionId)
      
      return () => {
        console.log(`Auction room: Leaving auction ${auctionId}`)
        leaveAuctionRoom(auctionId)
      }
    }
  }, [isConnected, auctionId]) // Remove the function references from deps

  return {
    isConnected,
    currentRoom: wsService.currentRoom,
  }
}

// React hook for auction events
export function useAuctionEvents(auctionId: string) {
  const [auctionState, setAuctionState] = useState<any>(null)
  const [latestBid, setLatestBid] = useState<any>(null)
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const handleAuctionState = (data: any) => {
      console.log('Auction state update received:', data)
      // The backend sends the auction data directly, not wrapped in an object with auctionId
      setAuctionState(data)
      
      // Check if auction has ended
      if (data.status === 'ended' || data.status === 'sold' || data.status === 'closed_no_winner') {
        setIsEnded(true)
      }
    }

    const handleNewBid = (data: any) => {
      console.log('New bid received:', data)
      // Update latest bid when a new bid is placed
      setLatestBid(data)
    }

    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        setLatestBid(data)
      }
    }

    const handleAuctionEnded = (data: any) => {
      console.log('Auction ended event received:', data)
      if (data.auctionId === auctionId) {
        setIsEnded(true)
      }
    }

    // Listen to both old and new event names for compatibility
    wsService.on('auction_state', handleAuctionState)
    wsService.on('new_bid', handleNewBid)
    wsService.on('auction:state', handleAuctionState)
    wsService.on('bid:placed', handleBidPlaced)
    wsService.on('auction:ended', handleAuctionEnded)

    return () => {
      wsService.off('auction_state', handleAuctionState)
      wsService.off('new_bid', handleNewBid)
      wsService.off('auction:state', handleAuctionState)
      wsService.off('bid:placed', handleBidPlaced)
      wsService.off('auction:ended', handleAuctionEnded)
    }
  }, [auctionId])

  return {
    auctionState,
    latestBid,
    isEnded,
  }
}
