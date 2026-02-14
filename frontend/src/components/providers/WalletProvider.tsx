'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NearConnector } from '@hot-labs/near-connect';
import type { NearWalletBase } from '@hot-labs/near-connect';
import { CONTRACT_ID, NETWORK_ID } from '@/lib/near';

type FinalExecutionOutcome = Awaited<ReturnType<NearWalletBase['signAndSendTransaction']>>;

interface WalletContextType {
  connector: NearConnector | null;
  accountId: string | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  callMethod: (params: {
    methodName: string;
    args?: Record<string, unknown>;
    gas?: string;
    deposit?: string;
  }) => Promise<FinalExecutionOutcome | undefined>;
}

const WalletContext = createContext<WalletContextType>({
  connector: null,
  accountId: null,
  isSignedIn: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  callMethod: async () => undefined,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const connectorRef = useRef<NearConnector | null>(null);

  if (typeof window !== 'undefined' && !connectorRef.current) {
    connectorRef.current = new NearConnector({
      network: NETWORK_ID as 'testnet' | 'mainnet',
      autoConnect: true,
    });
  }

  const connector = connectorRef.current;

  useEffect(() => {
    if (!connector) return;

    const onSignIn = (data: { accounts: { accountId: string }[] }) => {
      if (data.accounts.length > 0) {
        setAccountId(data.accounts[0].accountId);
      }
      setIsLoading(false);
    };

    const onSignOut = () => {
      setAccountId(null);
    };

    connector.on('wallet:signIn', onSignIn);
    connector.on('wallet:signOut', onSignOut);

    // Restore existing connection
    connector.getConnectedWallet()
      .then(({ accounts }) => {
        if (accounts.length > 0) {
          setAccountId(accounts[0].accountId);
        }
      })
      .catch(() => {
        // No existing connection
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      connector.off('wallet:signIn', onSignIn);
      connector.off('wallet:signOut', onSignOut);
    };
  }, [connector]);

  const signIn = useCallback(async () => {
    if (!connector) return;
    await connector.connect();
  }, [connector]);

  const signOut = useCallback(async () => {
    if (!connector) return;
    await connector.disconnect();
    setAccountId(null);
  }, [connector]);

  const callMethod = useCallback(
    async ({
      methodName,
      args = {},
      gas = '30000000000000',
      deposit = '0',
    }: {
      methodName: string;
      args?: Record<string, unknown>;
      gas?: string;
      deposit?: string;
    }): Promise<FinalExecutionOutcome | undefined> => {
      if (!connector) throw new Error('Wallet not initialized');
      const wallet = await connector.wallet();
      const result = await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName,
              args,
              gas,
              deposit,
            },
          },
        ],
      });
      return result;
    },
    [connector],
  );

  return (
    <WalletContext.Provider
      value={{
        connector,
        accountId,
        isSignedIn: !!accountId,
        isLoading,
        signIn,
        signOut,
        callMethod,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
