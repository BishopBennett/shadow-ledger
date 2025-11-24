"use client";

import { Providers } from "./providers";
import { ShadowLedgerPage } from "@/components/ShadowLedgerPage";

export default function Home() {
  return (
    <Providers>
      <ShadowLedgerPage />
    </Providers>
  );
}



