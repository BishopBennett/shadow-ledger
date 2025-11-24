"use client";

import { useEffect, useState } from "react";

interface NetworkSwitchPromptProps {
  currentChainId: number | undefined;
  targetChainId: number;
  targetChainName: string;
  rpcUrl?: string;
  provider: any;
}

export const NetworkSwitchPrompt = ({
  currentChainId,
  targetChainId,
  targetChainName,
  rpcUrl,
  provider,
}: NetworkSwitchPromptProps) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const switchNetwork = async () => {
    if (!provider || !rpcUrl) return;

    setIsSwitching(true);
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: targetChainName,
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      } else {
        console.error("Failed to switch network:", switchError);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (currentChainId === targetChainId) {
    return null;
  }

  return (
    <div className="bg-warning/20 border border-warning/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-warning mb-1">Wrong Network</p>
          <p className="text-sm text-textSecondary">
            Please switch to {targetChainName} (Chain ID: {targetChainId})
          </p>
        </div>
        <button
          onClick={switchNetwork}
          disabled={isSwitching}
          className="px-4 py-2 bg-warning text-white rounded-lg font-semibold hover:bg-warning/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwitching ? "Switching..." : "Switch Network"}
        </button>
      </div>
    </div>
  );
};


