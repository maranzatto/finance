import { db } from '../firebaseConfig';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    // Outros imports do Firestore conforme necessário: serverTimestamp, etc.
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Para pegar o userId

// Função para pegar o ID do usuário logado
const getCurrentUserId = () => {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
};

/**
 * Adiciona um novo documento a uma coleção, incluindo automaticamente o userId e createdAt.
 * @param {string} collectionName - O nome da coleção.
 * @param {object} data - O objeto de dados a ser adicionado.
 * @returns {Promise<string>} O ID do documento adicionado.
 */
export const addDocument = async (collectionName, data) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            userId: userId,
            createdAt: Timestamp.now() // Adiciona um timestamp de quando o doc foi criado
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e; // Re-throw para que o chamador possa tratar o erro
    }
};

/**
 * Busca todos os documentos de uma coleção que pertencem ao usuário logado.
 * @param {string} collectionName - O nome da coleção.
 * @param {object} [orderByOptions] - Opcional. Objeto com { field: string, direction: 'asc' | 'desc' }.
 * @returns {Promise<Array>} Uma array de documentos (cada um com seu id).
 */
/**
 * Busca documentos de uma coleção que pertencem ao usuário logado, 
 * permitindo filtros e ordenação adicionais.
 * @param {string} collectionName - O nome da coleção.
 * @param {Array<object>} [additionalConstraints=[]] - Opcional. Array de objetos de restrição de consulta, 
 *                                                  cada um com { field: string, operator: string, value: any }.
 * @param {object} [orderByOptions] - Opcional. Objeto com { field: string, direction: 'asc' | 'desc' }.
 * @returns {Promise<Array>} Uma array de documentos (cada um com seu id).
 */
export const getCollection = async (collectionName, additionalConstraints = [], orderByOptions) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    try {
        const queryArgs = [collection(db, collectionName)];
        
        // Adiciona o filtro padrão de userId
        queryArgs.push(where("userId", "==", userId));

        // Adiciona outras restrições de consulta (filtros)
        if (additionalConstraints && additionalConstraints.length > 0) {
            additionalConstraints.forEach(constraint => {
                queryArgs.push(where(constraint.field, constraint.operator, constraint.value));
            });
        }

        // Adiciona ordenação
        if (orderByOptions && orderByOptions.field) {
            queryArgs.push(orderBy(orderByOptions.field, orderByOptions.direction || 'asc'));
        }
        
        const q = query(...queryArgs);
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return documents;
    } catch (e) {
        console.error("Error getting collection: ", e);
        throw e;
    }
};

/**
 * Busca um único documento pelo seu ID.
 * @param {string} collectionName - O nome da coleção.
 * @param {string} documentId - O ID do documento.
 * @returns {Promise<object|null>} O documento (com seu id) ou null se não encontrado.
 */
export const getDocument = async (collectionName, documentId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
    
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Verifica se o documento pertence ao usuário logado
            if (docSnap.data().userId === userId) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.warn("Tentativa de acesso a documento não autorizado.");
                return null; // Ou lançar um erro de permissão
            }
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw e;
    }
};

/**
 * Atualiza um documento existente.
 * @param {string} collectionName - O nome da coleção.
 * @param {string} documentId - O ID do documento a ser atualizado.
 * @param {object} dataToUpdate - Os campos a serem atualizados.
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, documentId, dataToUpdate) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    // Poderíamos adicionar uma verificação para garantir que o usuário só atualize seus próprios docs.
    // Isso também é reforçado pelas regras de segurança do Firestore.
    try {
        const docRef = doc(db, collectionName, documentId);
        // Antes de atualizar, verificar se o doc pertence ao usuário (opcional aqui, mas bom para feedback)
        // const existingDoc = await getDoc(docRef);
        // if (!existingDoc.exists() || existingDoc.data().userId !== userId) {
        //     throw new Error("Documento não encontrado ou não autorizado para atualização.");
        // }
        await updateDoc(docRef, {
            ...dataToUpdate,
            updatedAt: Timestamp.now() // Adiciona/atualiza um timestamp de quando foi modificado
        });
        console.log("Document successfully updated!");
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

/**
 * Deleta um documento.
 * @param {string} collectionName - O nome da coleção.
 * @param {string} documentId - O ID do documento a ser deletado.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, documentId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
    
    // Similar ao update, verificar propriedade antes de deletar pode ser uma boa prática no client-side.
    try {
        const docRef = doc(db, collectionName, documentId);
        // const existingDoc = await getDoc(docRef);
        // if (!existingDoc.exists() || existingDoc.data().userId !== userId) {
        //     throw new Error("Documento não encontrado ou não autorizado para deleção.");
        // }
        await deleteDoc(docRef);
        console.log("Document successfully deleted!");
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};

// Poderíamos adicionar funções mais específicas aqui, por exemplo:
// export const getAccounts = () => getCollection('accounts');
// export const addAccount = (data) => addDocument('accounts', data);
// etc.
