import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  HammerIcon,
  DollarSignIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  FireIcon,
} from "../../components/ui/Icons";
import { useState } from "react";
import { useCreateAuction } from "../../hooks/api";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/sell/new")({
  component: CreateAuctionPage,
});

function CreateAuctionPage() {
  const navigate = useNavigate();
  const createAuctionMutation = useCreateAuction();

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    startPrice: "",
    bidIncrement: "",
    goLiveDate: "",
    goLiveTime: "",
    durationMins: "120", // default 2 hours
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      newErrors.startPrice = "Starting price must be greater than 0";
    }
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
      newErrors.bidIncrement = "Bid increment must be greater than 0";
    }
    if (!formData.goLiveDate) newErrors.goLiveDate = "Go-live date is required";
    if (!formData.goLiveTime) newErrors.goLiveTime = "Go-live time is required";
    if (!formData.durationMins || parseInt(formData.durationMins) <= 0) {
      newErrors.durationMins = "Duration must be greater than 0";
    }

    // Check if go-live date/time is in the future
    if (formData.goLiveDate && formData.goLiveTime) {
      const goLiveDateTime = new Date(
        `${formData.goLiveDate}T${formData.goLiveTime}`
      );
      if (goLiveDateTime <= new Date()) {
        newErrors.goLiveDate = "Go-live date and time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Convert form data to API format
      const auctionData = {
        itemName: formData.itemName,
        description: formData.description,
        startPrice: parseFloat(formData.startPrice),
        bidIncrement: parseFloat(formData.bidIncrement),
        goLiveAt: new Date(
          `${formData.goLiveDate}T${formData.goLiveTime}`
        ).toISOString(),
        durationMins: parseInt(formData.durationMins),
      };

      await createAuctionMutation.mutateAsync(auctionData);

      // Navigate to seller dashboard on success
      navigate({ to: "/sell/mine" });
    } catch (error) {
      console.error("Failed to create auction:", error);
      // Error is already handled by the mutation hook with toast
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900/20 via-primary-600/10 to-transparent pb-8 sm:pb-12 lg:pb-16">
        <div className="absolute inset-0 bg-grid-primary/5" />
        <div className="container-custom relative pt-4 sm:pt-6 lg:pt-8">
          {/* Back Navigation */}
          <div className="mb-6 sm:mb-8">
            <Link to="/sell/mine">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-dark-400 hover:text-primary-400"
              >
                <ArrowLeftIcon size="sm" />
                <span className="hidden sm:inline">Back to My Auctions</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <div className="flex justify-center">
              <div className="relative">
                <HammerIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500" />
                <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-30" />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-400">
                Create New Auction
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed">
                List your premium item and start receiving bids from thousands
                of interested buyers worldwide.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-400">
                  1000+
                </div>
                <div className="text-xs sm:text-sm text-dark-500">
                  Active Bidders
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
                  $2.5M+
                </div>
                <div className="text-xs sm:text-sm text-dark-500">
                  Total Sales
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">
                  4.9★
                </div>
                <div className="text-xs sm:text-sm text-dark-500">
                  Platform Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container-custom -mt-4 sm:-mt-6 lg:-mt-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <Card variant="glass" className="backdrop-blur-xl">
            <CardHeader className="text-center pb-6 sm:pb-8">
              <CardTitle className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl">
                <FireIcon className="text-primary-500 w-5 h-5 sm:w-6 sm:h-6" />
                Auction Details
              </CardTitle>
              <p className="text-dark-400 mt-2 text-sm sm:text-base">
                Fill in the details to create your premium auction listing
              </p>
            </CardHeader>

            <CardContent className="space-y-6 sm:space-y-8 mobile-form-spacing">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Item Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-surface-700">
                    <StarIcon className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <h3 className="text-base sm:text-lg font-semibold text-dark-100">
                      Item Information
                    </h3>
                  </div>

                  <Input
                    label="Item Name"
                    placeholder="Enter the name of your premium item"
                    value={formData.itemName}
                    onChange={(e) =>
                      handleInputChange("itemName", e.target.value)
                    }
                    error={errors.itemName}
                    variant="glass"
                    icon={
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    }
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-300">
                      Description *
                    </label>
                    <textarea
                      className="block w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-800/50 border border-surface-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm text-dark-100 placeholder-dark-500 resize-none text-sm sm:text-base"
                      rows={4}
                      placeholder="Describe your item in detail - highlight its unique features, condition, and any special characteristics that make it valuable..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                    {errors.description && (
                      <p className="text-xs sm:text-sm text-red-400">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-surface-700">
                    <DollarSignIcon className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <h3 className="text-base sm:text-lg font-semibold text-dark-100">
                      Pricing Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Input
                      label="Starting Price ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.startPrice}
                      onChange={(e) =>
                        handleInputChange("startPrice", e.target.value)
                      }
                      error={errors.startPrice}
                      variant="glass"
                      icon={<DollarSignIcon size="sm" />}
                    />

                    <Input
                      label="Bid Increment ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.bidIncrement}
                      onChange={(e) =>
                        handleInputChange("bidIncrement", e.target.value)
                      }
                      error={errors.bidIncrement}
                      variant="glass"
                      icon={<DollarSignIcon size="sm" />}
                    />
                  </div>
                </div>

                {/* Timing Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-surface-700">
                    <CalendarIcon className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <h3 className="text-base sm:text-lg font-semibold text-dark-100">
                      Timing Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Input
                      label="Go-Live Date"
                      type="date"
                      value={formData.goLiveDate}
                      onChange={(e) =>
                        handleInputChange("goLiveDate", e.target.value)
                      }
                      error={errors.goLiveDate}
                      variant="glass"
                      icon={<CalendarIcon size="sm" />}
                    />

                    <Input
                      label="Go-Live Time"
                      type="time"
                      value={formData.goLiveTime}
                      onChange={(e) =>
                        handleInputChange("goLiveTime", e.target.value)
                      }
                      error={errors.goLiveTime}
                      variant="glass"
                      icon={<ClockIcon size="sm" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2 sm:mb-3">
                      Auction Duration *
                    </label>
                    <select
                      className="block w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-800/50 border border-surface-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm text-dark-100 text-sm sm:text-base"
                      value={formData.durationMins}
                      onChange={(e) =>
                        handleInputChange("durationMins", e.target.value)
                      }
                    >
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours</option>
                      <option value="180">3 Hours</option>
                      <option value="240">4 Hours</option>
                      <option value="360">6 Hours</option>
                      <option value="480">8 Hours</option>
                      <option value="720">12 Hours</option>
                      <option value="1440">24 Hours</option>
                    </select>
                    {errors.durationMins && (
                      <p className="text-xs sm:text-sm text-red-400 mt-2">
                        {errors.durationMins}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bidding Rules */}
                <div className="bg-gradient-to-r from-primary-900/20 to-primary-600/10 p-4 sm:p-6 rounded-2xl border border-primary-500/20">
                  <h4 className="text-base sm:text-lg font-semibold text-primary-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <HammerIcon size="sm" className="w-4 h-4 sm:w-5 sm:h-5" />
                    Auction Guidelines
                  </h4>
                  <ul className="text-xs sm:text-sm text-dark-300 space-y-2 sm:space-y-3">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                      <span>
                        Each bid must be at least the current highest bid plus
                        your increment
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                      <span>
                        Time zone: All times are displayed in your local
                        timezone (IST) but stored as UTC
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                      <span>
                        Once the auction goes live, you cannot modify these
                        details
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                      <span>
                        You'll be notified when the auction ends and can
                        accept/reject the highest bid
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="flex-1 gap-2 h-12 sm:h-auto text-sm sm:text-base"
                    isLoading={createAuctionMutation.isPending}
                  >
                    <FireIcon size="sm" className="w-4 h-4" />
                    {createAuctionMutation.isPending
                      ? "Creating..."
                      : "Create Auction"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 h-12 sm:h-auto text-sm sm:text-base"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Save as Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
