import { Balance, Settlement } from '@/types';

/**
 * Compute minimal settlement transfers from member balances.
 * Uses greedy approach: match largest creditor with largest debtor.
 * All amounts in paise. Deterministic — no AI involved.
 */
export function computeSettlements(balances: Balance[]): Settlement[] {
  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.balancePaise > 0) {
      creditors.push({ name: b.memberName, amount: b.balancePaise });
    } else if (b.balancePaise < 0) {
      debtors.push({ name: b.memberName, amount: -b.balancePaise }); // make positive
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transferAmount = Math.min(creditors[ci].amount, debtors[di].amount);

    if (transferAmount > 0) {
      settlements.push({
        from: debtors[di].name,
        to: creditors[ci].name,
        amountPaise: transferAmount,
      });
    }

    creditors[ci].amount -= transferAmount;
    debtors[di].amount -= transferAmount;

    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return settlements;
}
