"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface WalletInfoProps {
  account: string | undefined;
  chainId: number | undefined;
  provider: ethers.Eip1193Provider | undefined;
  onDisconnect?: () => void;
}

export const WalletInfo = ({ account, chainId, provider, onDisconnect }: WalletInfoProps) => {
  const [balance, setBalance] = useState<string>("0");
  const [networkName, setNetworkName] = useState<string>("");

  useEffect(() => {
    if (!account || !provider || !chainId) {
      setBalance("0");
      return;
    }

    // Get network name
    const chainNames: Record<number, string> = {
      1: "Ethereum Mainnet",
      11155111: "Sepolia",
      31337: "Hardhat Localhost",
    };
    setNetworkName(chainNames[chainId] || `Chain ${chainId}`);

    // Get balance
    const fetchBalance = async () => {
      try {
        const bp = new ethers.BrowserProvider(provider);
        const balance = await bp.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("0");
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [account, provider, chainId]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num < 0.001) return num.toExponential(2);
    return num.toFixed(4);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Account Info */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-textSecondary">Connected</p>
              <p className="font-mono text-sm font-semibold">{formatAddress(account)}</p>
            </div>
          </div>

          {/* Network Info */}
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-border hidden md:block"></div>
            <div>
              <p className="text-sm text-textSecondary">Network</p>
              <p className="text-sm font-semibold">{networkName}</p>
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-border hidden md:block"></div>
            <div>
              <p className="text-sm text-textSecondary">Balance</p>
              <p className="text-sm font-semibold">{formatBalance(balance)} ETH</p>
            </div>
          </div>
        </div>

        {/* Disconnect Button */}
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm bg-secondary/20 hover:bg-secondary/30 text-secondary rounded-lg transition-colors border border-secondary/30"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

