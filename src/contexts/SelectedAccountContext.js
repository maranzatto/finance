import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCollection, getDocument } from '../services/firestoreService'; // Adicionado getDocument

const SelectedAccountContext = createContext();
const LOCAL_STORAGE_SELECTED_ACCOUNT_ID = 'selectedAccountId';

export function useSelectedAccount() {
  return useContext(SelectedAccountContext);
}

export function SelectedAccountProvider({ children }) {
  const { currentUser } = useAuth();
  // Tenta carregar do localStorage, mas só define se o usuário estiver logado.
  const [selectedAccount, setSelectedAccountInternal] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isLoadingInitialAccount, setIsLoadingInitialAccount] = useState(true);

  // Função para definir a conta selecionada e salvar no localStorage
  const setSelectedAccount = useCallback((account) => {
    setSelectedAccountInternal(account);
    if (account) {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID, account.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID);
    }
  }, []);

  // Carregar a conta selecionada do localStorage na inicialização
  useEffect(() => {
    if (currentUser) {
      const storedAccountId = localStorage.getItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID);
      if (storedAccountId) {
        // Busca a conta completa do Firestore para garantir dados atualizados
        getDocument('accounts', storedAccountId)
          .then(accountDoc => {
            if (accountDoc && accountDoc.userId === currentUser.uid) {
              setSelectedAccountInternal(accountDoc); 
            } else {
              // Se a conta não existe mais ou não pertence ao usuário, remove do storage
              localStorage.removeItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID);
            }
          })
          .catch(err => {
            console.error("Error fetching stored selected account:", err);
            localStorage.removeItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID);
          })
          .finally(() => {
            setIsLoadingInitialAccount(false);
          });
      } else {
        setIsLoadingInitialAccount(false);
      }
    } else {
      // Se não há usuário, limpa a seleção e o storage
      setSelectedAccountInternal(null);
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ACCOUNT_ID);
      setIsLoadingInitialAccount(false);
    }
  }, [currentUser]); // Executa quando o usuário muda

  const calculateBalance = useCallback(async (account) => {
    if (!account || !currentUser) {
      setAccountBalance(0);
      setLoadingBalance(false); // Certifica que o loading é resetado
      return 0;
    }

    setLoadingBalance(true);
    try {
      if (!account || !account.id || typeof account.id !== 'string' || account.id.trim() === '') {
        console.error("Error calculating balance: Invalid or missing account.id", account);
        setAccountBalance(parseFloat(account?.initialBalance) || 0);
        setLoadingBalance(false);
        return parseFloat(account?.initialBalance) || 0;
      }

      // Validação crucial: Certificar que initialBalance é um número
      const initialBalanceNumber = parseFloat(account.initialBalance);
      if (isNaN(initialBalanceNumber)) {
        console.error("Initial balance is not a valid number:", account.initialBalance);
        // Decide uma ação: pode ser lançar erro, usar 0, ou manter o que estava
        setAccountBalance(0); // Ou talvez o saldo anterior se disponível
        setLoadingBalance(false);
        // Poderia retornar um valor de erro ou o saldo atual (0 neste caso)
        return 0; 
      }

      const transactions = await getCollection('transactions', 
        [ { field: "accountId", operator: "==", value: account.id } ]
        // Se precisar de ordenação, adicione como terceiro argumento: 
        // { field: "date", direction: "desc" } 
      );

      let balance = initialBalanceNumber;
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn("Transaction amount is not a valid number:", transaction.amount, transaction.id);
          return; // Pula esta transação
        }

        if (transaction.type === 'expense') {
          balance -= amount;
        } else if (transaction.type === 'income') {
          balance += amount;
        }
      });
      setAccountBalance(balance);
      return balance; // Retorna o saldo calculado
    } catch (error) {
      console.error("Error calculating balance:", error);
      // Em caso de erro ao buscar transações, considera apenas o saldo inicial (já validado)
      setAccountBalance(parseFloat(account.initialBalance) || 0); 
      return parseFloat(account.initialBalance) || 0;
    } finally {
      setLoadingBalance(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedAccount && !isLoadingInitialAccount) { // Só calcula se a conta inicial já foi carregada
      calculateBalance(selectedAccount);
    }
    // Se não há conta selecionada (e não está carregando uma), reseta o saldo
    if (!selectedAccount && !isLoadingInitialAccount) {
      setAccountBalance(0);
      setLoadingBalance(false);
    }
  }, [selectedAccount, isLoadingInitialAccount, calculateBalance]);
  
  const refreshBalance = useCallback(() => {
    if (selectedAccount) {
      calculateBalance(selectedAccount);
    }
  }, [selectedAccount, calculateBalance]);

  const value = {
    selectedAccount,
    setSelectedAccount,
    accountBalance,
    loadingBalance,
    refreshBalance,
    isLoadingInitialAccount // Para que outros componentes saibam se a conta inicial está carregando
  };

  return (
    <SelectedAccountContext.Provider value={value}>
      {!isLoadingInitialAccount ? children : null} {/* Ou um spinner global se preferir */}
    </SelectedAccountContext.Provider>
  );
}
