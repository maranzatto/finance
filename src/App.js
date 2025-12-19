import "./App.css";
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // useAuth importado aqui
import { SelectedAccountProvider } from "./contexts/SelectedAccountContext";
import LoginPage from "./pages/LoginPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import Navbar from "./components/Navbar";

// Componente para o conteúdo principal (Dashboard, etc.)
function MainAppContent() {
    return (
        <div className="App-header">
            <h1>Bem-vindo ao Pague Finanças!</h1>
            <p>Selecione uma opção no menu acima para começar.</p>
        </div>
    );
}

// Componente para rotas privadas
function PrivateRoute({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" replace />;
}

// Componente para rotas públicas
function PublicRoute({ children }) {
    const { currentUser } = useAuth();
    return !currentUser ? children : <Navigate to="/" replace />;
}

// Novo componente para organizar a lógica de renderização do App
function AppContent() {
    const { currentUser } = useAuth();

    return (
        <div className="App">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {currentUser && <Navbar />}
            <div
                className={
                    currentUser ? "main-content" : "main-content-logged-out"
                }
            >
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={<MainAppContent />}
                                    />
                                    <Route
                                        path="contas"
                                        element={<AccountsPage />}
                                    />
                                    <Route
                                        path="transacoes"
                                        element={<TransactionsPage />}
                                    />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/" replace />}
                                    />
                                </Routes>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <SelectedAccountProvider>
                    <AppContent />
                </SelectedAccountProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
