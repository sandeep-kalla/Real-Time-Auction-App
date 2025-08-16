import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Timer } from "../components/ui/Timer";
import { LoadingState, ErrorState } from "../components/ui/States";
import {
  HammerIcon,
  TimerIcon,
  TrendingUpIcon,
  DollarSignIcon,
  FireIcon,
  StarIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  GridIcon,
  LiveIcon,
  HeartIcon,
} from "../components/ui/Icons";
import { useAuctions } from "../hooks/api";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [filters, setFilters] = useState({
    status: "all", // Changed to "all" as default
    search: "",
    page: 1,
    limit: 10,
  });

  const { data: auctionsData, isLoading, error } = useAuctions(filters);
  const auctions = auctionsData?.auctions || [];

  // Handle loading state
  if (isLoading) {
    return <LoadingState>Loading auctions...</LoadingState>;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load auctions"
        message="Unable to fetch auctions. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="warning" glow className="gap-1">
            <CalendarIcon size="sm" />
            Scheduled
          </Badge>
        );
      case "live":
        return (
          <Badge variant="live" glow className="gap-1">
            <LiveIcon size="sm" />
            Live
          </Badge>
        );
      case "ended":
        return (
          <Badge variant="ended" className="gap-1">
            <ClockIcon size="sm" />
            Ended
          </Badge>
        );
      case "sold":
        return (
          <Badge variant="success" glow className="gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Sold
          </Badge>
        );
      case "closed_no_winner":
        return (
          <Badge variant="default" className="gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            No Winner
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const calculateEndTime = (auction: any) => {
    const startTime = new Date(auction.goLiveAt);
    return new Date(
      startTime.getTime() + auction.durationMins * 60 * 1000
    ).toISOString();
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/600')] bg-cover bg-center opacity-20" />

        <div className="relative px-8 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium">
              <FireIcon size="sm" className="text-orange-400" />
              Premium Live Auctions
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Discover Rare
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                Treasures
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Join the world's most exclusive auction platform. Bid on
              extraordinary items with real-time excitement.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
              <Button
                variant="gradient"
                size="xl"
                className="group w-full sm:w-auto flex-shrink-0"
              >
                <HammerIcon className="group-hover:rotate-12 transition-transform" />
                Start Bidding Now
                <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 w-full sm:w-auto flex-shrink-0"
              >
                <TimerIcon />
                Browse Auctions
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-purple-200 text-sm">Active Bidders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$2M+</div>
                <div className="text-purple-200 text-sm">Items Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-purple-200 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="space-y-8 px-4 lg:px-6 xl:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">
              Live Auctions
            </h2>
            <p className="text-dark-400 text-lg max-w-lg">
              Discover amazing items up for bidding right now. Join thousands of
              bidders in real-time auctions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            {[
              { key: "all", label: "All", icon: GridIcon },
              { key: "scheduled", label: "Scheduled", icon: CalendarIcon },
              { key: "live", label: "Live", icon: LiveIcon },
              { key: "ended", label: "Ended", icon: ClockIcon },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={filters.status === filter.key ? "gradient" : "ghost"}
                size="md"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, status: filter.key }))
                }
                className={`gap-2 flex-shrink-0 transition-all duration-300 ${
                  filters.status === filter.key
                    ? "shadow-glow scale-105 ring-2 ring-primary-500/50"
                    : "hover:scale-105 hover:bg-surface-800/50 hover:text-primary-400"
                }`}
              >
                <filter.icon size="sm" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Auction Grid */}
      <section className="px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {auctions.map((auction) => (
            <Card
              key={auction.id}
              variant="elevated"
              className="group relative"
              hover={true}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <CardTitle
                    gradient
                    className="group-hover:scale-105 transition-transform text-lg flex-1"
                  >
                    {auction.itemName}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(auction.status)}
                    <button className="p-1.5 bg-surface-800/50 backdrop-blur-sm rounded-lg hover:bg-surface-700/50 transition-colors">
                      <HeartIcon
                        size="sm"
                        className="text-dark-400 hover:text-primary-400"
                      />
                    </button>
                  </div>
                </div>

                <p className="text-dark-400 text-sm line-clamp-2">
                  {auction.description}
                </p>

                {auction.status === "live" && (
                  <div className="mt-3">
                    <Timer
                      endTime={calculateEndTime(auction)}
                      variant="compact"
                      className="justify-center bg-primary-500/10 border border-primary-500/20 rounded-lg p-2"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4 py-3">
                {/* Price Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2.5 bg-surface-900 rounded-lg">
                    <span className="text-dark-400 text-sm flex items-center gap-2">
                      <DollarSignIcon size="sm" />
                      Starting Price
                    </span>
                    <span className="font-bold text-primary-400 text-sm">
                      {formatPrice(auction.startPrice)}
                    </span>
                  </div>

                  {auction.highestBid && (
                    <div className="flex justify-between items-center p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <span className="text-green-400 text-sm flex items-center gap-2">
                        <TrendingUpIcon size="sm" />
                        Current Bid
                      </span>
                      <span className="font-bold text-green-400">
                        {formatPrice(auction.highestBid.amount)}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col gap-1 p-2 bg-surface-900/50 rounded">
                      <span className="text-dark-500">Bid Increment</span>
                      <span className="font-semibold text-dark-200">
                        {formatPrice(auction.bidIncrement)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 p-2 bg-surface-900/50 rounded">
                      <span className="text-dark-500">Duration</span>
                      <span className="font-semibold text-dark-200">
                        {auction.durationMins} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auction Meta */}
                <div className="space-y-2 pt-2 border-t border-surface-700">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-400">
                      {auction.status === "scheduled" ? "Starts" : "Started"}
                    </span>
                    <span className="text-dark-200 font-medium">
                      {formatTime(auction.goLiveAt)}
                    </span>
                  </div>

                  {auction.seller && (
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400 text-xs">Seller</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <UserIcon size="sm" className="text-primary-400" />
                        </div>
                        <span className="text-dark-200 font-medium text-xs">
                          {auction.seller.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <Link
                  to="/auction/$id"
                  params={{ id: auction.id }}
                  className="w-full"
                >
                  <Button
                    className="w-full group/btn"
                    variant={auction.status === "live" ? "gradient" : "outline"}
                    size="md"
                  >
                    {auction.status === "live" ? (
                      <>
                        <LiveIcon className="group-hover/btn:scale-110 transition-transform" />
                        Join Live Auction
                        <ArrowRightIcon className="group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        View Details
                        <ArrowRightIcon className="group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {auctions.length === 0 && !isLoading && (
        <section className="py-16">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-primary-500/20 rounded-full flex items-center justify-center">
                <HammerIcon className="w-12 h-12 text-primary-500" />
              </div>
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-dark-100">
                No auctions found
              </h3>
              <p className="text-dark-400 leading-relaxed">
                Be the first to create an auction and start the excitement!
              </p>
            </div>

            <Button variant="gradient" size="lg" className="gap-3">
              <HammerIcon />
              Create First Auction
              <ArrowRightIcon />
            </Button>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {auctions.length > 0 && (
        <section className="py-16">
          <Card
            variant="elevated"
            className="text-center relative overflow-hidden"
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-primary-700/10 to-primary-800/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900/50 to-transparent" />

            <CardContent className="py-16 relative z-10">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-bold text-gradient">
                    Ready to Start Your Auction Journey?
                  </h3>
                  <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Join thousands of satisfied buyers and sellers in our
                    premium auction community. Start bidding or selling today!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth/register" className="cursor-pointer">
                    <Button
                      variant="gradient"
                      size="lg"
                      className="cursor-pointer group/cta min-w-[180px]"
                    >
                      <StarIcon className="group-hover/cta:scale-110 transition-transform" />
                      Sign Up Free
                      <ArrowRightIcon className="group-hover/cta:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/sell/new" className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="lg"
                      className="cursor-pointer group/cta min-w-[180px] border-primary-500/30 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400"
                    >
                      <HammerIcon className="group-hover/cta:rotate-12 transition-transform" />
                      Start Selling
                      <ArrowRightIcon className="group-hover/cta:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-8 pt-6 text-sm text-dark-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Auctions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span>Secure Bidding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Premium Items</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
