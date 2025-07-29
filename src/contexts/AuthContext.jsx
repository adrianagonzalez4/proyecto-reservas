import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp } from 'aws-amplify/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica el usuario actual al cargar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.log('No user signed in:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signIn({ username: email, password });
      console.log('Sign in result:', result);

      // Obtener el usuario después del login
      const userData = await getCurrentUser();
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      console.log('📝 Registrando usuario:', email);
      const { user } = await signUp({
        username: email,
        password,
        attributes: {
          email,
          name
        }
      });
      console.log('✅ Usuario registrado, necesita confirmación:', user);
      return { success: true, user, needsConfirmation: true };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, message: error.message };
    }
  };

  const confirmSignUpCode = async (email, code) => {
    try {
      console.log('🔐 Confirmando código para:', email);
      await confirmSignUp({ username: email, confirmationCode: code });
      console.log('✅ Cuenta confirmada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error confirmando código:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    confirmSignUpCode,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
