import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useAuction,
  usePlaceBid,
  useAuctionBids,
  useCurrentUser,
  useEndAuction,
} from "../../hooks/api";
import { useAuctionRoom, useAuctionEvents } from "../../lib/websocket";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { LoadingState } from "../../components/ui/States";
import { EndAuctionModal } from "../../components/ui/EndAuctionModal";
import {
  HammerIcon,
  TrendingUpIcon,
  DollarSignIcon,
  UserIcon,
  ArrowLeftIcon,
  XIcon,
  DownloadIcon,
  FileTextIcon,
} from "../../components/ui/Icons";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../hooks/api";
import { generateAuctionInvoice } from "../../utils/invoiceGenerator";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const Route = createFileRoute("/auction/$id")({
  component: AuctionRoomPage,
});

function AuctionRoomPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: auction, isLoading, error } = useAuction(id);
  const { data: bids } = useAuctionBids(id);
  const { data: currentUser } = useCurrentUser();
  const placeBidMutation = usePlaceBid();
  const endAuctionMutation = useEndAuction();

  // WebSocket connection for real-time updates
  const { isConnected } = useAuctionRoom(id);
  const { auctionState, latestBid, isEnded } = useAuctionEvents(id);

  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [participants] = useState(0);
  const [showEndAuctionModal, setShowEndAuctionModal] = useState(false);

  // Ensure WebSocket connection on component mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    console.log("Auction page mount:", {
      auctionId: id,
      hasToken: !!token,
      isConnected,
      timestamp: new Date().toISOString(),
    });

    if (token && !isConnected) {
      console.log("Auction page: Ensuring WebSocket connection...");
      // Force WebSocket connection if not already connected
      import("../../lib/websocket").then(({ wsService }) => {
        wsService.connect(token);
      });
    }
  }, [id, isConnected]);

  // Check user permissions for bidding (moved before conditional returns)
  const canBid = () => {
    if (!currentUser?.user) return false;
    if (currentUser.user.role !== "buyer" && currentUser.user.role !== "admin")
      return false;
    if (auction?.sellerId === currentUser.user.id) return false; // Can't bid on own auction
    return true;
  };

  // Calculate bid values (moved before conditional returns)
  const currentBid = auction
    ? parseFloat(
        latestBid?.amount ||
          auction.highestBid?.amount ||
          auction.startPrice ||
          0
      )
    : 0;
  const nextMinBid = auction
    ? currentBid + parseFloat(auction.bidIncrement || 0)
    : 0;
  const isValidBid =
    bidAmount &&
    !isNaN(parseFloat(bidAmount)) &&
    parseFloat(bidAmount) >= nextMinBid;

  // Debug logging
  console.log("Bid validation:", {
    bidAmount,
    currentBid,
    nextMinBid,
    isValidBid,
    canBid: canBid(),
    startPrice: auction?.startPrice,
    bidIncrement: auction?.bidIncrement,
  });

  // Invalidate bid queries when new bid comes via WebSocket
  useEffect(() => {
    if (latestBid && latestBid.auctionId === id) {
      // Invalidate both auction and bids queries for real-time updates
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.byAuction(id) });
    }
  }, [latestBid, id, queryClient]);

  // Handle real-time auction ending
  useEffect(() => {
    if (isEnded) {
      // Invalidate queries to get updated auction status
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.byAuction(id) });

      // Close the end auction modal if it's open
      setShowEndAuctionModal(false);
    }
  }, [isEnded, id, queryClient]);

  // Handle real-time auction state updates
  useEffect(() => {
    if (auctionState && auctionState.id === id) {
      // Invalidate queries when auction state changes via websocket
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctions.detail(id),
      });
    }
  }, [auctionState, id, queryClient]);

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (amount >= nextMinBid && canBid()) {
      placeBidMutation.mutate(
        { auctionId: id, amount },
        {
          onSuccess: () => {
            setBidAmount(""); // Clear bid input on success
          },
        }
      );
    }
  };

  const handleEndAuction = () => {
    setShowEndAuctionModal(true);
  };

  const confirmEndAuction = () => {
    endAuctionMutation.mutate(id, {
      onSuccess: () => {
        setShowEndAuctionModal(false);
      },
      onError: () => {
        setShowEndAuctionModal(false);
      },
    });
  };

  const handleDownloadInvoice = () => {
    if (!auction || !currentUser?.user) return;

    // Determine the winning bid for ended auctions
    const winningBid =
      bids && bids.length > 0
        ? bids.reduce((highest, bid) =>
            parseFloat(bid.amount) > parseFloat(highest.amount) ? bid : highest
          )
        : undefined;

    generateAuctionInvoice(auction, bids || [], currentUser.user, winningBid);
  };

  // Timer for auction countdown
  useEffect(() => {
    if (!auction) return;

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(auction.goLiveAt);
      const endTime = new Date(
        startTime.getTime() + auction.durationMins * 60 * 1000
      );

      if (now < startTime) {
        // Auction hasn't started yet
        const diff = startTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Starts in ${hours}h ${minutes}m ${seconds}s`);
      } else if (now < endTime && !isEnded && auction.status === "live") {
        // Auction is live
        const diff = endTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        // Auction has ended
        if (auction.status === "sold") {
          setTimeLeft("Sold");
        } else if (auction.status === "closed_no_winner") {
          setTimeLeft("No Winner");
        } else {
          setTimeLeft("Auction Ended");
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction, isEnded]);

  // Update bid amount when current bid changes
  useEffect(() => {
    if (auction) {
      const currentBidAmount = parseFloat(
        latestBid?.amount || auction.currentBid || auction.startPrice || 0
      );
      const nextMinBid =
        currentBidAmount + parseFloat(auction.bidIncrement || 0);
      setBidAmount(nextMinBid.toString());
    }
  }, [auction, latestBid]);

  // Helper functions
  const isLive = () => {
    if (!auction) return false;
    if (isEnded || auction.status === "ended") return false;
    const now = new Date();
    const startTime = new Date(auction.goLiveAt);
    const endTime = new Date(
      startTime.getTime() + auction.durationMins * 60 * 1000
    );
    return now >= startTime && now <= endTime && auction.status === "live";
  };

  const isUpcoming = () => {
    if (!auction) return false;
    if (isEnded || auction.status === "ended") return false;
    const now = new Date();
    const startTime = new Date(auction.goLiveAt);
    return now < startTime && auction.status === "scheduled";
  };

  const isAuctionEnded = () => {
    if (!auction) return false;
    return (
      isEnded ||
      auction.status === "ended" ||
      auction.status === "sold" ||
      auction.status === "closed_no_winner"
    );
  };

  const getStatusBadge = () => {
    if (isUpcoming()) return <Badge variant="warning">Upcoming</Badge>;
    if (isLive()) return <Badge variant="success">Live</Badge>;
    if (auction?.status === "sold")
      return <Badge variant="success">Sold</Badge>;
    if (auction?.status === "closed_no_winner")
      return <Badge variant="default">No Winner</Badge>;
    return <Badge variant="default">Ended</Badge>;
  };

  // Conditional rendering AFTER all hooks
  if (isLoading) {
    return (
      <div className="container-custom px-6 lg:px-12 py-8">
        <LoadingState>Loading auction details...</LoadingState>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container-custom px-6 lg:px-12 py-12">
        <Card variant="glass" className="max-w-md mx-auto text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-dark-100 mb-2">
              Auction Not Found
            </h3>
            <p className="text-dark-400 mb-6">
              The auction you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button variant="gradient" className="gap-2">
                <ArrowLeftIcon size="sm" />
                Back to Auctions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom px-6 lg:px-12 py-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8 px-2 lg:px-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeftIcon size="sm" />
            Back
          </Button>
        </Link>
        <div className="h-6 w-px bg-surface-600" />
        <div className="flex items-center gap-2">
          <HammerIcon className="w-6 h-6 text-primary-500" />
          <span className="text-dark-400 text-sm">Live Auction</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 px-2 lg:px-4">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-3">
            {auction.itemName}
          </h1>
          <p className="text-dark-400 text-lg leading-relaxed max-w-2xl">
            {auction.description}
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          {getStatusBadge()}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isConnected
                  ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                  : "bg-red-500 animate-bounce"
              }`}
            />
            <span className="text-sm text-dark-300 font-medium">
              {isConnected ? "Live Connection" : "Reconnecting..."}
            </span>
          </div>
          {!isConnected && (
            <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
              Establishing real-time connection...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-2 lg:px-4">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-12">
          {/* Auction Info Cards */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px bg-gradient-to-r from-primary-500/50 to-transparent flex-1" />
              <h2 className="text-lg font-semibold text-dark-200 px-4">
                Auction Details
              </h2>
              <div className="h-px bg-gradient-to-l from-primary-500/50 to-transparent flex-1" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
              <Card variant="glass" className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSignIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-dark-400">
                      Starting Price
                    </span>
                  </div>
                  <div className="text-xl font-bold text-primary-400">
                    ${auction.startPrice}
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUpIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-dark-400">Current Bid</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    ${currentBid.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-sm text-dark-400">Increment</span>
                  </div>
                  <div className="text-lg font-semibold text-dark-200">
                    ${auction.bidIncrement}
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-sm text-dark-400">Total Bids</span>
                  </div>
                  <div className="text-lg font-semibold text-dark-200">
                    {bids?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Timer Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px bg-gradient-to-r from-primary-500/50 to-transparent flex-1" />
              <h2 className="text-lg font-semibold text-dark-200 px-4">
                {isUpcoming()
                  ? "Countdown"
                  : isLive()
                    ? "Live Timer"
                    : "Status"}
              </h2>
              <div className="h-px bg-gradient-to-l from-primary-500/50 to-transparent flex-1" />
            </div>
            <Card variant="glass" className="text-center">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold text-dark-100 mb-4">
                  {isUpcoming()
                    ? "🚀 Auction Starts In"
                    : isLive()
                      ? "⏰ Time Remaining"
                      : auction?.status === "sold"
                        ? "🎉 Auction Sold"
                        : auction?.status === "closed_no_winner"
                          ? "😔 No Winner"
                          : "🏁 Auction Ended"}
                </h3>
                <div className="text-4xl lg:text-5xl font-bold text-gradient mb-4">
                  {timeLeft}
                </div>
                {participants > 0 && (
                  <p className="text-dark-400 flex items-center justify-center gap-2">
                    <UserIcon size="sm" />
                    {participants} active participants
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bid History */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px bg-gradient-to-r from-primary-500/50 to-transparent flex-1" />
              <h2 className="text-lg font-semibold text-dark-200 px-4">
                Bidding Activity
              </h2>
              <div className="h-px bg-gradient-to-l from-primary-500/50 to-transparent flex-1" />
            </div>
            <Card variant="glass">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <TrendingUpIcon className="text-primary-500" size="sm" />
                  Bid History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-3">
                  {bids && bids.length > 0 ? (
                    bids.map((bid: any, index: number) => (
                      <div
                        key={bid.id || index}
                        className="flex justify-between items-center p-3 bg-surface-800/30 rounded-lg border border-surface-700/50 hover:border-primary-500/30 hover:bg-surface-800/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                            <UserIcon
                              size="sm"
                              className="text-primary-400 w-3 h-3"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-green-400 text-base">
                              ${bid.amount}
                            </div>
                            <div className="text-xs text-dark-400">
                              by {bid.bidder?.name || "Anonymous"}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-dark-500 text-right">
                          {dayjs(bid.createdAt).fromNow()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-surface-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUpIcon className="w-6 h-6 text-dark-500" />
                      </div>
                      <p className="text-dark-400 font-medium">No bids yet</p>
                      <p className="text-dark-500 text-xs mt-1">
                        Be the first to place a bid!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          {/* Bidding Panel - Only show if auction is not ended */}
          {!isAuctionEnded() && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gradient-to-r from-primary-500/50 to-transparent flex-1" />
                <h2 className="text-base font-semibold text-dark-200 px-3">
                  Bidding
                </h2>
                <div className="h-px bg-gradient-to-l from-primary-500/50 to-transparent flex-1" />
              </div>
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <HammerIcon className="text-primary-500" />
                    Place a Bid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!currentUser?.user ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-primary-400" />
                      </div>
                      <p className="text-dark-400 mb-4">
                        Please log in to place bids
                      </p>
                      <Link to="/auth/login">
                        <Button variant="gradient" className="w-full">
                          Login to Bid
                        </Button>
                      </Link>
                    </div>
                  ) : !canBid() ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XIcon className="w-8 h-8 text-yellow-400" />
                      </div>
                      <p className="text-dark-400 mb-4">
                        {auction.sellerId === currentUser.user.id
                          ? "You cannot bid on your own auction"
                          : currentUser.user.role === "seller"
                            ? "Only buyers can place bids"
                            : "You cannot bid on this auction"}
                      </p>
                      {/* Show End Auction button for sellers */}
                      {auction.sellerId === currentUser.user.id && isLive() && (
                        <Button
                          onClick={handleEndAuction}
                          disabled={endAuctionMutation.isPending}
                          variant="danger"
                          className="w-full"
                        >
                          {endAuctionMutation.isPending
                            ? "Ending Auction..."
                            : "End Auction"}
                        </Button>
                      )}
                      {auction.sellerId !== currentUser.user.id && (
                        <Button disabled variant="outline" className="w-full">
                          Cannot Bid
                        </Button>
                      )}
                    </div>
                  ) : !isLive() ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HammerIcon className="w-8 h-8 text-dark-500" />
                      </div>
                      <p className="text-dark-400 mb-4">
                        {isUpcoming()
                          ? "Bidding will open when the auction starts"
                          : "Bidding has ended"}
                      </p>
                      <Button disabled variant="outline" className="w-full">
                        {isUpcoming() ? "Auction Not Started" : "Auction Ended"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-surface-800/50 rounded-xl p-4 border border-surface-700">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-dark-400">
                            Minimum bid:
                          </span>
                          <span className="font-bold text-primary-400 text-lg">
                            ${nextMinBid.toFixed(2)}
                          </span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min={nextMinBid}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Enter amount (min: $${nextMinBid.toFixed(2)})`}
                          error={
                            bidAmount && !isValidBid
                              ? `Bid must be at least $${nextMinBid.toFixed(2)}`
                              : ""
                          }
                          variant="glass"
                          icon={<DollarSignIcon size="sm" />}
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handlePlaceBid}
                        disabled={
                          !isValidBid || placeBidMutation.isPending || !canBid()
                        }
                        variant="gradient"
                        size="lg"
                      >
                        {placeBidMutation.isPending
                          ? "Placing Bid..."
                          : "Place Bid"}
                      </Button>

                      <p className="text-xs text-dark-500 text-center bg-surface-800/50 p-3 rounded-lg">
                        💡 By placing a bid, you agree to purchase this item if
                        you win.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Bid Buttons */}
              {isLive() && canBid() && currentUser?.user && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">⚡ Quick Bid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBidAmount(nextMinBid.toFixed(2))}
                        className="text-xs"
                      >
                        ${nextMinBid.toFixed(2)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount =
                            nextMinBid + parseFloat(auction.bidIncrement);
                          setBidAmount(amount.toFixed(2));
                        }}
                        className="text-xs"
                      >
                        $
                        {(
                          nextMinBid + parseFloat(auction.bidIncrement)
                        ).toFixed(2)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount =
                            nextMinBid + parseFloat(auction.bidIncrement) * 2;
                          setBidAmount(amount.toFixed(2));
                        }}
                        className="text-xs"
                      >
                        $
                        {(
                          nextMinBid +
                          parseFloat(auction.bidIncrement) * 2
                        ).toFixed(2)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount =
                            nextMinBid + parseFloat(auction.bidIncrement) * 5;
                          setBidAmount(amount.toFixed(2));
                        }}
                        className="text-xs"
                      >
                        $
                        {(
                          nextMinBid +
                          parseFloat(auction.bidIncrement) * 5
                        ).toFixed(2)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Auction Info */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HammerIcon className="text-primary-500" />
                  Auction Information
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface-800/50 rounded-lg">
                  <span className="text-dark-400 flex items-center gap-2">
                    <UserIcon size="sm" />
                    Seller
                  </span>
                  <span className="font-semibold text-dark-100">
                    {auction.seller?.name || "Anonymous"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-surface-800/50 rounded-lg">
                  <span className="text-dark-400">Started</span>
                  <span className="font-semibold text-dark-100">
                    {dayjs(auction.goLiveAt).format("MMM D, YYYY h:mm A")}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-surface-800/50 rounded-lg">
                  <span className="text-dark-400">Duration</span>
                  <span className="font-semibold text-dark-100">
                    {auction.durationMins} minutes
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-surface-800/50 rounded-lg">
                  <span className="text-dark-400">Category</span>
                  <span className="font-semibold text-dark-100">
                    {auction.category || "General"}
                  </span>
                </div>

                {/* Show final result if auction ended */}
                {isAuctionEnded() && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-surface-800/50 rounded-lg border-2 border-primary-500/30">
                      <span className="text-dark-400">Final Result</span>
                      <span className="font-semibold text-primary-400">
                        {auction.status === "sold"
                          ? `Sold for $${currentBid.toFixed(2)}`
                          : auction.status === "closed_no_winner"
                            ? "No Winner"
                            : "Ended"}
                      </span>
                    </div>

                    {/* Invoice download for ended auctions */}
                    {currentUser?.user &&
                      (auction.status === "sold" ||
                        (bids && bids.length > 0)) && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileTextIcon
                                className="text-green-400"
                                size="sm"
                              />
                              <span className="text-sm font-medium text-green-400">
                                {currentUser.user.id === auction.seller?.id
                                  ? "Seller Invoice"
                                  : "Buyer Receipt"}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadInvoice}
                              className="gap-2 text-green-400 border-green-500/30 hover:bg-green-500/10"
                            >
                              <DownloadIcon size="sm" />
                              Download PDF
                            </Button>
                          </div>
                          <p className="text-xs text-green-300">
                            Download your{" "}
                            {currentUser.user.id === auction.seller?.id
                              ? "selling"
                              : "bidding"}{" "}
                            invoice for this auction
                          </p>
                        </div>
                      )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* End Auction Confirmation Modal */}
      <EndAuctionModal
        isOpen={showEndAuctionModal}
        onClose={() => setShowEndAuctionModal(false)}
        onConfirm={confirmEndAuction}
        isLoading={endAuctionMutation.isPending}
        auctionName={auction.itemName}
        currentBid={currentBid}
      />
    </div>
  );
}
