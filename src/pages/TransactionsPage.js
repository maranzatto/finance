import React, { useState, useEffect, useCallback } from 'react';
import { getCollection, deleteDocument } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useSelectedAccount } from '../contexts/SelectedAccountContext'; // <<< IMPORTAR CONTEXTO
import TransactionForm from '../components/TransactionForm';
import './TransactionsPage.css'; 
import { toast } from 'react-toastify'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const { refreshBalance } = useSelectedAccount(); // <<< USAR CONTEXTO
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Buscar contas do usuário
    const fetchUserAccounts = useCallback(async () => {
        if (!currentUser) return;
        // setLoading(true); // Gerenciar loading separadamente se necessário
        try {
            const userAccounts = await getCollection('accounts', 
                [{ field: "userId", operator: "==", value: currentUser.uid }],
                { field: "createdAt", direction: "desc" }
            );
            setAccounts(userAccounts);
        } catch (err) {
            console.error("Error fetching accounts for transactions page:", err);
            setError(prev => prev + '\nFalha ao buscar contas.'); // Adiciona ao erro existente
        }
        // setLoading(false);
    }, [currentUser]);

    // Buscar transações do usuário
    const fetchUserTransactions = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true); // Loading principal para transações
        // setError(''); // Limpa erro anterior ao buscar transações, mas pode sobrepor erro de contas
        try {
            const userTransactions = await getCollection('transactions',
                [{ field: "userId", operator: "==", value: currentUser.uid }],
                // Poderia ordenar por 'date' (se for Timestamp) ou 'createdAt'
                { field: "createdAt", direction: "desc" } 
            );
            setTransactions(userTransactions);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(prev => prev + '\nFalha ao buscar transações.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            // Resetar erros ao tentar buscar novamente
            setError(''); 
            fetchUserAccounts(); // Buscar contas primeiro ou em paralelo
            fetchUserTransactions();
        } else {
            setLoading(false);
            setAccounts([]);
            setTransactions([]);
        }
    }, [currentUser, fetchUserAccounts, fetchUserTransactions]);

    const handleFormSaved = () => {
        setShowForm(false);
        setEditingTransaction(null); 
        fetchUserTransactions(); // Recarrega a lista de transações local
        refreshBalance(); // <<< ATUALIZAR SALDO GLOBAL
        const message = editingTransaction ? "Transação atualizada com sucesso!" : "Transação adicionada com sucesso!";
        toast.success(message);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingTransaction(null); // <<< LIMPAR editingTransaction
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
            try {
                await deleteDocument('transactions', transactionId);
                toast.success('Transação excluída com sucesso!'); 
                fetchUserTransactions(); // Re-busca as transações para atualizar a lista
                refreshBalance(); // <<< ATUALIZAR SALDO GLOBAL APÓS EXCLUSÃO
            } catch (err) {
                console.error("Erro ao excluir transação:", err);
                toast.error('Falha ao excluir transação.'); 
            }
        }
    };

    // <<< NOVA FUNÇÃO para iniciar a edição
    const handleStartEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };
    
    // TODO: Adicionar função para EDITAR transações no futuro

    if (!currentUser && !loading) {
        return <p>Você precisa estar logado para ver esta página.</p>;
    }

    return (
        <div className="page-container"> {/* <<< Adicionado page-container */} 
            <h2>Gerenciar Transações</h2>
            
            {loading && <p className="page-loading">Carregando dados...</p>}
            {error && (
                <div className="page-error">
                    <p>Erro ao carregar dados:</p>
                    <ul>
                        {error.split('\n').filter(e => e).map((item, key) => <li key={key}>{item}</li>)}
                    </ul>
                </div>
            )}

            {!showForm && (
                <button 
                    onClick={() => {
                        setEditingTransaction(null); // Garante que não está editando ao adicionar novo
                        setShowForm(true);
                    }} 
                    className="btn btn-primary add-transaction-btn"
                    disabled={accounts.length === 0 && !loading} 
                >
                    Adicionar Nova Transação
                </button> // <<< BOTÃO FECHADO CORRETAMENTE
            )}

            {showForm && (
                <TransactionForm
                    onTransactionSaved={handleFormSaved}
                    onCancel={handleFormCancel}
                    accounts={accounts} 
                    transactionToEdit={editingTransaction} 
                />
            )}

            {!showForm && transactions.length > 0 && (
                <div>
                    <h3>Minhas Transações</h3>
                    <ul className="transactions-list">
                        {transactions.map(transaction => (
                            <li key={transaction.id} className={`transaction-item ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                                <div className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                                    {transaction.type === 'expense' ? '-' : '+'} R$ {transaction.amount.toFixed(2)}
                                </div>
                                <div className="transaction-info">
                                    <span className="transaction-description">{transaction.description}</span>
                                    <span className="transaction-date">
                                        Data: {transaction.date.toDate ? transaction.date.toDate().toLocaleDateString() : new Date(transaction.date + 'T00:00:00').toLocaleDateString()}
                                    </span>
                                    <span className="transaction-category">
                                        Conta: {accounts.find(acc => acc.id === transaction.accountId)?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="transaction-actions">
                                    <button 
                                        onClick={() => handleStartEditTransaction(transaction)} 
                                        className="btn btn-secondary btn-edit btn-icon-square"
                                        aria-label="Editar Transação"
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTransaction(transaction.id)} 
                                        className="btn btn-danger btn-delete btn-icon-square"
                                        aria-label="Excluir Transação"
                                        title="Excluir"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!showForm && !loading && transactions.length === 0 && (
                 <p className="page-no-data">Nenhuma transação registrada ainda.</p>
            )}
        </div>
    );
}
