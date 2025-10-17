const getEstadoBadgeClass = (estado) => {
  switch (estado) {
    case "PENDIENTE":
      return "lista-cdt-badge lista-cdt-badge-pendiente";
    case "APROBADA":
      return "lista-cdt-badge lista-cdt-badge-aprobada";
    case "RECHAZADA":
      return "lista-cdt-badge lista-cdt-badge-rechazada";
    default:
      return "lista-cdt-badge";
  }
};

describe('getEstadoBadgeClass', () => {
  test('debe retornar la clase correcta para el estado "PENDIENTE"', () => {
    const estado = "PENDIENTE";
    const expectedClass = "lista-cdt-badge lista-cdt-badge-pendiente";
    expect(getEstadoBadgeClass(estado)).toBe(expectedClass);
  });

  test('debe retornar la clase correcta para el estado "APROBADA"', () => {
    const estado = "APROBADA";
    const expectedClass = "lista-cdt-badge lista-cdt-badge-aprobada";
    expect(getEstadoBadgeClass(estado)).toBe(expectedClass);
  });

  test('debe retornar la clase correcta para el estado "RECHAZADA"', () => {
    const estado = "RECHAZADA";
    const expectedClass = "lista-cdt-badge lista-cdt-badge-rechazada";
    expect(getEstadoBadgeClass(estado)).toBe(expectedClass);
  });


  test('debe retornar la clase base para un estado no reconocido o undefined', () => {
    const estadoNoReconocido = "EN_PROCESO"; 
    let expectedClass = "lista-cdt-badge";
    expect(getEstadoBadgeClass(estadoNoReconocido)).toBe(expectedClass);

    expect(getEstadoBadgeClass("")).toBe(expectedClass);
    
    expect(getEstadoBadgeClass(null)).toBe(expectedClass);
    
    expect(getEstadoBadgeClass(undefined)).toBe(expectedClass);
  });

  test('debe retornar la clase base si el estado no coincide exactamente (e.g., minúsculas)', () => {
    const estadoMinusculas = "pendiente";
    const expectedClass = "lista-cdt-badge";
    expect(getEstadoBadgeClass(estadoMinusculas)).toBe(expectedClass);
  });
});