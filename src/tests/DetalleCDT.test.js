const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", { 
    style: "currency", 
    currency: "COP", 
    maximumFractionDigits: 0 
  }).format(v || 0);

describe('DetalleCDT - Función formatCOP', () => {
  
  describe('Formateo de valores válidos', () => {
    it('debe formatear correctamente el valor 1000000', () => {
      const resultado = formatCOP(1000000);
      expect(resultado).toBe('$\u00A01.000.000');
    });

    it('debe formatear correctamente el valor 500000000', () => {
      const resultado = formatCOP(500000000);
      expect(resultado).toBe('$\u00A0500.000.000');
    });
  });
});