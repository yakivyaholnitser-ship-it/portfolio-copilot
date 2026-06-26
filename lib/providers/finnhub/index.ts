import { HttpFinnhubProvider } from "./finnhub-provider";
import type { FinnhubProvider } from "./types";

let finnhubProvider: FinnhubProvider | undefined;

export function getFinnhubProvider(): FinnhubProvider {
  finnhubProvider ??= new HttpFinnhubProvider();

  return finnhubProvider;
}

export type { FinnhubProvider } from "./types";
