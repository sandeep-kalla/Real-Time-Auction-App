import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { LoadingState, ErrorState } from "../../components/ui/States";
import {
  HammerIcon,
  DollarSignIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
  GridIcon,
  LiveIcon,
  HeartIcon,
  PlusIcon,
  MailIcon,
} from "../../components/ui/Icons";
import {
  useMyAuctions,
  useMakeAuctionDecision,
  useSendInvoice,
} from "../../hooks/api";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export const Route = createFileRoute("/sell/mine")({
  component: MyAuctionsPage,
});

function MyAuctionsPage() {
  const { data: auctions, isLoading, error } = useMyAuctions();
  const makeDecision = useMakeAuctionDecision();
  const sendInvoice = useSendInvoice();
  const [counterOffers, setCounterOffers] = useState<{ [key: string]: string }>(
    {}
  );
  const [showCounterInput, setShowCounterInput] = useState<{
    [key: string]: boolean;
  }>({});

  if (isLoading) {
    return <LoadingState>Loading your auctions...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load your auctions"
        message="Unable to fetch your auctions. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const getStatusBadge = (auction: any) => {
    switch (auction.status) {
      case "scheduled":
        return (
          <Badge
            variant="default"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            Scheduled
          </Badge>
        );
      case "live":
        return (
          <Badge
            variant="success"
            className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse"
          >
            <LiveIcon size="sm" className="mr-1 w-3 h-3" />
            Live Now
          </Badge>
        );
      case "ended":
        return (
          <Badge
            variant="warning"
            className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          >
            <ClockIcon size="sm" className="mr-1 w-3 h-3" />
            Decision Required
          </Badge>
        );
      case "sold":
        return (
          <Badge
            variant="success"
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            <HeartIcon size="sm" className="mr-1 w-3 h-3" />
            Sold
          </Badge>
        );
      case "closed_no_winner":
        return (
          <Badge
            variant="danger"
            className="bg-red-500/20 text-red-400 border-red-500/30"
          >
            Closed
          </Badge>
        );
      default:
        return <Badge variant="default">{auction.status}</Badge>;
    }
  };

  const handleDecision = async (
    auctionId: string,
    decision: "accept" | "reject" | "counter"
  ) => {
    try {
      const counterAmount =
        decision === "counter"
          ? parseFloat(counterOffers[auctionId])
          : undefined;

      if (decision === "counter" && (!counterAmount || counterAmount <= 0)) {
        toast.error("Please enter a valid counter-offer amount");
        return;
      }

      console.log("🔄 Making auction decision:", {
        auctionId,
        decision,
        counterAmount,
      });

      await makeDecision.mutateAsync({ auctionId, decision, counterAmount });

      console.log("✅ Auction decision completed successfully");

      // Reset counter-offer input
      if (decision === "counter") {
        setCounterOffers((prev) => ({ ...prev, [auctionId]: "" }));
        setShowCounterInput((prev) => ({ ...prev, [auctionId]: false }));
      }
    } catch (error) {
      console.error("Failed to make decision:", error);
    }
  };

  const toggleCounterInput = (auctionId: string) => {
    setShowCounterInput((prev) => ({ ...prev, [auctionId]: !prev[auctionId] }));
  };

  const updateCounterOffer = (auctionId: string, value: string) => {
    setCounterOffers((prev) => ({ ...prev, [auctionId]: value }));
  };

  const handleSendInvoice = async (auctionId: string) => {
    try {
      console.log("📧 Sending invoice for auction:", auctionId);
      await sendInvoice.mutateAsync(auctionId);
      console.log("✅ Invoice sent successfully");
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  if (isLoading) {
    return <LoadingState>Loading your auctions...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load your auctions"
        message="Unable to fetch your auctions. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900/20 via-primary-600/10 to-transparent pb-8 sm:pb-12 lg:pb-16">
        <div className="absolute inset-0 bg-grid-primary/5" />
        <div className="container-custom relative pt-4 sm:pt-6 lg:pt-8">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <GridIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-500" />
                  <div className="absolute inset-0 bg-primary-500 blur-xl opacity-30" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-400 leading-none">
                    My Auctions
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-dark-400 mt-1 sm:mt-2 leading-relaxed">
                    Manage your premium auction listings and buyer responses
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {auctions && auctions.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm text-dark-300 whitespace-nowrap">
                      {auctions.filter((a: any) => a.status === "live").length}{" "}
                      <span className="hidden sm:inline">Live</span>
                      <span className="sm:hidden">Live</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                    <ClockIcon size="sm" className="text-yellow-400 w-3 h-3" />
                    <span className="text-xs sm:text-sm text-dark-300 whitespace-nowrap">
                      {auctions.filter((a: any) => a.status === "ended").length}{" "}
                      <span className="hidden sm:inline">Pending</span>
                      <span className="sm:hidden">Pending</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                    <DollarSignIcon
                      size="sm"
                      className="text-green-400 w-3 h-3"
                    />
                    <span className="text-xs sm:text-sm text-dark-300 whitespace-nowrap">
                      <span className="hidden sm:inline">Total: </span>$
                      {auctions
                        .reduce(
                          (sum: number, a: any) =>
                            sum + (a.highestBid?.amount || a.startPrice),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-auto">
              <Link to="/sell/new">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full lg:w-auto gap-2 sm:gap-3 shadow-lg shadow-primary-500/25 text-sm sm:text-base"
                >
                  <PlusIcon size="sm" />
                  <span className="hidden sm:inline">Create New Auction</span>
                  <span className="sm:hidden">New Auction</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom -mt-4 sm:-mt-6 lg:-mt-8 pb-8 sm:pb-12 lg:pb-16">
        {/* Auctions Grid */}
        {auctions && auctions.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {auctions.map((auction: any) => (
              <Card
                key={auction.id}
                variant="glass"
                className="backdrop-blur-xl hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 group"
              >
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col xl:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-base sm:text-lg font-bold text-dark-100 group-hover:text-primary-400 transition-colors">
                              {auction.itemName}
                            </h3>
                            {getStatusBadge(auction)}
                          </div>
                          <p className="text-dark-400 leading-relaxed text-sm max-w-2xl line-clamp-2">
                            {auction.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 bg-surface-800/30 rounded-lg p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-surface-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSignIcon
                              size="sm"
                              className="text-dark-400 w-3 h-3"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-dark-500 uppercase tracking-wide">
                              Starting Price
                            </div>
                            <div className="text-sm font-bold text-dark-100">
                              ${auction.startPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-2 sm:p-3 border border-green-500/20">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                            <FireIcon
                              size="sm"
                              className="text-green-400 w-3 h-3"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-dark-500 uppercase tracking-wide">
                              Current Bid
                            </div>
                            <div className="text-sm font-bold text-green-400">
                              $
                              {(
                                auction.highestBid?.amount || auction.startPrice
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-surface-800/30 rounded-lg p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-surface-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CalendarIcon
                              size="sm"
                              className="text-dark-400 w-3 h-3"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-dark-500 uppercase tracking-wide">
                              Goes Live
                            </div>
                            <div className="text-xs font-semibold text-dark-200">
                              {dayjs(auction.goLiveAt).format("MMM D, h:mm A")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-surface-800/30 rounded-lg p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-surface-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ClockIcon
                              size="sm"
                              className="text-dark-400 w-3 h-3"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-dark-500 uppercase tracking-wide">
                              Duration
                            </div>
                            <div className="text-xs font-semibold text-dark-200">
                              {auction.durationMins >= 60
                                ? `${Math.floor(auction.durationMins / 60)}h`
                                : `${auction.durationMins}m`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Highest Bidder */}
                      {auction.highestBid?.bidder &&
                        auction.status !== "sold" && (
                          <div className="bg-gradient-to-r from-primary-900/20 to-primary-600/10 p-3 rounded-lg border border-primary-500/20">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {auction.highestBid.bidder.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs text-primary-400 font-medium uppercase tracking-wide">
                                  Current Leader
                                </div>
                                <div className="text-sm font-semibold text-dark-100">
                                  {auction.highestBid.bidder.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Sold Auction Info */}
                      {auction.status === "sold" &&
                        auction.highestBid?.bidder && (
                          <div className="bg-gradient-to-r from-green-900/20 to-emerald-600/10 p-3 sm:p-4 rounded-xl border border-green-500/30">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-2">
                                  <HeartIcon className="text-green-400 w-4 h-4 fill-current" />
                                  <h4 className="text-sm font-bold text-green-400">
                                    Sold Successfully!
                                  </h4>
                                </div>
                                <div className="text-left sm:text-right">
                                  <div className="text-lg font-bold text-green-400">
                                    $
                                    {auction.highestBid.amount.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Buyer Info */}
                              <div className="bg-green-950/30 p-2 sm:p-3 rounded-lg border border-green-500/20">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                    {auction.highestBid.bidder.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs text-green-400 font-medium uppercase tracking-wide">
                                      Buyer
                                    </div>
                                    <div className="text-sm font-semibold text-dark-100">
                                      {auction.highestBid.bidder.name}
                                    </div>
                                  </div>
                                  <div className="text-xs text-dark-400 hidden sm:block">
                                    Contact buyer to arrange delivery
                                  </div>
                                </div>
                              </div>

                              {/* Invoice Notice */}
                              <div className="bg-blue-950/30 p-2 sm:p-3 rounded-lg border border-blue-500/20">
                                <div className="flex items-center gap-2">
                                  <MailIcon className="text-blue-400 w-4 h-4" />
                                  <div className="text-xs text-blue-400">
                                    Invoice can be sent to buyer using the "Send
                                    Invoice" button
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Decision Making Section for Ended Auctions */}
                      {auction.status === "ended" && auction.highestBid && (
                        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-600/10 p-3 sm:p-4 rounded-xl border border-yellow-500/30">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="text-yellow-400 w-4 h-4" />
                                <h4 className="text-sm font-bold text-yellow-400">
                                  Decision Required
                                </h4>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-lg font-bold text-green-400">
                                  ${auction.highestBid.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-dark-400">
                                  Highest bidder:{" "}
                                  {auction.highestBid.bidder?.name}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Button
                                onClick={() =>
                                  handleDecision(auction.id, "accept")
                                }
                                disabled={makeDecision.isPending}
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1.5 h-8"
                                size="sm"
                              >
                                ✓ Accept Bid
                              </Button>

                              <Button
                                onClick={() =>
                                  handleDecision(auction.id, "reject")
                                }
                                disabled={makeDecision.isPending}
                                variant="danger"
                                size="sm"
                                className="text-xs px-2 py-1.5 h-8"
                              >
                                ✕ Reject Bid
                              </Button>

                              <Button
                                onClick={() => toggleCounterInput(auction.id)}
                                disabled={makeDecision.isPending}
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1.5 h-8"
                              >
                                Counter Offer
                              </Button>
                            </div>

                            {/* Counter Offer Input - Compact Version */}
                            {showCounterInput[auction.id] && (
                              <div className="pt-2 border-t border-yellow-500/20">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Counter amount"
                                    value={counterOffers[auction.id] || ""}
                                    onChange={(e) =>
                                      updateCounterOffer(
                                        auction.id,
                                        e.target.value
                                      )
                                    }
                                    variant="glass"
                                    step="0.01"
                                    min="0"
                                    className="text-sm h-8 flex-1"
                                    icon={<DollarSignIcon size="sm" />}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleDecision(auction.id, "counter")
                                      }
                                      disabled={
                                        makeDecision.isPending ||
                                        !counterOffers[auction.id]
                                      }
                                      size="sm"
                                      variant="gradient"
                                      className="text-xs px-3 h-8 whitespace-nowrap"
                                    >
                                      Send
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        toggleCounterInput(auction.id)
                                      }
                                      variant="outline"
                                      size="sm"
                                      className="text-xs px-2 h-8"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Column */}
                    <div className="flex flex-row xl:flex-col gap-2 xl:w-32 xl:justify-start justify-center">
                      <Link to="/auction/$id" params={{ id: auction.id }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full text-xs px-2 py-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </Link>

                      {auction.status === "scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 w-full text-dark-400 text-xs px-2 py-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      )}

                      {auction.status === "sold" && (
                        <Button
                          onClick={() => handleSendInvoice(auction.id)}
                          disabled={sendInvoice.isPending}
                          variant="gradient"
                          size="sm"
                          className="gap-1 w-full text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                        >
                          <MailIcon size="sm" className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {sendInvoice.isPending
                              ? "Sending..."
                              : "Send Invoice"}
                          </span>
                          <span className="sm:hidden">
                            {sendInvoice.isPending ? "..." : "Invoice"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center px-2 sm:px-0">
            <Card
              variant="glass"
              className="max-w-lg w-full text-center backdrop-blur-xl"
            >
              <CardContent className="p-6 sm:p-8 lg:p-12 space-y-4 sm:space-y-6">
                <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                  <HammerIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary-500/50" />
                  <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20" />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-dark-100">
                    No Auctions Yet
                  </h3>
                  <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                    You haven't created any auctions yet. Start by creating your
                    first premium auction and connect with thousands of
                    interested buyers!
                  </p>
                </div>

                <Link to="/sell/new">
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full sm:w-auto gap-2 sm:gap-3 shadow-lg shadow-primary-500/25 text-sm sm:text-base"
                  >
                    <PlusIcon size="sm" />
                    <span className="hidden sm:inline">
                      Create Your First Auction
                    </span>
                    <span className="sm:hidden">Create Auction</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
