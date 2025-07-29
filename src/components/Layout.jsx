import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { signOut, fetchAuthSession } from 'aws-amplify/auth';

function Layout() {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ name: '', email: '', initial: '?' });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const session = await fetchAuthSession();
        const claims = session.tokens?.idToken?.payload;

        const name = claims?.name || claims?.email?.split('@')[0] || 'Usuario';
        const email = claims?.email || '';
        const initial = name.charAt(0).toUpperCase();

        setUserInfo({ name, email, initial });
      } catch (error) {
        console.warn('No se pudo obtener la sesión de usuario:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="bg-orange-500 text-white p-4">
          <h1 className="text-lg font-bold">Sistema de Reservas</h1>
        </div>

        <nav className="mt-4">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === '/dashboard'
                ? 'bg-orange-100 border-r-4 border-orange-500'
                : ''
            }`}
          >
            <span className="mr-3">📅</span>
            Inicio
          </Link>
          <Link
            to="/reservations"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === '/reservations'
                ? 'bg-orange-100 border-r-4 border-orange-500'
                : ''
            }`}
          >
            <span className="mr-3">🔒</span>
            Mis Reservas
          </Link>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              {userInfo.initial}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Adriana González</p>
              <p className="text-xs text-gray-500">snoopydigitaldiary@gmail.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <span className="mr-2">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
