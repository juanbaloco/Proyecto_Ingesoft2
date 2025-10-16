import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
import { register } from "../slices/authSlice";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return async (dispatch) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { email, uid, displayName } = result.user;
      dispatch(register({ email, uid, displayName }));
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
    }
  };
};
