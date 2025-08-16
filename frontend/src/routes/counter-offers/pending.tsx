import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingState, ErrorState } from "../../components/ui/States";
import {
  StarIcon,
  DollarSignIcon,
  ClockIcon,
  XIcon,
  UserIcon,
  HammerIcon,
  CheckIcon,
} from "../../components/ui/Icons";
import {
  usePendingCounterOffers,
  useRespondToCounterOffer,
} from "../../hooks/api";
import { useState } from "react";

export const Route = createFileRoute("/counter-offers/pending")({
  component: PendingCounterOffersPage,
});

function PendingCounterOffersPage() {
  const {
    data: counterOffersData,
    isLoading,
    error,
  } = usePendingCounterOffers();
  const respondToCounterOffer = useRespondToCounterOffer();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState>Loading counter-offers...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load counter-offers"
        message="Unable to fetch counter-offers. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const pendingAsAuyer = counterOffersData?.asBuyer || [];

  const handleResponse = async (
    counterOfferId: string,
    response: "accept" | "reject"
  ) => {
    try {
      setProcessingId(counterOfferId);
      await respondToCounterOffer.mutateAsync({ id: counterOfferId, response });
    } catch (error) {
      console.error("Failed to respond to counter-offer:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900/20 via-primary-600/10 to-transparent pb-12">
        <div className="absolute inset-0 bg-grid-primary/5" />
        <div className="container-custom relative pt-6">
          {/* Hero Section */}
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <StarIcon className="w-10 h-10 text-primary-500" />
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-30" />
                {pendingAsAuyer.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {pendingAsAuyer.length > 9 ? "9+" : pendingAsAuyer.length}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-400 leading-none">
                  Counter-Offers
                </h1>
                <p className="text-sm text-dark-300 mt-1 leading-relaxed">
                  Review and respond to seller counter-offers
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {pendingAsAuyer.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-surface-800/30 backdrop-blur-sm rounded-md px-2 py-1 border border-surface-600/30">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-xs text-dark-300 whitespace-nowrap">
                    {pendingAsAuyer.length} Pending
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-800/30 backdrop-blur-sm rounded-md px-2 py-1 border border-surface-600/30">
                  <ClockIcon size="sm" className="text-blue-400 w-3 h-3" />
                  <span className="text-xs text-dark-300 whitespace-nowrap">
                    Awaiting Decision
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom -mt-6 pb-16">
        {/* Counter-offers List */}
        {pendingAsAuyer.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {pendingAsAuyer.map((counterOffer: any) => (
              <Card
                key={counterOffer.id}
                variant="glass"
                className="backdrop-blur-xl hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 bg-gradient-to-r from-yellow-900/20 to-orange-600/10 border-l-4 border-yellow-500/50"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <HammerIcon
                          className="text-primary-500 flex-shrink-0"
                          size="sm"
                        />
                        <CardTitle className="text-base text-dark-100 line-clamp-1">
                          {counterOffer.auction.itemName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-dark-400">
                        <UserIcon size="sm" className="flex-shrink-0 w-3 h-3" />
                        <span className="text-xs line-clamp-1">
                          Counter-offer from {counterOffer.seller.name}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 px-2 py-0.5 text-xs flex-shrink-0">
                      <ClockIcon size="sm" className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-1">
                  {/* Offer Details */}
                  <div className="bg-surface-800/30 backdrop-blur-sm p-3 rounded-lg border border-surface-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSignIcon className="text-green-400" size="sm" />
                      <h4 className="text-sm font-semibold text-dark-100">
                        Counter-Offer Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-dark-500 uppercase tracking-wide mb-0.5">
                          Amount
                        </div>
                        <div className="text-xl font-bold text-green-400">
                          ${counterOffer.amount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-dark-500 uppercase tracking-wide mb-0.5">
                          Received
                        </div>
                        <div className="text-sm font-medium text-dark-200">
                          {formatTimeAgo(counterOffer.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Section */}
                  <div className="bg-gradient-to-r from-blue-900/20 to-blue-600/10 p-3 rounded-lg border border-blue-500/30">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <StarIcon className="text-blue-400" size="sm" />
                        <h4 className="text-sm font-semibold text-blue-400">
                          What would you like to do?
                        </h4>
                      </div>

                      <p className="text-dark-300 text-xs leading-relaxed">
                        The seller has made a counter-offer of{" "}
                        <span className="font-bold text-green-400">
                          ${counterOffer.amount.toLocaleString()}
                        </span>
                        . You can accept this offer to proceed with the
                        purchase, or reject it to end the negotiation.
                      </p>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() =>
                            handleResponse(counterOffer.id, "accept")
                          }
                          disabled={processingId === counterOffer.id}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-xs"
                        >
                          {processingId === counterOffer.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckIcon size="sm" className="w-3 h-3" />
                              Accept Offer
                            </>
                          )}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleResponse(counterOffer.id, "reject")
                          }
                          disabled={processingId === counterOffer.id}
                          className="flex-1 gap-2 text-xs"
                        >
                          {processingId === counterOffer.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <XIcon size="sm" className="w-3 h-3" />
                              Reject Offer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <Card
              variant="glass"
              className="max-w-md w-full text-center backdrop-blur-xl"
            >
              <CardContent className="p-8 space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <StarIcon className="w-16 h-16 text-primary-500/50" />
                  <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-dark-100">
                    No Pending Counter-Offers
                  </h3>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    You don't have any counter-offers waiting for your response.
                    When sellers make counter-offers on your bids, they'll
                    appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
