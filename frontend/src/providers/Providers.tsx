import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { wsService } from "../lib/websocket";
import { useCurrentUser } from "../hooks/api";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

function WebSocketManager() {
  const { data: currentUser, isLoading } = useCurrentUser();

  // Enable real-time notifications when user is authenticated
  useRealtimeNotifications();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    // Connect WebSocket if user is authenticated (token exists)
    if (token) {
      console.log(
        "🔌 WebSocketManager: Connecting WebSocket for authenticated user:",
        currentUser?.user?.name || "Loading...",
        "User ID:",
        currentUser?.user?.id
      );
      wsService.connect(token);
    } else {
      // Disconnect if no token
      console.log(
        "🔌 WebSocketManager: No token found, disconnecting WebSocket"
      );
      wsService.disconnect();
    }
  }, [currentUser, isLoading]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketManager />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </QueryClientProvider>
  );
}
