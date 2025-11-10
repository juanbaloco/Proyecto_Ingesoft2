import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../../firebase/config.js";
import {
  updateSolicitud,
  removeSolicitud,
  setError
} from "../slices/cdtSlice.ts";

/**
 * Actualiza el estado de una solicitud de CDT (solo para administradores)
 * Cumple con HU5: Como administrador del sistema, quiero actualizar el estado de una solicitud
 */
export const actualizarEstadoSolicitudAdmin = (userId, solicitudId, nuevoEstado) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();

      // Verificar que el usuario sea administrador
      if (auth.role !== "admin") {
        throw new Error("No tienes permisos para realizar esta acción");
      }

      if (!userId || !solicitudId) {
        throw new Error("ID de usuario o solicitud no válido");
      }

      // Validar estados permitidos
      const estadosPermitidos = ["BORRADOR", "EN_VALIDACION", "APROBADA", "RECHAZADA", "CANCELADA"];
      if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error("Estado no válido");
      }

      const solicitudRef = doc(db, "usuarios", userId, "solicitudesCDT", solicitudId);

      // Verificar que la solicitud existe
      const solicitudDoc = await getDoc(solicitudRef);
      if (!solicitudDoc.exists()) {
        throw new Error("La solicitud no existe");
      }

      const datosActualizacion = {
        estado: nuevoEstado,
        fechaActualizacion: serverTimestamp(),
        actualizadoPor: auth.uid,
        nombreAdministrador: auth.displayName,
      };

      await updateDoc(solicitudRef, datosActualizacion);

      dispatch(updateSolicitud({
        id: solicitudId,
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString(),
      }));

      console.log(`Estado actualizado a ${nuevoEstado} por administrador ${auth.displayName}`);
      return { success: true };
    } catch (error) {
      console.error("Error al actualizar estado de solicitud:", error);
      dispatch(setError(error.message || "Error al actualizar el estado"));
      return { success: false, error: error.message };
    }
  };
};

/**
 * Actualiza cualquier campo de una solicitud (solo para administradores)
 * Permite editar solicitudes en cualquier estado
 */
export const actualizarSolicitudAdmin = (userId, solicitudId, datosActualizados) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();

      if (auth.role !== "admin") {
        throw new Error("No tienes permisos para realizar esta acción");
      }

      if (!userId || !solicitudId) {
        throw new Error("ID de usuario o solicitud no válido");
      }

      const solicitudRef = doc(db, "usuarios", userId, "solicitudesCDT", solicitudId);

      const solicitudDoc = await getDoc(solicitudRef);
      if (!solicitudDoc.exists()) {
        throw new Error("La solicitud no existe");
      }

      const datosConTimestamp = {
        ...datosActualizados,
        fechaActualizacion: serverTimestamp(),
        actualizadoPor: auth.uid,
        nombreAdministrador: auth.displayName,
      };

      await updateDoc(solicitudRef, datosConTimestamp);

      dispatch(updateSolicitud({
        id: solicitudId,
        ...datosActualizados,
        fechaActualizacion: new Date().toISOString(),
      }));

      console.log(`Solicitud actualizada por administrador ${auth.displayName}`);
      return { success: true };
    } catch (error) {
      console.error("Error al actualizar solicitud:", error);
      dispatch(setError(error.message || "Error al actualizar la solicitud"));
      return { success: false, error: error.message };
    }
  };
};

/**
 * Elimina permanentemente una solicitud (solo para administradores)
 */
export const eliminarSolicitudAdmin = (userId, solicitudId) => {
  return async (dispatch, getState) => {
    try {
      const { auth } = getState();

      if (auth.role !== "admin") {
        throw new Error("No tienes permisos para realizar esta acción");
      }

      if (!userId || !solicitudId) {
        throw new Error("ID de usuario o solicitud no válido");
      }

      const solicitudRef = doc(db, "usuarios", userId, "solicitudesCDT", solicitudId);

      const solicitudDoc = await getDoc(solicitudRef);
      if (!solicitudDoc.exists()) {
        throw new Error("La solicitud no existe");
      }

      await deleteDoc(solicitudRef);
      dispatch(removeSolicitud(solicitudId));

      console.log(`Solicitud eliminada por administrador ${auth.displayName}`);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
      dispatch(setError(error.message || "Error al eliminar la solicitud"));
      return { success: false, error: error.message };
    }
  };
};
