"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ShadowLedgerAddresses } from "@/abi/ShadowLedgerAddresses";
import { ShadowLedgerABI } from "@/abi/ShadowLedgerABI";

function getShadowLedgerByChainId(chainId: number | undefined) {
  if (!chainId) {
    return { abi: ShadowLedgerABI.abi };
  }
  const entry = ShadowLedgerAddresses[chainId.toString() as keyof typeof ShadowLedgerAddresses];
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

export const useStatistics = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  } = parameters;

  const [totalAmountHandle, setTotalAmountHandle] = useState<string | undefined>(undefined);
  const [categoryTotals, setCategoryTotals] = useState<Map<string, string>>(new Map());
  const [decryptedTotal, setDecryptedTotal] = useState<bigint | undefined>(undefined);
  const [decryptedCategoryTotals, setDecryptedCategoryTotals] = useState<Map<string, bigint>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  
  // Use refs to prevent infinite loops
  const isLoadingRef = useRef<boolean>(false);
  const decryptedTotalRef = useRef<bigint | undefined>(undefined);
  const decryptedCategoryTotalsRef = useRef<Map<string, bigint>>(new Map());
  const loadingCategoriesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  
  useEffect(() => {
    decryptedTotalRef.current = decryptedTotal;
  }, [decryptedTotal]);
  
  useEffect(() => {
    decryptedCategoryTotalsRef.current = decryptedCategoryTotals;
  }, [decryptedCategoryTotals]);

  const shadowLedger = useMemo(() => getShadowLedgerByChainId(chainId), [chainId]);

  const getTotalAmount = useCallback(async () => {
    if (!shadowLedger.address || !ethersReadonlyProvider || !ethersSigner) {
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        shadowLedger.address,
        shadowLedger.abi,
        ethersReadonlyProvider
      );
      const handle = await contract.getTotalAmount(ethersSigner.address);
      setTotalAmountHandle(handle);
    } catch (e) {
      console.error("Failed to get total amount:", e);
    } finally {
      setIsLoading(false);
    }
  }, [shadowLedger.address, shadowLedger.abi, ethersReadonlyProvider, ethersSigner]);

  const decryptTotalAmount = useCallback(async () => {
    if (!totalAmountHandle || !instance || !shadowLedger.address || !ethersSigner) {
      return;
    }

    // Prevent duplicate calls
    if (decryptedTotalRef.current !== undefined || isLoadingRef.current) {
      return;
    }

    if (totalAmountHandle === ethers.ZeroHash) {
      setDecryptedTotal(BigInt(0));
      return;
    }

    setIsLoading(true);
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [shadowLedger.address],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        return;
      }

      const res = await instance.userDecrypt(
        [{ handle: totalAmountHandle, contractAddress: shadowLedger.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const value = (res as Record<string, bigint | string | boolean>)[totalAmountHandle];
      if (typeof value === "bigint") {
        setDecryptedTotal(value);
      }
    } catch (e) {
      console.error("Failed to decrypt total amount:", e);
    } finally {
      setIsLoading(false);
    }
  }, [totalAmountHandle, instance, shadowLedger.address, ethersSigner, fhevmDecryptionSignatureStorage]);

  const getCategoryTotal = useCallback(async (category: string) => {
    if (!shadowLedger.address || !ethersReadonlyProvider || !ethersSigner) {
      return;
    }

    try {
      const contract = new ethers.Contract(
        shadowLedger.address,
        shadowLedger.abi,
        ethersReadonlyProvider
      );
      const handle = await contract.getTotalAmountByCategory(ethersSigner.address, category);
      setCategoryTotals((prev) => {
        // Only update if not already set
        if (prev.has(category)) {
          return prev;
        }
        const next = new Map(prev);
        next.set(category, handle);
        return next;
      });
      return handle;
    } catch (e) {
      console.error(`Failed to get category total for ${category}:`, e);
    }
  }, [shadowLedger.address, shadowLedger.abi, ethersReadonlyProvider, ethersSigner]);

  const decryptCategoryTotal = useCallback(async (category: string) => {
    const handle = categoryTotals.get(category);
    if (!handle || !instance || !shadowLedger.address || !ethersSigner) {
      return;
    }

    if (handle === ethers.ZeroHash) {
      setDecryptedCategoryTotals((prev) => {
        const next = new Map(prev);
        next.set(category, BigInt(0));
        return next;
      });
      return;
    }

    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [shadowLedger.address],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        return;
      }

      const res = await instance.userDecrypt(
        [{ handle, contractAddress: shadowLedger.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

        const value = (res as Record<string, bigint | string | boolean>)[handle];
        if (typeof value === "bigint") {
          setDecryptedCategoryTotals((prev) => {
            const next = new Map(prev);
            next.set(category, value);
            return next;
          });
        }
    } catch (e) {
      console.error(`Failed to decrypt category total for ${category}:`, e);
    }
  }, [categoryTotals, instance, shadowLedger.address, ethersSigner, fhevmDecryptionSignatureStorage]);

  useEffect(() => {
    if (shadowLedger.address && ethersReadonlyProvider && ethersSigner) {
      getTotalAmount();
    }
  }, [shadowLedger.address, ethersReadonlyProvider, ethersSigner, getTotalAmount]);

  const getAllCategories = useCallback((bills: Array<{ meta: { category: string } }>) => {
    const cats = new Set<string>();
    bills.forEach((bill) => {
      if (bill.meta.category) {
        cats.add(bill.meta.category);
      }
    });
    setCategories(cats);
    return Array.from(cats);
  }, []);

  const loadAndDecryptAllCategories = useCallback(async (categories: string[]) => {
    if (!instance || !shadowLedger.address || !ethersSigner || isLoadingRef.current) {
      return;
    }

    // Filter out categories that are already decrypted or currently loading
    const categoriesToLoad = categories.filter(
      (cat) => !decryptedCategoryTotalsRef.current.has(cat) && !loadingCategoriesRef.current.has(cat)
    );
    
    if (categoriesToLoad.length === 0) {
      return;
    }

    // Mark categories as loading
    categoriesToLoad.forEach(cat => loadingCategoriesRef.current.add(cat));
    setIsLoading(true);
    const handles: string[] = [];
    const categoryHandles: Map<string, string> = new Map();
    const contractAddress = shadowLedger.address;

    try {
      for (const category of categoriesToLoad) {
        const handle = await getCategoryTotal(category);
        if (handle && handle !== ethers.ZeroHash) {
          handles.push(handle);
          categoryHandles.set(category, handle);
        }
      }

      if (handles.length === 0) {
        categoriesToLoad.forEach(cat => loadingCategoriesRef.current.delete(cat));
        setIsLoading(false);
        return;
      }

      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        categoriesToLoad.forEach(cat => loadingCategoriesRef.current.delete(cat));
        setIsLoading(false);
        return;
      }

      const handleContractPairs = handles.map((h) => ({
        handle: h,
        contractAddress: contractAddress,
      }));

      const res = await instance.userDecrypt(
        handleContractPairs,
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const next = new Map<string, bigint>();
      categoryHandles.forEach((handle, category) => {
        const value = (res as Record<string, bigint | string | boolean>)[handle];
        if (typeof value === "bigint") {
          next.set(category, value);
        }
      });

      setDecryptedCategoryTotals((current) => {
        const merged = new Map(current);
        next.forEach((value, key) => {
          merged.set(key, value);
        });
        return merged;
      });
      
      // Remove from loading set
      categoriesToLoad.forEach(cat => loadingCategoriesRef.current.delete(cat));
    } catch (e) {
      console.error("Failed to decrypt all categories:", e);
      categoriesToLoad.forEach(cat => loadingCategoriesRef.current.delete(cat));
    } finally {
      setIsLoading(false);
    }
  }, [instance, shadowLedger.address, ethersSigner, fhevmDecryptionSignatureStorage, getCategoryTotal]);

  return {
    totalAmountHandle,
    decryptedTotal,
    categoryTotals,
    decryptedCategoryTotals,
    categories: Array.from(categories),
    isLoading,
    getTotalAmount,
    decryptTotalAmount,
    getCategoryTotal,
    decryptCategoryTotal,
    getAllCategories,
    loadAndDecryptAllCategories,
  };
};

