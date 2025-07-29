import { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  confirmSignUp
} from 'aws-amplify/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const name = session.tokens?.idToken?.payload?.name || '';
      const email = session.tokens?.idToken?.payload?.email || cognitoUser.username;

      setUser({
        name,
        email,
      });
    } catch (error) {
      console.log('No user signed in:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      await signOut();
      await signIn({ username: email, password });
      await checkUser(); // ahora esta función está definida correctamente
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const { user } = await signUp({
        username: email,
        password,
        attributes: { email, name }
      });
      return { success: true, user };
    } catch (error) {
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
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
