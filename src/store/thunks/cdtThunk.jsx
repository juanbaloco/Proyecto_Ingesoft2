import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import {
  addSolicitud,
  updateSolicitud,
  removeSolicitud,
  setSolicitudes,
  setError
} from "../slices/cdtSlice.ts";
import { crearOActualizarUsuario } from "./userThunk.jsx";

export const crearSolicitudCDT = (solicitudData) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const { uid, email, displayName } = auth;

      if (!uid) {
        throw new Error("Usuario no autenticado");
      }

      console.log("Creando/actualizando usuario en Firestore...");

      const resultadoUsuario = await dispatch(crearOActualizarUsuario({
        uid,
        email,
        displayName,
      }));

      if (!resultadoUsuario.success) {
        throw new Error("Error al crear/actualizar usuario: " + resultadoUsuario.error);
      }

      console.log("Usuario procesado correctamente");

      const solicitudesRef = collection(db, "usuarios", uid, "solicitudesCDT");

      // ✅ CALCULAR INTERESES - PASO CRÍTICO
      const monto = Number(solicitudData.monto || 0);
      const tasaInteres = Number(solicitudData.tasaInteres || 0);
      const plazo = Number(solicitudData.plazo || 0);

      console.log("Calculando intereses:", { monto, tasaInteres, plazo });

      const tasa = tasaInteres / 100;
      const plazoEnAños = plazo / 12;
      const interesEstimado = Math.round(monto * tasa * plazoEnAños);
      const totalAlVencimiento = Math.round(monto + interesEstimado);

      console.log("Intereses calculados:", { interesEstimado, totalAlVencimiento });

      // ✅ CONSTRUIR OBJETO A GUARDAR - CON INTERESES
      const nuevaSolicitud = {
        monto: monto,
        plazo: plazo,
        tasaInteres: tasaInteres,
        estado: solicitudData.estado || "BORRADOR",
        interesEstimado: interesEstimado,
        totalAlVencimiento: totalAlVencimiento,
        fechaSolicitud: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        displayName: displayName,
        email: email
      };

      console.log("Guardando solicitud en Firestore:", nuevaSolicitud);

      const docRef = await addDoc(solicitudesRef, nuevaSolicitud);

      console.log("✅ Solicitud CDT creada exitosamente:", docRef.id);

      dispatch(addSolicitud({
        id: docRef.id,
        userId: uid,
        displayName: displayName || "Usuario",
        monto: monto,
        plazo: plazo,
        tasaInteres: tasaInteres,
        estado: solicitudData.estado || "BORRADOR",
        interesEstimado: interesEstimado,
        totalAlVencimiento: totalAlVencimiento,
        fechaSolicitud: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      }));

      return { success: true, id: docRef.id, isNewUser: resultadoUsuario.isNew };
    } catch (error) {
      console.error("Error al crear solicitud CDT:", error);
      dispatch(setError(error.message || "Error al crear la solicitud"));
      return { success: false, error: error.message };
    }
  };
};

export const actualizarSolicitudCDT = (solicitudId, datosActualizados) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const { uid } = auth;

      if (!uid) {
        throw new Error("Usuario no autenticado");
      }

      const solicitudRef = doc(db, "usuarios", uid, "solicitudesCDT", solicitudId);

      // ✅ RECALCULAR INTERESES AL ACTUALIZAR
      const monto = Number(datosActualizados.monto || 0);
      const tasaInteres = Number(datosActualizados.tasaInteres || 0);
      const plazo = Number(datosActualizados.plazo || 0);

      const tasa = tasaInteres / 100;
      const plazoEnAños = plazo / 12;
      const interesEstimado = Math.round(monto * tasa * plazoEnAños);
      const totalAlVencimiento = Math.round(monto + interesEstimado);

      console.log("Actualizando solicitud con nuevos intereses:", { interesEstimado, totalAlVencimiento });

      const datosConTimestamp = {
        monto: monto,
        plazo: plazo,
        tasaInteres: tasaInteres,
        estado: datosActualizados.estado,
        interesEstimado: interesEstimado,
        totalAlVencimiento: totalAlVencimiento,
        fechaActualizacion: serverTimestamp(),
      };

      await updateDoc(solicitudRef, datosConTimestamp);

      console.log("✅ Solicitud CDT actualizada exitosamente");

      dispatch(updateSolicitud({
        id: solicitudId,
        monto: monto,
        plazo: plazo,
        tasaInteres: tasaInteres,
        estado: datosActualizados.estado,
        interesEstimado: interesEstimado,
        totalAlVencimiento: totalAlVencimiento,
        fechaActualizacion: new Date().toISOString(),
      }));

      return { success: true };
    } catch (error) {
      console.error("Error al actualizar solicitud CDT:", error);
      dispatch(setError(error.message || "Error al actualizar la solicitud"));
      return { success: false, error: error.message };
    }
  };
};

export const eliminarSolicitudCDT = (solicitudId) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const { uid } = auth;

      if (!uid) {
        throw new Error("Usuario no autenticado");
      }

      const solicitudRef = doc(db, "usuarios", uid, "solicitudesCDT", solicitudId);
      await deleteDoc(solicitudRef);

      dispatch(removeSolicitud(solicitudId));

      return { success: true };
    } catch (error) {
      console.error("Error al eliminar solicitud CDT:", error);
      dispatch(setError(error.message || "Error al eliminar la solicitud"));
      return { success: false, error: error.message };
    }
  };
};

export const cargarSolicitudesCDT = (userId) => {
  return async (dispatch) => {
    try {
      if (!userId) {
        throw new Error("userId es requerido");
      }

      const solicitudesRef = collection(db, "usuarios", userId, "solicitudesCDT");
      const querySnapshot = await getDocs(solicitudesRef);

      const solicitudes = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        solicitudes.push({
          id: doc.id,
          ...data,
          userId: userId,
          fechaSolicitud: data.fechaSolicitud?.toDate?.().toISOString() || new Date().toISOString(),
          fechaActualizacion: data.fechaActualizacion?.toDate?.().toISOString() || new Date().toISOString(),
        });
      });

      dispatch(setSolicitudes(solicitudes));

      return { success: true, solicitudes };
    } catch (error) {
      console.error("Error al cargar solicitudes CDT:", error);
      dispatch(setError(error.message || "Error al cargar las solicitudes"));
      return { success: false, error: error.message };
    }
  };
};

export const cargarTodasSolicitudesCDT = () => {
  return async (dispatch) => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const usuariosSnapshot = await getDocs(usuariosRef);

      const solicitudes = [];

      for (const usuarioDoc of usuariosSnapshot.docs) {
        const userId = usuarioDoc.id;
        const usuarioData = usuarioDoc.data();

        const solicitudesRef = collection(db, "usuarios", userId, "solicitudesCDT");
        const solicitudesSnapshot = await getDocs(solicitudesRef);

        solicitudesSnapshot.forEach((solicitudDoc) => {
          const data = solicitudDoc.data();
          solicitudes.push({
            id: solicitudDoc.id,
            ...data,
            userId: userId,
            displayName: usuarioData.displayName || "Usuario",
            fechaSolicitud: data.fechaSolicitud?.toDate?.().toISOString() || new Date().toISOString(),
            fechaActualizacion: data.fechaActualizacion?.toDate?.().toISOString() || new Date().toISOString(),
          });
        });
      }

      dispatch(setSolicitudes(solicitudes));

      return { success: true, solicitudes };
    } catch (error) {
      console.error("Error al cargar todas las solicitudes CDT:", error);
      dispatch(setError(error.message || "Error al cargar las solicitudes"));
      return { success: false, error: error.message };
    }
  };
};