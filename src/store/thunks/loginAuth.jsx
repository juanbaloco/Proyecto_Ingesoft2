import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { register } from "../slices/authSlice";

export const loginWithEmailAndPassword = (email, password) => {
    return async (dispatch) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const { uid, displayName } = response.user;
            dispatch(register({ email, uid, displayName }));
        } catch (error) {
            console.error('Error al iniciar sesión', error.message);
            throw new Error('Login failed');
        }
    }
}