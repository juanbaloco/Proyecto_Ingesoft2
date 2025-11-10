import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export const crearOActualizarUsuario = (userData) => {
  return async (dispatch) => {
    try {
      const { uid, email, displayName } = userData;
      
      if (!uid) {
        throw new Error("UID de usuario es requerido");
      }

      const userRef = doc(db, "usuarios", uid);
      
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await setDoc(userRef, {
          ultimaConexion: serverTimestamp(),
        }, { merge: true });
        
        console.log("Usuario actualizado:", uid);
        return { success: true, isNew: false, userId: uid };
      } else {
        const nuevoUsuario = {
          uid,
          email: email || "",
          displayName: displayName || "Usuario",
          fechaCreacion: serverTimestamp(),
          ultimaConexion: serverTimestamp(),
        };

        await setDoc(userRef, nuevoUsuario);
        
        console.log("Usuario creado exitosamente:", uid);
        return { success: true, isNew: true, userId: uid };
      }
    } catch (error) {
      console.error("Error al crear/actualizar usuario:", error);
      return { success: false, error: error.message };
    }
  };
};

export const obtenerUsuario = (userId) => {
  return async (dispatch) => {
    try {
      const userRef = doc(db, "usuarios", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { 
          success: true, 
          usuario: {
            uid: userDoc.id,
            ...userData,
            fechaCreacion: userData.fechaCreacion?.toDate().toISOString() || null,
            ultimaConexion: userData.ultimaConexion?.toDate().toISOString() || null,
          }
        };
      } else {
        return { success: false, error: "Usuario no encontrado" };
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return { success: false, error: error.message };
    }
  };
};
