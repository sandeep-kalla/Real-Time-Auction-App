import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingState, ErrorState } from "../components/ui/States";
import {
  BellIcon,
  DollarSignIcon,
  FireIcon,
  HammerIcon,
  HeartIcon,
  StarIcon,
  CheckIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../components/ui/Icons";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/api";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: notificationsData, isLoading, error } = useNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);

  const notifications = notificationsData?.notifications || [];

  // Pagination calculations
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Reset to page 1 when notifications change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (isLoading) {
    return <LoadingState>Loading notifications...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load notifications"
        message="Unable to fetch notifications. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_bid":
        return <DollarSignIcon className="text-green-400" />;
      case "outbid":
        return <FireIcon className="text-red-400" />;
      case "auction_ended":
        return <HammerIcon className="text-yellow-400" />;
      case "counter_offer":
        return <StarIcon className="text-blue-400" />;
      case "bid_accepted":
        return <HeartIcon className="text-green-400" />;
      case "bid_rejected":
        return <XIcon className="text-red-400" />;
      default:
        return <BellIcon className="text-primary-400" />;
    }
  };

  const getNotificationBorder = (type: string, read: boolean) => {
    if (read) return "";

    switch (type) {
      case "new_bid":
        return "border-l-4 border-green-500/50";
      case "outbid":
        return "border-l-4 border-red-500/50";
      case "auction_ended":
        return "border-l-4 border-yellow-500/50";
      case "counter_offer":
        return "border-l-4 border-blue-500/50";
      case "bid_accepted":
        return "border-l-4 border-green-500/50";
      case "bid_rejected":
        return "border-l-4 border-red-500/50";
      default:
        return "border-l-4 border-primary-500/50";
    }
  };

  const getNotificationBackground = (type: string, read: boolean) => {
    if (read) return "bg-surface-800/30";

    switch (type) {
      case "new_bid":
        return "bg-gradient-to-r from-green-900/20 to-green-600/10";
      case "outbid":
        return "bg-gradient-to-r from-red-900/20 to-red-600/10";
      case "auction_ended":
        return "bg-gradient-to-r from-yellow-900/20 to-yellow-600/10";
      case "counter_offer":
        return "bg-gradient-to-r from-blue-900/20 to-blue-600/10";
      case "bid_accepted":
        return "bg-gradient-to-r from-green-900/20 to-green-600/10";
      case "bid_rejected":
        return "bg-gradient-to-r from-red-900/20 to-red-600/10";
      default:
        return "bg-gradient-to-r from-primary-900/20 to-primary-600/10";
    }
  };

  const getNotificationMessage = (notification: any) => {
    try {
      const payload = notification.parsedPayload || {};

      switch (notification.type) {
        case "new_bid":
          return `New bid of $${payload.bidAmount} on "${payload.auctionName}" by ${payload.bidderName}`;
        case "outbid":
          return `You've been outbid! New bid: $${payload.newBidAmount} on "${payload.auctionName}"`;
        case "auction_ended":
          return `Auction "${payload.auctionName}" has ended`;
        case "counter_offer":
          return `New counter offer on "${payload.auctionName}"`;
        case "bid_accepted":
          return `Your bid has been accepted for "${payload.auctionName}"`;
        case "bid_rejected":
          return `Your bid has been rejected for "${payload.auctionName}"`;
        default:
          return notification.message || "New notification";
      }
    } catch (error) {
      return "New notification";
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

  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.readAt) {
      try {
        await markNotificationRead.mutateAsync(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    // TODO: Navigate based on notification type and payload
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of notifications
    document.getElementById("notifications-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic for larger page counts
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
                  <BellIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-500" />
                  <div className="absolute inset-0 bg-primary-500 blur-xl opacity-30" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-400 leading-none">
                    Notifications
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-dark-300 mt-1 sm:mt-2 leading-relaxed">
                    Stay updated with your auction activities and real-time
                    alerts
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {notifications.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full" />
                    <span className="text-xs text-dark-300">
                      {notifications.length}{" "}
                      <span className="hidden sm:inline">Total</span>
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-xs text-dark-300">
                        {unreadCount} Unread
                      </span>
                    </div>
                  )}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-800/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-surface-600/30">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-400 rounded-full" />
                      <span className="text-xs text-dark-300">
                        Page {currentPage}/{totalPages}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full lg:w-auto">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  className="w-full lg:w-auto gap-2 shadow-lg text-sm sm:text-base"
                  disabled={markAllNotificationsRead.isPending}
                >
                  <CheckIcon size="sm" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Mark Read</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom -mt-4 sm:-mt-6 lg:-mt-8 pb-8 sm:pb-12 lg:pb-16">
        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
            {/* Pagination Controls - Moved to top */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-surface-800/30 backdrop-blur-sm rounded-lg border border-surface-600/30">
                {/* Results Info */}
                <div className="text-xs sm:text-sm text-dark-400 text-center">
                  <span className="hidden sm:inline">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, notifications.length)} of{" "}
                    {notifications.length} notifications
                  </span>
                  <span className="sm:hidden">
                    {startIndex + 1}-{Math.min(endIndex, notifications.length)}{" "}
                    of {notifications.length}
                  </span>
                </div>

                {/* Mobile-first Pagination */}
                <div className="flex items-center justify-between">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2 sm:px-3 min-w-[70px] justify-center"
                  >
                    <ChevronLeftIcon size="sm" />
                    <span className="text-xs">Prev</span>
                  </Button>

                  {/* Current Page Info - Mobile optimized */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-dark-300 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    {/* Show page numbers only on larger screens */}
                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers()
                        .slice(0, 5)
                        .map((page, index) => (
                          <div key={index}>
                            {page === "..." ? (
                              <span className="px-1 py-1 text-dark-500 text-xs">
                                ...
                              </span>
                            ) : (
                              <Button
                                variant={
                                  currentPage === page ? "primary" : "ghost"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page as number)}
                                className={`min-w-[2rem] h-7 font-semibold text-xs ${
                                  currentPage === page
                                    ? "bg-primary-600 text-white shadow-lg scale-105 transform"
                                    : "text-dark-300 hover:text-dark-100 hover:bg-surface-700/50"
                                }`}
                              >
                                {page}
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-2 sm:px-3 min-w-[70px] justify-center"
                  >
                    <span className="text-xs">Next</span>
                    <ChevronRightIcon size="sm" />
                  </Button>
                </div>
              </div>
            )}

            <div id="notifications-list" className="space-y-2 sm:space-y-3">
              {currentNotifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  variant="glass"
                  className={`cursor-pointer hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-200 backdrop-blur-xl ${getNotificationBackground(notification.type, !!notification.readAt)} ${getNotificationBorder(notification.type, !!notification.readAt)}`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div
                      className="flex items-start gap-3"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon Container - Smaller on mobile */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface-800/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-surface-600/30 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Mobile: Stack everything vertically */}
                        <div className="block sm:hidden">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`text-sm font-semibold ${!notification.readAt ? "text-dark-100" : "text-dark-300"} truncate`}
                            >
                              {notification.type
                                .replace("_", " ")
                                .replace(/\b\w/g, (l: string) =>
                                  l.toUpperCase()
                                )}
                            </h3>
                            {!notification.readAt && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse ml-2 flex-shrink-0"></div>
                            )}
                          </div>
                          <p
                            className={`text-xs leading-relaxed ${!notification.readAt ? "text-dark-200" : "text-dark-400"} line-clamp-2 mb-1`}
                          >
                            {getNotificationMessage(notification)}
                          </p>
                          <span className="text-xs text-dark-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {/* Desktop: Original layout */}
                        <div className="hidden sm:block">
                          <div className="flex justify-between items-center">
                            <h3
                              className={`text-sm font-semibold ${!notification.readAt ? "text-dark-100" : "text-dark-300"}`}
                            >
                              {notification.type
                                .replace("_", " ")
                                .replace(/\b\w/g, (l: string) =>
                                  l.toUpperCase()
                                )}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-dark-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.readAt && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-sm leading-relaxed mt-1 ${!notification.readAt ? "text-dark-200" : "text-dark-400"}`}
                          >
                            {getNotificationMessage(notification)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2 sm:px-0">
            <Card
              variant="glass"
              className="max-w-lg w-full text-center backdrop-blur-xl"
            >
              <CardContent className="p-6 sm:p-8 lg:p-12 space-y-4 sm:space-y-6">
                <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                  <BellIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary-500/50" />
                  <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20" />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-dark-100">
                    All Caught Up!
                  </h3>
                  <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                    You're all up to date. New notifications about your
                    auctions, bids, and activities will appear here.
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
