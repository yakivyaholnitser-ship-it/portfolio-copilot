import type { InvestorConfig } from "@/types/portfolio";

export const investors = {
  yakiv: {
    id: "yakiv",
    displayName: "Yakiv",
    positions: [
      {
        symbol: "STX",
        bought: 452.75,
      },
    ],
  },
  anastasiia: {
    id: "anastasiia",
    displayName: "Anastasiia",
    positions: [
      {
        symbol: "STX",
        bought: 1108.22,
      },
    ],
  },
} as const satisfies Record<string, InvestorConfig>;

export type InvestorId = keyof typeof investors;

export function getInvestorConfig(userId: string): InvestorConfig | null {
  const normalizedUserId = userId.toLowerCase();

  return normalizedUserId in investors
    ? investors[normalizedUserId as InvestorId]
    : null;
}

export function getInvestorOptions() {
  return Object.values(investors).map((investor) => ({
    id: investor.id,
    displayName: investor.displayName,
  }));
}
