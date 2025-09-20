import { NextRequest, NextResponse } from 'next/server';
import { 
  aptosClient, 
  createRelayerAccount, 
  buildTransactionPayload, 
  submitAndWaitForTransaction 
} from '@/lib/aptosClient';
import { 
  verifySignature, 
  validatePayload, 
  serializePayload, 
  type SignedIntent 
} from '@/lib/signature';

// In-memory nonce storage (use Redis in production)
const usedNonces = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body: SignedIntent = await request.json();
    const { payload, signature, publicKey } = body;

    // 1. Validate payload structure and expiry
    if (!validatePayload(payload)) {
      return NextResponse.json(
        { error: 'Invalid payload structure or expired' },
        { status: 400 }
      );
    }

    // 2. Check for nonce replay
    if (usedNonces.has(payload.nonce)) {
      return NextResponse.json(
        { error: 'Nonce already used' },
        { status: 400 }
      );
    }

    // 3. Verify signature
    const serializedPayload = serializePayload(payload);
    const isValidSignature = verifySignature(
      serializedPayload,
      signature,
      publicKey
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 4. Mark nonce as used
    usedNonces.add(payload.nonce);

    // 5. Create relayer account
    const relayerAccount = createRelayerAccount();

    // 6. Build transaction based on action
    let transactionPayload;
    
    switch (payload.action) {
      case 'mint_badge':
        transactionPayload = buildTransactionPayload('mint_badge', [
          payload.user
        ]);
        break;
        
      case 'cast_vote':
        transactionPayload = buildTransactionPayload('cast_vote', [
          payload.user,
          payload.params.poll_id,
          payload.params.choice
        ]);
        break;
        
      case 'transfer_token':
        transactionPayload = buildTransactionPayload('transfer_token', [
          payload.user,
          payload.params.recipient,
          payload.params.amount
        ]);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        );
    }

    // 7. Submit transaction
    const result = await submitAndWaitForTransaction(
      relayerAccount,
      transactionPayload
    );

    // 8. Return success response
    return NextResponse.json({
      success: true,
      transactionHash: result.hash,
      version: result.version,
      explorerUrl: `https://explorer.aptoslabs.com/txn/${result.hash}?network=testnet`
    });

  } catch (error: any) {
    console.error('Relay intent error:', error);
    
    // Clean up nonce on error
    const body = await request.clone().json().catch(() => ({}));
    if (body.payload?.nonce) {
      usedNonces.delete(body.payload.nonce);
    }

    return NextResponse.json(
      { 
        error: 'Transaction failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}