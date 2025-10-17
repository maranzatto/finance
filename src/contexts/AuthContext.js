import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword, // Para login com email/senha
    createUserWithEmailAndPassword, // Para cadastro com email/senha
    signOut,
    setPersistence, // <<< ADICIONADO
    browserLocalPersistence, // <<< ADICIONADO
    browserSessionPersistence, // <<< ADICIONADO
    // Adicione outros provedores que você queira usar, ex: GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';
import firebaseApp from '../firebaseConfig'; // Nosso app Firebase inicializado

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para saber quando o estado de auth foi carregado

    const auth = getAuth(firebaseApp);

    // Função de Login (exemplo com email/senha)
    async function login(email, password, rememberMe = true) { // rememberMe como true por padrão
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        // Define o tipo de persistência ANTES de tentar fazer o login
        await setPersistence(auth, persistenceType);
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Função de Logout
    function logout() {
        return signOut(auth);
    }

    // Função de Cadastro (exemplo com email/senha)
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Monitora mudanças no estado de autenticação
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false); // Estado de autenticação carregado
        });

        return unsubscribe; // Limpa o listener ao desmontar o componente
    }, [auth]);

    const value = {
        currentUser,
        login,
        logout,
        signup,
        // Adicione outras funções de auth aqui se necessário
    };

    // Não renderiza os children até que o estado de autenticação seja determinado
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
