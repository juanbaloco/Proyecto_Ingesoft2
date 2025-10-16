import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { register, logout, checkingCredentials } from "../store/slices/authSlice";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(checkingCredentials());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        
        dispatch(register({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Usuario",
        }));
      } else {
        
        dispatch(logout());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">Cargando...</div>
      </div>
    );
  }

  return children;
};
