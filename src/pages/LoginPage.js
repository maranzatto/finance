import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // <<< IMPORT CSS

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true); // <<< ADICIONADO ESTADO
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const { login, signup } = useAuth(); // currentUser não é mais necessário aqui diretamente
    const navigate = useNavigate(); // Adicionado

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password, rememberMe); // <<< rememberMe PASSADO AQUI
                navigate('/', { replace: true }); // Redireciona para a rota principal
            } else {
                await signup(email, password);
                navigate('/', { replace: true }); // Redireciona para a rota principal
            }
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        }
        setLoading(false);
    }

    function getFriendlyErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Formato de e-mail inválido.';
            case 'auth/user-disabled':
                return 'Este usuário foi desabilitado.';
            case 'auth/user-not-found':
                return 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.';
            case 'auth/wrong-password':
                return 'Senha incorreta.';
            case 'auth/email-already-in-use':
                return 'Este e-mail já está em uso. Tente fazer login.';
            case 'auth/weak-password':
                return 'Senha muito fraca. A senha deve ter pelo menos 6 caracteres.';
            default:
                return 'Falha ao autenticar. Tente novamente mais tarde.';
        }
    }

    // A lógica de redirecionamento se o usuário já estiver logado agora é tratada pelo PublicRoute em App.js

    return (
        <div className="login-page-container">
            <div className="login-form-container">
                <h2>{isLogin ? 'Login' : 'Cadastro'}</h2>
                {error && <p className="login-page-error">{error}</p>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Senha:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {isLogin && (
                        <div className="form-group form-group-checkbox"> {/* Adicionada classe form-group para consistência e form-group-checkbox para estilo específico */}
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe" className="checkbox-label">Manter conectado</label> {/* Adicionada classe para o label */}
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="btn btn-primary btn-submit">
                        {loading ? 'Processando...' : (isLogin ? 'Login' : 'Cadastrar')}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} disabled={loading} className="login-toggle-button">
                    {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
                </button>
            </div>
        </div>
    );
}
