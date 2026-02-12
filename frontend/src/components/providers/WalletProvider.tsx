'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { setupWalletSelector, WalletSelector, actionCreators } from '@near-wallet-selector/core';
import type { WalletModuleFactory } from '@near-wallet-selector/core';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { CONTRACT_ID, NETWORK_ID } from '@/lib/near';

import '@near-wallet-selector/modal-ui/styles.css';

const { functionCall } = actionCreators;

interface WalletContextType {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accountId: string | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  callMethod: (params: {
    methodName: string;
    args?: Record<string, unknown>;
    gas?: string;
    deposit?: string;
  }) => Promise<unknown>;
}

const WalletContext = createContext<WalletContextType>({
  selector: null,
  modal: null,
  accountId: null,
  isSignedIn: false,
  isLoading: true,
  signIn: () => {},
  signOut: async () => {},
  callMethod: async () => null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<WalletSelectorModal | null>(null);

  useEffect(() => {
    setupWalletSelector({
      network: NETWORK_ID as 'testnet' | 'mainnet',
      modules: [
        setupMyNearWallet() as unknown as WalletModuleFactory,
        setupMeteorWallet() as unknown as WalletModuleFactory,
        setupHereWallet() as unknown as WalletModuleFactory,
      ],
    }).then((sel) => {
      const modal = setupModal(sel, { contractId: CONTRACT_ID });
      modalRef.current = modal;
      setSelector(sel);

      const state = sel.store.getState();
      const accounts = state.accounts;
      if (accounts.length > 0) {
        setAccountId(accounts[0].accountId);
      }
      setIsLoading(false);

      sel.store.observable.subscribe((state) => {
        const accounts = state.accounts;
        if (accounts.length > 0) {
          setAccountId(accounts[0].accountId);
        } else {
          setAccountId(null);
        }
      });
    });
  }, []);

  const signIn = useCallback(() => {
    modalRef.current?.show();
  }, []);

  const signOut = useCallback(async () => {
    if (!selector) return;
    const wallet = await selector.wallet();
    await wallet.signOut();
    setAccountId(null);
  }, [selector]);

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
    }) => {
      if (!selector) throw new Error('Wallet not initialized');
      const wallet = await selector.wallet();
      const result = await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          functionCall(methodName, args, BigInt(gas), BigInt(deposit)),
        ],
      });
      return result;
    },
    [selector],
  );

  return (
    <WalletContext.Provider
      value={{
        selector,
        modal: modalRef.current,
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
