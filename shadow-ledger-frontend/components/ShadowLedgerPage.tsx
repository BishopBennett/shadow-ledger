"use client";

// Main page component for Shadow Ledger dApp
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useShadowLedger } from "@/hooks/useShadowLedger";
import { useBillDecryption } from "@/hooks/useBillDecryption";
import { useStatistics } from "@/hooks/useStatistics";
import { BillForm } from "./BillForm";
import { BillList } from "./BillList";
import { StatisticsDashboard } from "./StatisticsDashboard";
import { AnimatedBackground } from "./AnimatedBackground";
import { WelcomePage } from "./WelcomePage";
import { WalletInfo } from "./WalletInfo";
import { NetworkSwitchPrompt } from "./NetworkSwitchPrompt";

export const ShadowLedgerPage = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected && !!chainId,
  });

  const shadowLedger = useShadowLedger({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const billDecryption = useBillDecryption({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    contractAddress: shadowLedger.contractAddress,
    ethersSigner,
  });

  const statistics = useStatistics({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  if (!isConnected) {
    return <WelcomePage onConnect={connect} />;
  }

  if (!chainId) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center relative z-10 max-w-2xl px-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-8 shadow-lg">
            <p className="text-error text-lg mb-4 font-semibold">
              Network Not Detected
            </p>
            <p className="text-textSecondary mb-6">
              Unable to detect the current network. Please ensure:
            </p>
            <ul className="text-left text-textSecondary space-y-2 mb-6">
              <li>• MetaMask is connected and unlocked</li>
              <li>• You are connected to a supported network (Hardhat Localhost or Sepolia)</li>
              <li>• Try refreshing the page</li>
            </ul>
            <p className="text-sm text-textSecondary">
              For dev:mock mode, please switch to Hardhat Localhost (Chain ID: 31337)
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (shadowLedger.isDeployed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center relative z-10 max-w-2xl px-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-8 shadow-lg">
            <p className="text-error text-lg mb-4 font-semibold">
              ShadowLedger Contract Not Found
            </p>
            <p className="text-textSecondary mb-4">
              Contract is not deployed on chainId={chainId}
            </p>
            <p className="text-sm text-textSecondary mb-6">
              {chainId === 31337
                ? "Please ensure the Hardhat node is running and the contract is deployed."
                : "Please switch to a supported network (Hardhat Localhost or Sepolia) or deploy the contract."}
            </p>
            {chainId === 31337 && (
              <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold mb-2">To deploy the contract:</p>
                <ol className="text-sm text-textSecondary space-y-1 list-decimal list-inside">
                  <li>Navigate to <code className="bg-muted px-1 rounded">fhevm-hardhat-template</code></li>
                  <li>Run <code className="bg-muted px-1 rounded">npx hardhat node</code> in one terminal</li>
                  <li>Run <code className="bg-muted px-1 rounded">npx hardhat deploy --network localhost</code> in another terminal</li>
                  <li>Run <code className="bg-muted px-1 rounded">npm run genabi</code> in the frontend directory</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Network Switch Prompt for dev:mock mode */}
        {initialMockChains && Object.keys(initialMockChains).length > 0 && (
          <NetworkSwitchPrompt
            currentChainId={chainId}
            targetChainId={31337}
            targetChainName="Hardhat Localhost"
            rpcUrl={initialMockChains[31337]}
            provider={provider}
          />
        )}

        {/* Wallet Info */}
        <WalletInfo
          account={accounts?.[0]}
          chainId={chainId}
          provider={provider}
        />

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Shadow Ledger</h1>
          <p className="text-textSecondary">Privacy-Preserving Bill Recording</p>
        </header>

        <StatisticsDashboard
          statistics={statistics}
          billCount={shadowLedger.billCount}
          bills={shadowLedger.bills}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <BillForm
            createBill={shadowLedger.createBill}
            canCreateBill={shadowLedger.canCreateBill ?? false}
            isCreating={shadowLedger.isCreating}
            message={shadowLedger.message}
          />

          <BillList
            bills={shadowLedger.bills}
            decryptBill={billDecryption.decryptBill}
            decryptBills={billDecryption.decryptBills}
            decryptedBills={billDecryption.decryptedBills}
            isDecrypting={billDecryption.isDecrypting}
            refreshBills={shadowLedger.refreshBills}
            isRefreshing={shadowLedger.isRefreshing}
          />
        </div>
      </div>
    </div>
  );
};

