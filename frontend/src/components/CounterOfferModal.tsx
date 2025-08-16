import { useState } from "react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

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
  } | null;
  onRespond: (id: string, response: "accept" | "reject") => void;
  isLoading?: boolean;
}

export function CounterOfferModal({
  isOpen,
  onClose,
  counterOffer,
  onRespond,
  isLoading = false,
}: CounterOfferModalProps) {
  const [response, setResponse] = useState<"accept" | "reject" | null>(null);

  const handleRespond = () => {
    if (counterOffer && response) {
      onRespond(counterOffer.id, response);
      setResponse(null);
      onClose();
    }
  };

  if (!counterOffer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Counter-Offer Received">
      <div className="space-y-6">
        {/* Counter-offer details */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🔔 Counter-Offer for "{counterOffer.auction.itemName}"
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Item:</strong> {counterOffer.auction.itemName}
            </p>
            <p>
              <strong>Description:</strong> {counterOffer.auction.description}
            </p>
            <p>
              <strong>Seller:</strong> {counterOffer.seller.name}
            </p>
            <p className="text-lg font-bold text-yellow-800">
              <strong>Counter-Offer Amount: ${counterOffer.amount}</strong>
            </p>
          </div>
        </div>

        {/* Response options */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">
            How would you like to respond?
          </h4>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50 border-green-200">
              <input
                type="radio"
                name="response"
                value="accept"
                checked={response === "accept"}
                onChange={(e) => setResponse(e.target.value as "accept")}
                className="text-green-600"
              />
              <div>
                <div className="font-semibold text-green-700">
                  ✅ Accept Counter-Offer
                </div>
                <div className="text-sm text-green-600">
                  Agree to purchase at ${counterOffer.amount}
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-red-50 border-red-200">
              <input
                type="radio"
                name="response"
                value="reject"
                checked={response === "reject"}
                onChange={(e) => setResponse(e.target.value as "reject")}
                className="text-red-600"
              />
              <div>
                <div className="font-semibold text-red-700">
                  ❌ Reject Counter-Offer
                </div>
                <div className="text-sm text-red-600">
                  Decline the counter-offer and end negotiations
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRespond}
            disabled={!response || isLoading}
            variant={
              response === "accept"
                ? "primary"
                : response === "reject"
                  ? "danger"
                  : "primary"
            }
          >
            {isLoading
              ? "Responding..."
              : response === "accept"
                ? "Accept Offer"
                : response === "reject"
                  ? "Reject Offer"
                  : "Select Response"}
          </Button>
        </div>

        {/* Important note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>⚠️ Important:</strong> This decision is final. If you
            accept, you agree to purchase the item at the counter-offer price.
            If you reject, the negotiation will end and no sale will occur.
          </p>
        </div>
      </div>
    </Modal>
  );
}
