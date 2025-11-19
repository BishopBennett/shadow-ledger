"use client";

// Custom hook for ShadowLedger contract interactions

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ShadowLedgerAddresses } from "@/abi/ShadowLedgerAddresses";
import { ShadowLedgerABI } from "@/abi/ShadowLedgerABI";

export type BillMeta = {
  category: string;
  description: string;
  timestamp: bigint;
};

export type Bill = {
  index: number;
  amountHandle: string;
  meta: BillMeta;
};

function getShadowLedgerByChainId(
  chainId: number | undefined
): { abi: typeof ShadowLedgerABI.abi; address?: `0x${string}`; chainId?: number; chainName?: string } {
  if (!chainId) {
    return { abi: ShadowLedgerABI.abi };
  }

  const entry =
    ShadowLedgerAddresses[chainId.toString() as keyof typeof ShadowLedgerAddresses];

  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: ShadowLedgerABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: ShadowLedgerABI.abi,
  };
}

export const useShadowLedger = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [bills, setBills] = useState<Bill[]>([]);
  const [billCount, setBillCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const shadowLedgerRef = useRef<{ abi: typeof ShadowLedgerABI.abi; address?: `0x${string}`; chainId?: number } | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isCreatingRef = useRef<boolean>(isCreating);

  const shadowLedger = useMemo(() => {
    const c = getShadowLedgerByChainId(chainId);
    shadowLedgerRef.current = c;
    if (!chainId) {
      setMessage(``);
    } else if (!c.address) {
      setMessage(`ShadowLedger deployment not found for chainId=${chainId}.`);
    } else {
      setMessage(``);
    }
    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!shadowLedger) {
      return undefined;
    }
    return Boolean(shadowLedger.address) && shadowLedger.address !== ethers.ZeroAddress;
  }, [shadowLedger]);

  const canGetBills = useMemo(() => {
    return shadowLedger.address && ethersReadonlyProvider && !isRefreshing;
  }, [shadowLedger.address, ethersReadonlyProvider, isRefreshing]);

  const refreshBills = useCallback(() => {
    if (isRefreshingRef.current) {
      return;
    }

    if (
      !shadowLedgerRef.current ||
      !shadowLedgerRef.current?.chainId ||
      !shadowLedgerRef.current?.address ||
      !ethersReadonlyProvider ||
      !ethersSigner
    ) {
      setBills([]);
      setBillCount(0);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = shadowLedgerRef.current.chainId;
    const thisShadowLedgerAddress = shadowLedgerRef.current.address;
    const thisUserAddress = ethersSigner.address;

    const thisShadowLedgerContract = new ethers.Contract(
      thisShadowLedgerAddress,
      shadowLedgerRef.current.abi,
      ethersReadonlyProvider
    );

    thisShadowLedgerContract
      .getBillCount(thisUserAddress)
      .then(async (count: bigint) => {
        const countNum = Number(count);
        setBillCount(countNum);

        if (countNum === 0) {
          setBills([]);
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          return;
        }

        const billPromises: Promise<Bill>[] = [];
        for (let i = 0; i < countNum; i++) {
          billPromises.push(
            Promise.all([
              thisShadowLedgerContract.getBill(thisUserAddress, i),
              thisShadowLedgerContract.getBillMeta(thisUserAddress, i),
            ]).then(([amountHandle, meta]: [string, BillMeta]) => ({
              index: i,
              amountHandle,
              meta,
            }))
          );
        }

        const billsList = await Promise.all(billPromises);

        if (
          sameChain.current(thisChainId) &&
          thisShadowLedgerAddress === shadowLedgerRef.current?.address
        ) {
          setBills(billsList);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e: Error) => {
        setMessage("ShadowLedger.getBillCount() call failed! error=" + e);
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner, sameChain]);

  useEffect(() => {
    refreshBills();
  }, [refreshBills]);

  const canCreateBill = useMemo(() => {
    return (
      shadowLedger.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isCreating
    );
  }, [shadowLedger.address, instance, ethersSigner, isRefreshing, isCreating]);

  const createBill = useCallback(
    (amount: number, category: string, description: string) => {
      if (isRefreshingRef.current || isCreatingRef.current) {
        return;
      }

      if (!shadowLedger.address || !instance || !ethersSigner || amount <= 0) {
        return;
      }

      const thisChainId = chainId;
      const thisShadowLedgerAddress = shadowLedger.address;
      const thisEthersSigner = ethersSigner;
      const thisShadowLedgerContract = new ethers.Contract(
        thisShadowLedgerAddress,
        shadowLedger.abi,
        thisEthersSigner
      );

      isCreatingRef.current = true;
      setIsCreating(true);
      setMessage(`Start creating bill...`);

      const run = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisShadowLedgerAddress !== shadowLedgerRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          // Convert amount to cents (multiply by 100) to handle decimals
          // FHEVM euint64 only supports integers
          const amountInCents = Math.round(amount * 100);
          if (amountInCents <= 0 || amountInCents > Number.MAX_SAFE_INTEGER) {
            setMessage(`Invalid amount: ${amount}. Amount must be between 0.01 and ${Number.MAX_SAFE_INTEGER / 100}`);
            isCreatingRef.current = false;
            setIsCreating(false);
            return;
          }

          const input = instance.createEncryptedInput(
            thisShadowLedgerAddress,
            thisEthersSigner.address
          );
          input.add64(amountInCents);

          const enc = await input.encrypt();

          if (isStale()) {
            setMessage(`Ignore createBill`);
            return;
          }

          setMessage(`Call createBill...`);

          const tx: ethers.TransactionResponse = await thisShadowLedgerContract.createBill(
            enc.handles[0],
            enc.inputProof,
            category,
            description
          );

          setMessage(`Wait for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Call createBill completed status=${receipt?.status}`);

          if (isStale()) {
            setMessage(`Ignore createBill`);
            return;
          }

          refreshBills();
        } catch (e) {
          setMessage(`createBill Failed! ${e}`);
        } finally {
          isCreatingRef.current = false;
          setIsCreating(false);
        }
      };

      run();
    },
    [
      ethersSigner,
      shadowLedger.address,
      shadowLedger.abi,
      instance,
      chainId,
      refreshBills,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: shadowLedger.address,
    canGetBills,
    canCreateBill,
    createBill,
    refreshBills,
    bills,
    billCount,
    isRefreshing,
    isCreating,
    isDeployed,
    message,
  };
};


