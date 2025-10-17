import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSelectedAccount } from '../contexts/SelectedAccountContext'; // Importar
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css'; 

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { selectedAccount, accountBalance, loadingBalance } = useSelectedAccount(); // Usar contexto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Pague Finanças</Link>
      </div>

      {currentUser && (
        <>
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul className="navbar-nav">
              <li><NavLink to="/" onClick={toggleMobileMenu} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink></li>
              <li><NavLink to="/contas" onClick={toggleMobileMenu} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Contas</NavLink></li>
              <li><NavLink to="/transacoes" onClick={toggleMobileMenu} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Transações</NavLink></li>
            </ul>
            
            <div className="navbar-user-info">
              {selectedAccount && (
                <div className="navbar-balance">
                  <span className="balance-label">{selectedAccount.name}: </span>
                  {loadingBalance ? (
                    <span className="balance-value loading">Calculando...</span>
                  ) : (
                    <span className={`balance-value ${accountBalance < 0 ? 'negative' : ''}`}>
                      {formatCurrency(accountBalance)}
                    </span>
                  )}
                </div>
              )}
              {/* Mantém a seção de usuário e logout separada, mas dentro de navbar-user-info para agrupamento */}
              <div className="navbar-user-section">
                  {currentUser.email && <span className="navbar-user-email">{currentUser.email}</span>}
                  <button onClick={handleLogout} className="btn btn-secondary btn-logout">
                    Logout
                  </button>
              </div>
            </div>

          </div>
        </>
      )}
    </nav>
  );
}
