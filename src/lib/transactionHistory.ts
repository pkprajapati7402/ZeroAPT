// Transaction history management
interface TransactionRecord {
  hash: string;
  action: string;
  timestamp: number;
  user: string;
  success: boolean;
}

let transactionHistory: TransactionRecord[] = [];

export const addTransactionToHistory = (transaction: TransactionRecord) => {
  transactionHistory.push(transaction);
  
  // Keep only last 100 transactions
  if (transactionHistory.length > 100) {
    transactionHistory = transactionHistory.slice(-100);
  }
};

export const getTransactionHistory = () => transactionHistory;

export { type TransactionRecord };