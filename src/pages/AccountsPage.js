import React, { useState, useEffect, useCallback } from 'react';
import { getCollection, deleteDocument } from '../services/firestoreService'; 
import { useAuth } from '../contexts/AuthContext';
import { useSelectedAccount } from '../contexts/SelectedAccountContext'; // Importar
import { toast } from 'react-toastify';
import AccountForm from '../components/AccountForm';
import './AccountsPage.css';
import { FaEdit, FaTrashAlt, FaCheckCircle } from 'react-icons/fa'; // Adicionado FaCheckCircle

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const { selectedAccount, setSelectedAccount, refreshBalance } = useSelectedAccount(); // Usar contexto
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null); 

    const fetchUserAccounts = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const userAccounts = await getCollection('accounts', [
                { field: "userId", operator: "==", value: currentUser.uid }
            ], { field: "createdAt", direction: "desc" });
            setAccounts(userAccounts);
            // Se nenhuma conta estiver selecionada e houver contas, seleciona a primeira por padrão.
            // Ou se a conta selecionada foi deletada, deseleciona.
            if (!selectedAccount && userAccounts.length > 0) {
                setSelectedAccount(userAccounts[0]);
            } else if (selectedAccount && !userAccounts.find(acc => acc.id === selectedAccount.id)) {
                setSelectedAccount(userAccounts.length > 0 ? userAccounts[0] : null);
            }

        } catch (err) {
            console.error("Error fetching accounts:", err);
            setError('Falha ao buscar contas. Tente novamente.');
            toast.error('Falha ao buscar contas.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, setSelectedAccount, selectedAccount]); // Adicionado selectedAccount e setSelectedAccount

    useEffect(() => {
        fetchUserAccounts();
    }, [fetchUserAccounts]);

    const handleFormSaved = () => { 
        const message = editingAccount ? "Conta atualizada com sucesso!" : "Conta adicionada com sucesso!";
        toast.success(message);
        setShowForm(false);
        setEditingAccount(null); 
        fetchUserAccounts().then(() => {
            // Se uma conta foi editada e é a selecionada, atualiza os dados dela no contexto
            if (editingAccount && selectedAccount && editingAccount.id === selectedAccount.id) {
                 // Encontra a conta atualizada na lista e a define como selecionada para pegar os novos dados.
                const updatedAccount = accounts.find(acc => acc.id === editingAccount.id);
                if (updatedAccount) setSelectedAccount(updatedAccount); // Isso também irá recalcular o saldo
            }
            refreshBalance(); // Atualiza o saldo após salvar, importante se o initialBalance mudou
        }); 
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingAccount(null); 
    };

    const handleDeleteAccount = async (accountId) => {
        if (window.confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
            try {
                await deleteDocument('accounts', accountId);
                toast.success("Conta excluída com sucesso!"); 
                // Se a conta excluída era a selecionada, limpa a seleção ou seleciona a próxima
                if (selectedAccount && selectedAccount.id === accountId) {
                    const remainingAccounts = accounts.filter(acc => acc.id !== accountId);
                    setSelectedAccount(remainingAccounts.length > 0 ? remainingAccounts[0] : null);
                } else {
                    // Apenas força um refetch se a conta deletada não era a selecionada
                    // para garantir que a lista de contas no estado local `accounts` esteja atualizada
                    // antes que `selectedAccount` seja potencialmente redefinido no `fetchUserAccounts`.
                    const currentAccounts = accounts.filter(acc => acc.id !== accountId);
                    setAccounts(currentAccounts);
                    if (currentAccounts.length === 0) {
                        setSelectedAccount(null);
                    }
                }
                fetchUserAccounts(); // Atualiza a lista geral e reavalia a seleção
                refreshBalance(); // Garante que o saldo seja atualizado se a conta selecionada mudar

            } catch (err) {
                console.error("Error deleting account:", err);
                setError('Falha ao excluir conta. Tente novamente.');
                toast.error('Falha ao excluir conta.');
            }
        }
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account); 
        setShowForm(true);         
    };
    
    const handleAddNewAccount = () => {
        setEditingAccount(null); 
        setShowForm(true);       
    };

    const handleSelectAccount = (account) => {
        setSelectedAccount(account);
        // O saldo será recalculado automaticamente pelo context
    };


    if (!currentUser && !loading) {
        return <p>Você precisa estar logado para ver esta página.</p>;
    }

    return (
        <div className="page-container"> 
            <h2>Gerenciar Contas</h2>
            {loading && <p className="page-loading">Carregando contas...</p>}
            {error && <p className="page-error">Erro: {error}</p>}
            
            {!showForm && (
                <button onClick={handleAddNewAccount} className="btn btn-primary btn-add-account">
                    Adicionar Nova Conta
                </button>
            )}

            {showForm && (
                <AccountForm
                    onAccountSaved={handleFormSaved}
                    onCancel={handleFormCancel}
                    accountToEdit={editingAccount} 
                />
            )}

            {!loading && !error && accounts.length === 0 && !showForm && (
                <p className="page-no-data">Nenhuma conta cadastrada ainda.</p>
            )}

            {accounts.length > 0 && !showForm && (
                <ul className="accounts-list">
                    {accounts.map(account => (
                        <li 
                            key={account.id} 
                            className={`account-item ${selectedAccount && selectedAccount.id === account.id ? 'selected' : ''}`}
                            onClick={() => handleSelectAccount(account)} // Adicionado onClick para selecionar
                        >
                            <div className="account-item-details">
                                <strong>{account.name}</strong>
                                <span className="meta-info">Tipo: {account.type}</span>
                                <span className="meta-info">Saldo Inicial: R$ {parseFloat(account.initialBalance || 0).toFixed(2)}</span>
                            </div>
                            {selectedAccount && selectedAccount.id === account.id && 
                                <FaCheckCircle title="Conta Selecionada" className="selected-account-check-icon" />
                            }
                            <div className="account-item-actions">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleEditAccount(account); }} 
                                    className="btn btn-secondary btn-edit btn-icon-square"
                                    aria-label="Editar Conta"
                                    title="Editar"
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAccount(account.id); }}
                                    className="btn btn-danger btn-delete btn-icon-square"
                                    aria-label="Excluir Conta"
                                    title="Excluir"
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
