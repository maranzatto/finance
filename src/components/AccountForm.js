import React, { useState, useEffect } from 'react';
import { addDocument, updateDocument } from '../services/firestoreService';
import { toast } from 'react-toastify'; // Import toast
import './AccountForm.css'; // <<< IMPORT CSS

export default function AccountForm({ onAccountSaved, onCancel, accountToEdit }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('Carteira');
    const [initialBalance, setInitialBalance] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(accountToEdit); // Determina se está em modo de edição

    const accountTypes = ["Carteira", "Conta Corrente", "Conta Poupança", "Investimento", "Outro"];

    useEffect(() => {
        if (isEditMode && accountToEdit) {
            setName(accountToEdit.name || '');
            setType(accountToEdit.type || 'Carteira');
            setInitialBalance(accountToEdit.initialBalance !== undefined ? String(accountToEdit.initialBalance) : '');
        } else {
            // Reset para modo de adição
            setName('');
            setType('Carteira');
            setInitialBalance('');
        }
    }, [accountToEdit, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!name.trim() || !type || initialBalance === '') {
            // setError('Por favor, preencha todos os campos obrigatórios.'); // Mantido como erro no formulário
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        const balance = parseFloat(initialBalance);
        if (isNaN(balance)) {
            // setError('Saldo inicial deve ser um número.'); // Mantido como erro no formulário
            toast.error('Saldo inicial deve ser um número.');
            setLoading(false);
            return;
        }

        const accountData = {
            name: name.trim(),
            type,
            initialBalance: balance,
        };

        try {
            if (isEditMode && accountToEdit?.id) {
                await updateDocument('accounts', accountToEdit.id, accountData);
            } else {
                await addDocument('accounts', accountData);
            }
            
            if (onAccountSaved) {
                onAccountSaved(); // Callback para atualizar a lista na página pai SOMENTE em sucesso
            }
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} account:`, err);
            // setError(`Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} conta. Tente novamente.`); // Pode ser mantido se quiser erro no form também
            toast.error(`Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} conta. Tente novamente.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="account-form-container">
            <h4>{isEditMode ? 'Editar Conta' : 'Nova Conta'}</h4>
            {error && <p className="account-form-error">{error}</p>}
            
            <div className="form-group">
                <label htmlFor="accountName">Nome da Conta:</label>
                <input
                    type="text"
                    id="accountName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="accountType">Tipo da Conta:</label>
                <select
                    id="accountType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                >
                    {accountTypes.map(accType => (
                        <option key={accType} value={accType}>{accType}</option>
                    ))}
                </select>
            </div>
            
            <div className="form-group">
                <label htmlFor="initialBalance">Saldo Inicial (R$):</label>
                <input
                    type="number"
                    id="initialBalance"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="Ex: 100.50"
                    step="0.01"
                    required
                />
                {isEditMode && <small>Nota: Alterar o saldo inicial aqui não recalcula transações passadas. O saldo atual da conta é afetado por transações.</small>}
            </div>
            
            <div className="form-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Conta')}
                </button>
            </div>
        </form>
    );
}
