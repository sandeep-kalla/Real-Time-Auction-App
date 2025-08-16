import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { HammerIcon, AlertTriangleIcon } from "./Icons";

interface EndAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  auctionName: string;
  currentBid?: number;
}

export function EndAuctionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  auctionName,
  currentBid,
}: EndAuctionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangleIcon className="w-8 h-8 text-red-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-dark-100 mb-2">
          End Auction Confirmation
        </h3>

        {/* Description */}
        <div className="text-dark-400 mb-6 space-y-3">
          <p>
            Are you sure you want to end the auction for{" "}
            <span className="text-primary-400 font-semibold">
              "{auctionName}"
            </span>
            ?
          </p>

          {currentBid && currentBid > 0 ? (
            <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HammerIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm text-dark-300">
                  Current Highest Bid
                </span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${currentBid.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
              <div className="text-sm text-dark-300 mb-1">Current Status</div>
              <div className="text-lg font-semibold text-yellow-400">
                No bids placed
              </div>
            </div>
          )}

          <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            ⚠️ This action cannot be undone. The auction will end immediately.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ending...
              </div>
            ) : (
              "End Auction"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
