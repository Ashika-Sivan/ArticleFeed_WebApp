import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Newspaper,
  LayoutDashboard,
  FolderEdit,
  PlusCircle,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="nav-logo">
          <div className="logo-badge">
            <Newspaper size={18} />
          </div>
          <span>Chronicle</span>
        </Link>

        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/my-articles"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FolderEdit size={17} />
                <span>My Articles</span>
              </NavLink>

              <NavLink
                to="/create-article"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={17} />
                <span>Create</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Settings size={17} />
                <span>Settings</span>
              </NavLink>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    background: '#f1f5f9',
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </span>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LogIn size={17} />
                <span>Login</span>
              </NavLink>

              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
