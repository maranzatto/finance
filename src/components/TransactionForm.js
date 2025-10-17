import React, { useState, useEffect } from 'react';
import { addDocument, updateDocument } from '../services/firestoreService';
import { toast } from 'react-toastify'; // <<< ADICIONAR IMPORT
// Idealmente, teríamos o useAuth para pegar o currentUser.uid, mas
// por enquanto assumiremos que o userId será adicionado no firestoreService ou na TransactionsPage.

export default function TransactionForm({ onTransactionSaved, onCancel, accounts, transactionToEdit }) {
    const [type, setType] = useState('expense'); // 'expense' ou 'income'
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Data atual no formato YYYY-MM-DD
    const [description, setDescription] = useState('');
    const [accountId, setAccountId] = useState('');
    // const [category, setCategory] = useState(''); // Opcional por agora

    // const [error, setError] = useState(''); // Removido - toasts são usados para feedback de erro
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Popula o select de contas apenas se houver contas disponíveis e nenhuma estiver selecionada
        if (accounts && accounts.length > 0 && !accountId) {
            setAccountId(accounts[0].id); // Define a primeira conta como padrão
        }
    }, [accounts, accountId]);

    // Efeito para preencher o formulário quando transactionToEdit mudar
    useEffect(() => {
        if (transactionToEdit) {
            setType(transactionToEdit.type || 'expense');
            setAmount(transactionToEdit.amount?.toString() || '');
            const transactionDate = transactionToEdit.date?.toDate ? transactionToEdit.date.toDate() : new Date(transactionToEdit.date);
            setDate(transactionDate.toISOString().split('T')[0]);
            setAccountId(transactionToEdit.accountId || '');
            setDescription(transactionToEdit.description || '');
        } else {
            setType('expense');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setAccountId(accounts.length > 0 ? accounts[0].id : ''); 
            setDescription('');
            // setError(''); // Removido
        }
    }, [transactionToEdit, accounts]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        // setError(''); // Removido

        if (!accountId || !amount || !date || !description.trim()) {
            // setError('Por favor, preencha todos os campos obrigatórios.'); // Removido, toast.error já informa
            toast.error('Por favor, preencha todos os campos obrigatórios.'); 
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            // setError('O valor da transação deve ser um número positivo.'); // Removido, toast.error já informa
            toast.error('O valor da transação deve ser um número positivo.'); 
            return;
        }

        setLoading(true);
        try {
            const transactionData = {
                type,
                amount: parseFloat(amount),
                date: new Date(date + 'T00:00:00'), // Salva como Timestamp UTC meia-noite
                accountId,
                description,
                // userId já é adicionado pelo firestoreService, não precisa aqui
            };

            if (transactionToEdit) {
                await updateDocument('transactions', transactionToEdit.id, transactionData);
                // toast.success('Transação atualizada com sucesso!'); // REMOVIDO - TransactionsPage vai mostrar
            } else {
                await addDocument('transactions', transactionData);
                // toast.success('Transação adicionada com sucesso!'); // REMOVIDO - TransactionsPage vai mostrar
            }
            onTransactionSaved(); // Chama o callback em caso de sucesso
        } catch (err) {
            console.error("Error saving transaction:", err);
            // setError('Falha ao salvar transação. Tente novamente.'); // Removido, toast.error já informa
            toast.error('Falha ao salvar transação. Tente novamente.'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="transaction-form">
            {/* {error && <p className="form-error">{error}</p>} Removido, toasts cobrem os erros */}
            
            <div className="form-group">
                <label htmlFor="transFormType">Tipo:</label>
                <select id="transFormType" value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="transFormAmount">Valor (R$):</label>
                <input
                    id="transFormAmount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 50.75"
                    step="0.01"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="transFormDate">Data:</label>
                <input
                    id="transFormDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="transFormAccount">Conta:</label>
                <select id="transFormAccount" value={accountId} onChange={(e) => setAccountId(e.target.value)} required disabled={!accounts || accounts.length === 0}>
                    <option value="">{accounts && accounts.length > 0 ? "Selecione uma conta" : "Nenhuma conta disponível"}</option>
                    {accounts && accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
                {(!accounts || accounts.length === 0) && <small style={{display: 'block', color: 'orange', marginTop: '5px'}}>Você precisa cadastrar uma conta antes de adicionar transações.</small>}
            </div>

            <div className="form-group">
                <label htmlFor="transFormDesc">Descrição:</label>
                <textarea
                    id="transFormDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Compra de pão"
                    rows="3"
                    required
                />
            </div>
            
            {/* Campo de Categoria (Opcional) - Comentado corretamente 
            <div className="form-group">
                <label htmlFor="transactionCategory">Categoria (Opcional):</label>
                <input
                    type="text"
                    id="transactionCategory"
                    value={category} // Lembre-se de adicionar o estado para 'category' se for usar
                    onChange={(e) => setCategory(e.target.value)} // e a função setCategory
                    placeholder="Ex: Alimentação"
                />
            </div>
            */}
            
            <div className="form-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : (transactionToEdit ? 'Atualizar Transação' : 'Salvar Transação')}
                </button>
            </div>
        </form>
    );
}
