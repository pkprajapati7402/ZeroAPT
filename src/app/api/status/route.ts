import { NextRequest, NextResponse } from 'next/server';
import { createRelayerAccount, getAccountBalance } from '@/lib/aptosClient';

// Store transaction history (use database in production)
interface TransactionRecord {
  hash: string;
  action: string;
  timestamp: number;
  user: string;
  success: boolean;
}

let transactionHistory: TransactionRecord[] = [];

export async function GET(request: NextRequest) {
  try {
    const relayerAccount = createRelayerAccount();
    const balance = await getAccountBalance(relayerAccount.accountAddress.toString());

    // Get last 5 transactions
    const recentTransactions = transactionHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return NextResponse.json({
      relayer: {
        address: relayerAccount.accountAddress.toString(),
        balance: balance,
        balanceFormatted: `${(balance / 100000000).toFixed(4)} APT`
      },
      stats: {
        totalTransactions: transactionHistory.length,
        successfulTransactions: transactionHistory.filter(t => t.success).length,
        failedTransactions: transactionHistory.filter(t => !t.success).length
      },
      recentTransactions: recentTransactions.map(tx => ({
        hash: tx.hash,
        action: tx.action,
        user: tx.user,
        timestamp: new Date(tx.timestamp).toISOString(),
        success: tx.success,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${tx.hash}?network=testnet`
      }))
    });

  } catch (error: any) {
    console.error('Status endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to get relayer status', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to add transaction to history (called from relay-intent)
export const addTransactionToHistory = (transaction: TransactionRecord) => {
  transactionHistory.push(transaction);
  
  // Keep only last 100 transactions
  if (transactionHistory.length > 100) {
    transactionHistory = transactionHistory.slice(-100);
  }
};