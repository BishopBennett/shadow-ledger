"use client";

import { ethers } from "ethers";
import { useCallback, useRef, useState } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

export type DecryptedBill = {
  handle: string;
  clear: bigint;
};

export const useBillDecryption = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  contractAddress: `0x${string}` | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    contractAddress,
    ethersSigner,
  } = parameters;

  const [decryptedBills, setDecryptedBills] = useState<
    Map<string, DecryptedBill>
  >(new Map());
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const isDecryptingRef = useRef<boolean>(false);

  const decryptBill = useCallback(
    async (handle: string): Promise<bigint | null> => {
      if (isDecryptingRef.current) {
        return null;
      }

      if (!contractAddress || !instance || !ethersSigner) {
        return null;
      }

      // Check if already decrypted
      const cached = decryptedBills.get(handle);
      if (cached) {
        return cached.clear;
      }

      if (handle === ethers.ZeroHash) {
        return BigInt(0);
      }

      isDecryptingRef.current = true;
      setIsDecrypting(true);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [contractAddress],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          return null;
        }

        const res = await instance.userDecrypt(
          [{ handle, contractAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const clearValue = (res as Record<string, bigint | string | boolean>)[handle];
        if (typeof clearValue === "bigint") {
          setDecryptedBills((prev) => {
            const next = new Map(prev);
            next.set(handle, { handle, clear: clearValue });
            return next;
          });
          return clearValue;
        }
        return null;
      } catch (e) {
        console.error("Decryption failed:", e);
        return null;
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    },
    [instance, contractAddress, ethersSigner, fhevmDecryptionSignatureStorage, decryptedBills]
  );

  const decryptBills = useCallback(
    async (handles: string[]): Promise<Map<string, bigint>> => {
      if (isDecryptingRef.current || handles.length === 0) {
        return new Map();
      }

      if (!contractAddress || !instance || !ethersSigner) {
        return new Map();
      }

      // Filter out already decrypted and zero handles
      const handlesToDecrypt = handles.filter(
        (h) => h !== ethers.ZeroHash && !decryptedBills.has(h)
      );

      if (handlesToDecrypt.length === 0) {
        return new Map(
          handles.map((h) => {
            if (h === ethers.ZeroHash) {
              return [h, BigInt(0)];
            }
            const cached = decryptedBills.get(h);
            return [h, cached?.clear ?? BigInt(0)];
          })
        );
      }

      isDecryptingRef.current = true;
      setIsDecrypting(true);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [contractAddress],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          return new Map();
        }

        const handleContractPairs = handlesToDecrypt.map((h) => ({
          handle: h,
          contractAddress,
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

        const result = new Map<string, bigint>();
        handles.forEach((h) => {
          if (h === ethers.ZeroHash) {
            result.set(h, BigInt(0));
          } else if (decryptedBills.has(h)) {
            result.set(h, decryptedBills.get(h)!.clear);
          } else {
            const value = (res as Record<string, bigint | string | boolean>)[h];
            result.set(h, typeof value === "bigint" ? value : BigInt(0));
          }
        });

        setDecryptedBills((prev) => {
          const next = new Map(prev);
          handlesToDecrypt.forEach((h) => {
            const value = (res as Record<string, bigint | string | boolean>)[h];
            if (value !== undefined && typeof value === "bigint") {
              next.set(h, { handle: h, clear: value });
            }
          });
          return next;
        });

        return result;
      } catch (e) {
        console.error("Batch decryption failed:", e);
        return new Map();
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    },
    [instance, contractAddress, ethersSigner, fhevmDecryptionSignatureStorage, decryptedBills]
  );

  return {
    decryptBill,
    decryptBills,
    decryptedBills,
    isDecrypting,
  };
};

