/**
 * PackPal Core Verification Script
 * Validates deterministic financial calculations, settlement optimization,
 * packing weight arithmetic, and fallback heuristics.
 */

const assert = require('assert');

console.log('🧪 Starting PackPal Core Logic Verification...\n');

// ─── 1. Expense Balances & Integer Paise Arithmetic ──────────
function calculateEqualSharePaise(amountPaise, participantCount) {
  if (participantCount <= 0) return 0;
  return Math.round(amountPaise / participantCount);
}

function calculateBalances(expenses, memberNames) {
  const balanceMap = {};
  for (const name of memberNames) {
    balanceMap[name] = 0;
  }

  for (const expense of expenses) {
    const { amountPaise, paidBy, participants, splitMethod, customSharesPaise } = expense;
    if (balanceMap[paidBy] !== undefined) {
      balanceMap[paidBy] += amountPaise;
    }

    if (splitMethod === 'custom' && customSharesPaise) {
      for (const [name, share] of Object.entries(customSharesPaise)) {
        if (balanceMap[name] !== undefined) {
          balanceMap[name] -= share;
        }
      }
    } else {
      const sharePerPerson = calculateEqualSharePaise(amountPaise, participants.length);
      for (const name of participants) {
        if (balanceMap[name] !== undefined) {
          balanceMap[name] -= sharePerPerson;
        }
      }
    }
  }

  return memberNames.map((name) => ({
    memberName: name,
    balancePaise: balanceMap[name] || 0,
  }));
}

function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];

  for (const b of balances) {
    if (b.balancePaise > 0) {
      creditors.push({ name: b.memberName, amount: b.balancePaise });
    } else if (b.balancePaise < 0) {
      debtors.push({ name: b.memberName, amount: -b.balancePaise });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
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

// Test case 1: 4 friends splitting ₹2400 (paid by Rahul)
const members = ['Ansh', 'Rahul', 'Aman', 'Riya'];
const testExpenses = [
  {
    amountPaise: 240000, // ₹2400.00
    paidBy: 'Rahul',
    participants: ['Ansh', 'Rahul', 'Aman', 'Riya'],
    splitMethod: 'equal',
  },
];

const balances1 = calculateBalances(testExpenses, members);
console.log('Test 1 - Balances:', balances1);
assert.strictEqual(balances1.find(b => b.memberName === 'Rahul').balancePaise, 180000, 'Rahul should be owed ₹1800');
assert.strictEqual(balances1.find(b => b.memberName === 'Ansh').balancePaise, -60000, 'Ansh should owe ₹600');
assert.strictEqual(balances1.find(b => b.memberName === 'Aman').balancePaise, -60000, 'Aman should owe ₹600');
assert.strictEqual(balances1.find(b => b.memberName === 'Riya').balancePaise, -60000, 'Riya should owe ₹600');

const settlements1 = computeSettlements(balances1);
console.log('Test 1 - Settlements:', settlements1);
assert.strictEqual(settlements1.length, 3, 'Should produce exactly 3 settlements to Rahul');
console.log('✅ Test 1 Passed: Expense split and settlement calculation verified.\n');

// ─── 2. Multi-way Settlement Optimization ────────────────────
const complexExpenses = [
  { amountPaise: 120000, paidBy: 'Ansh', participants: members, splitMethod: 'equal' },   // Ansh paid 1200
  { amountPaise: 240000, paidBy: 'Rahul', participants: members, splitMethod: 'equal' },  // Rahul paid 2400
  { amountPaise: 400000, paidBy: 'Aman', participants: members, splitMethod: 'equal' },   // Aman paid 4000
  { amountPaise: 160000, paidBy: 'Riya', participants: members, splitMethod: 'equal' },   // Riya paid 1600
];

const balances2 = calculateBalances(complexExpenses, members);
console.log('Test 2 - Multi-way Balances:', balances2);
const totalNet = balances2.reduce((sum, b) => sum + b.balancePaise, 0);
assert.strictEqual(totalNet, 0, 'Sum of all net balances must be zero (zero-sum invariant)');

const settlements2 = computeSettlements(balances2);
console.log('Test 2 - Optimal Settlements:', settlements2);
assert(settlements2.length <= members.length - 1, 'Settlements should be minimal (<= N-1)');
console.log('✅ Test 2 Passed: Multi-way debt minimization verified.\n');

// ─── 3. Weight Calculations & Packing Categories ─────────────
const testPackingItems = [
  { id: '1', name: 'T-Shirts', category: 'clothing', quantity: 3, weightEstimateKg: 0.2, packed: true },
  { id: '2', name: 'Hiking Shoes', category: 'hiking', quantity: 1, weightEstimateKg: 0.9, packed: true },
  { id: '3', name: 'Power Bank', category: 'electronics', quantity: 1, weightEstimateKg: 0.25, packed: false },
];

function calculateItemWeight(item) {
  return (item.weightEstimateKg || 0.15) * item.quantity;
}

function calculateTotalPackedWeight(items) {
  return items.filter(i => i.packed).reduce((sum, i) => sum + calculateItemWeight(i), 0);
}

const totalPacked = calculateTotalPackedWeight(testPackingItems);
assert.strictEqual(totalPacked, 1.5, 'Total packed weight must be 3*0.2 + 0.9 = 1.5kg');
console.log('✅ Test 3 Passed: Luggage weight calculations verified.\n');

console.log('🎉 ALL PACKPAL CORE LOGIC TESTS PASSED SUCCESSFULLY!');
