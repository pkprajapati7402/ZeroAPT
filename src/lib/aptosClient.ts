import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ 
  network: Network.TESTNET 
});

export const aptosClient = new Aptos(config);

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1";
export const MODULE_NAME = "AptosGasless";

// Relayer account (server-side only)
export const createRelayerAccount = () => {
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("RELAYER_PRIVATE_KEY environment variable is required");
  }
  
  const privKey = new Ed25519PrivateKey(privateKey);
  return Account.fromPrivateKey({ privateKey: privKey });
};

// Helper function to build transaction payload
export const buildTransactionPayload = (
  functionName: string,
  functionArguments: any[]
) => {
  return {
    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::${functionName}`,
    functionArguments,
  };
};

// Get account balance
export const getAccountBalance = async (address: string) => {
  try {
    const balance = await aptosClient.getAccountAPTAmount({ 
      accountAddress: address 
    });
    return balance;
  } catch (error) {
    console.error("Error getting account balance:", error);
    return 0;
  }
};

// Submit transaction and wait for confirmation
export const submitAndWaitForTransaction = async (
  account: Account,
  payload: any
) => {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: payload,
    });

    const committedTx = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const executedTransaction = await aptosClient.waitForTransaction({
      transactionHash: committedTx.hash,
    });

    return {
      hash: committedTx.hash,
      success: executedTransaction.success,
      version: executedTransaction.version,
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};