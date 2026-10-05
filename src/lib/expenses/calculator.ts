import { Expense, Balance } from '@/types';

/**
 * Calculate equal share for an expense in paise.
 */
export function calculateEqualSharePaise(amountPaise: number, participantCount: number): number {
  if (participantCount <= 0) return 0;
  return Math.round(amountPaise / participantCount);
}

/**
 * Calculate each member's net balance from a list of expenses.
 * Positive = owed money. Negative = owes money.
 */
export function calculateBalances(expenses: Expense[], memberNames: string[]): Balance[] {
  const balanceMap: Record<string, number> = {};
  for (const name of memberNames) {
    balanceMap[name] = 0;
  }

  for (const expense of expenses) {
    const { amountPaise, paidBy, participants, splitMethod, customSharesPaise } = expense;

    // Credit the payer
    if (balanceMap[paidBy] !== undefined) {
      balanceMap[paidBy] += amountPaise;
    }

    if (splitMethod === 'custom' && customSharesPaise) {
      // Debit each participant their custom share
      for (const [name, share] of Object.entries(customSharesPaise)) {
        if (balanceMap[name] !== undefined) {
          balanceMap[name] -= share;
        }
      }
    } else {
      // Equal split
      const sharePerPerson = calculateEqualSharePaise(amountPaise, participants.length);
      for (const name of participants) {
        if (balanceMap[name] !== undefined) {
          balanceMap[name] -= sharePerPerson;
        }
      }
    }
  }

  return memberNames.map((name) => ({
    memberId: name,
    memberName: name,
    balancePaise: balanceMap[name] || 0,
  }));
}

/**
 * Calculate total expenses in paise.
 */
export function calculateTotalExpensesPaise(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountPaise, 0);
}

/**
 * Format paise to rupee display string.
 */
export function formatPaiseToRupees(paise: number): string {
  const rupees = Math.abs(paise) / 100;
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return paise < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Validate custom split: sum of custom shares must equal total.
 */
export function validateCustomSplit(
  totalPaise: number,
  customSharesPaise: Record<string, number>
): boolean {
  const sum = Object.values(customSharesPaise).reduce((a, b) => a + b, 0);
  return sum === totalPaise;
}
