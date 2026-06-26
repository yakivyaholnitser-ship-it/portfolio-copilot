import { FmpFundamentalsProvider } from "./fmp-provider";
import type { FundamentalsProvider } from "./types";

let fundamentalsProvider: FundamentalsProvider | undefined;

export function getFundamentalsProvider(): FundamentalsProvider {
  fundamentalsProvider ??= new FmpFundamentalsProvider();

  return fundamentalsProvider;
}

export type { FundamentalsProvider } from "./types";
