const validar = (form, solicitud) => {
  const m = Number(form.monto || 0);
  if (!solicitud) return "No se encontró la solicitud";
  if (!m || m < 250000 || m > 500000000) return "Monto entre $250.000 y $500.000.000";
  if (!form.plazo) return "Seleccione un plazo";
  return null;
};

describe('EditarCDT - Función validar', () => {
  let mockSolicitud;
  
  beforeEach(() => {
    mockSolicitud = {
      id: '123',
      monto: 1000000,
      plazo: 12,
      tasaInteres: 12.5
    };
  });

  describe('Validación de solicitud existente', () => {
    it('debe retornar error si no existe la solicitud', () => {
      const form = { monto: '1000000', plazo: 12, tasaInteres: 12.5 };
      const resultado = validar(form, null);
      
      expect(resultado).toBe("No se encontró la solicitud");
    });
  });
});