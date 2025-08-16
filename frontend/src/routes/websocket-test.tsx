import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { wsService } from "../lib/websocket";
import { useCurrentUser } from "../hooks/api";

export const Route = createFileRoute("/websocket-test")({
  component: WebSocketTest,
});

function WebSocketTest() {
  const { data: currentUser } = useCurrentUser();
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [receivedEvents, setReceivedEvents] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const token = localStorage.getItem("auth_token");
    if (token) {
      wsService.connect(token);
    }

    const handleConnection = (data: any) => {
      setConnectionStatus(data.status);
      addEvent(`Connection: ${data.status}`, data);
    };

    const handleNotification = (data: any) => {
      addEvent("Notification received", data);
    };

    const handleCounterOfferReceived = (data: any) => {
      addEvent("Counter-offer received", data);
    };

    const handleCounterOfferResponse = (data: any) => {
      addEvent("Counter-offer response", data);
    };

    const handleCounterOfferAccepted = (data: any) => {
      addEvent("Counter-offer accepted", data);
    };

    const handleCounterOfferRejected = (data: any) => {
      addEvent("Counter-offer rejected", data);
    };

    const addEvent = (type: string, data: any) => {
      const event = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        data: JSON.stringify(data, null, 2),
      };
      setReceivedEvents((prev) => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    };

    // Listen to all events when testing is active
    if (isListening) {
      wsService.on("connection", handleConnection);
      wsService.on("notification:new", handleNotification);
      wsService.on("counter_offer:received", handleCounterOfferReceived);
      wsService.on("counter_offer:response", handleCounterOfferResponse);
      wsService.on("counter_offer:accepted", handleCounterOfferAccepted);
      wsService.on("counter_offer:rejected", handleCounterOfferRejected);
    }

    return () => {
      wsService.off("connection", handleConnection);
      wsService.off("notification:new", handleNotification);
      wsService.off("counter_offer:received", handleCounterOfferReceived);
      wsService.off("counter_offer:response", handleCounterOfferResponse);
      wsService.off("counter_offer:accepted", handleCounterOfferAccepted);
      wsService.off("counter_offer:rejected", handleCounterOfferRejected);
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setReceivedEvents([]);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const testNotification = () => {
    // Simulate a counter-offer notification manually for testing
    const testData = {
      userId: currentUser?.user?.id,
      type: "counter_offer",
      payload: JSON.stringify({
        auctionId: "test-auction",
        auctionName: "Test Auction",
        counterOfferId: "test-counter",
        originalBid: 100,
        counterAmount: 120,
        sellerName: "Test Seller",
      }),
      createdAt: new Date().toISOString(),
    };

    console.log("🧪 Triggering test notification:", testData);
    wsService.testEmit("notification:new", testData);
  };

  const clearEvents = () => {
    setReceivedEvents([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">WebSocket Test</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          ></div>
          <span className="font-medium">{connectionStatus}</span>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            <strong>Current User:</strong>{" "}
            {currentUser?.user?.name || "Not logged in"}
          </p>
          <p>
            <strong>User ID:</strong> {currentUser?.user?.id || "N/A"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startListening}
            disabled={isListening}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Start Listening
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Stop Listening
          </button>
          <button
            onClick={testNotification}
            disabled={!currentUser?.user}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Notification
          </button>
          <button
            onClick={clearEvents}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Events
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Received Events ({receivedEvents.length})
        </h2>

        {receivedEvents.length === 0 ? (
          <p className="text-gray-500 italic">
            {isListening
              ? "Listening for events..."
              : "Start listening to see events"}
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {receivedEvents.map((event, index) => (
              <div key={index} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-600">
                    {event.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.timestamp}
                  </span>
                </div>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {event.data}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
