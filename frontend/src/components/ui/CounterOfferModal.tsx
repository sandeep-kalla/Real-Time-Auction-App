import { useState } from "react";
import { Button } from "./Button";

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  counterOffer: {
    id: string;
    amount: number;
    auction: {
      itemName: string;
      description: string;
    };
    seller: {
      name: string;
    };
  };
  onRespond: (id: string, response: "accept" | "reject") => Promise<void>;
  isLoading?: boolean;
}

export function CounterOfferModal({
  isOpen,
  onClose,
  counterOffer,
  onRespond,
  isLoading = false,
}: CounterOfferModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleResponse = async (response: "accept" | "reject") => {
    try {
      setIsProcessing(true);
      await onRespond(counterOffer.id, response);
      onClose();
    } catch (error) {
      console.error("Failed to respond to counter-offer:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Counter-Offer Received
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            You have received a counter-offer from the seller
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                {counterOffer.auction.itemName}
              </h3>
              <p className="text-sm text-gray-600">
                {counterOffer.auction.description}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Seller's Counter-Offer:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${counterOffer.amount}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From: {counterOffer.seller.name}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Important
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to decide whether to accept or reject this
                    counter-offer. If you accept, you agree to purchase the item
                    at this price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isProcessing || isLoading}
          >
            Decide Later
          </Button>
          <Button
            onClick={() => handleResponse("reject")}
            variant="danger"
            disabled={isProcessing || isLoading}
          >
            {isProcessing ? "Processing..." : "Reject"}
          </Button>
          <Button
            onClick={() => handleResponse("accept")}
            disabled={isProcessing || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "Processing..." : "Accept & Buy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
