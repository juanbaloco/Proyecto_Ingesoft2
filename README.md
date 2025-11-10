# NeoCDT - Sistema de Gestión de CDTs

Módulo bancario de NeoBank para la gestión de Certificados de Depósito a Término (CDT) desarrollado con React, Redux Toolkit y Firebase.

##  Integrantes del Grupo

- **Juan Andrés Montealegre Calambas** - 2230021 - juan_and.montealegre@uao.edu.co
- **Diego Alejandro Quintero Miranda** - 2235621 - diego.quintero@uao.edu.co
- **Santiago Torralba Alape** - 2230608 - santiago.torralba@uao.edu.co
- **Juan José Baloco Sánchez** - 2230722 - juan.baloco@uao.edu.co
- **Sergio Talero Guzmán** - 2225163 - sergio.talero@uao.edu.co

---

## Tecnologías Principales

- **React 19.1.1** + **Vite 7.1.7** - Frontend
- **Redux Toolkit 2.9.0** - Gestión de estado
- **Firebase 12.4.0** - Backend (Authentication + Firestore)
- **Jest 30.2.0** + **React Testing Library** - Testing

---

## Cómo Ejecutar el Proyecto

### Requisitos Previos
- Node.js 18.x o superior
- npm 9.x o superior

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev
# La aplicación estará en http://localhost:5173
```

### Comandos Disponibles

```bash
npm run dev       # Ejecutar en modo desarrollo con Vite
npm run build     # Compilar para producción
npm run preview   # Previsualizar build de producción
npm test          # Ejecutar pruebas unitarias con Jest y cobertura
npm run e2etest   # Ejecutar pruebas end-to-end con Playwright
npm run lint      # Verificar código con ESLint
npm run lint:fix  # Corregir problemas de código automáticamente
```

---

## Supuestos del Proyecto

1. **Usuarios Autenticados**: Solo usuarios autorizados pueden gestionar CDTs
2. **Datos Privados**: Cada usuario solo accede a sus propios CDTs
3. **Conexión Internet**: Requiere conexión constante para funcionar
4. **Firebase Activo**: Servicios de Firebase disponibles y configurados
5. **Navegadores Modernos**: Chrome, Firefox, Safari o Edge actualizados

---

## Decisiones de Diseño

### 1. Redux Toolkit para Estado Global
**Razón**: Manejo eficiente de estado complejo, DevTools para debugging, y middleware para operaciones asíncronas.

### 2. Firebase como Backend
**Razón**: Reduce tiempo de desarrollo, autenticación robusta incluida, escalabilidad automática, y bajo costo para proyectos académicos.

### 3. Vite como Build Tool
**Razón**: Desarrollo más rápido con Hot Module Replacement, builds eficientes, y mejor rendimiento que Create React App.

### 4. Protected Routes
**Razón**: Centraliza la lógica de autorización, es reutilizable y fácil de mantener.

### 5. Jest + React Testing Library
**Razón**: Estándar de la industria, enfoque en pruebas desde la perspectiva del usuario, y excelente documentación.

---

## Resultados de Pruebas

### Resumen General
```
Test Suites: 14 passed, 14 total
Tests:       88 passed, 88 total
Time:        2.931 s
```

### Cobertura de Código

| Componente            | % Stmts | % Branch | % Funcs | % Lines | Estado |
|-----------------------|---------|----------|---------|---------|--------|
| AdminDashboard.jsx    | 100%    | 100%     | 100%    | 100%    | ✅     |
| AdminRoute.jsx        | 87.5%   | 75%      | 100%    | 85.71%  | ✅     |
| AuthProvider.jsx      | 100%    | 83.33%   | 100%    | 100%    | ✅     |
| Dashboard.jsx         | 100%    | 100%     | 100%    | 100%    | ✅     |
| DetalleCDT.jsx        | 89.36%  | 82.85%   | 75%     | 88.37%  | ✅     |
| Footer.jsx            | 100%    | 100%     | 100%    | 100%    | ✅     |
| FormularioCDT.jsx     | 100%    | 92.72%   | 100%    | 100%    | ✅     |
| InitAdmin.jsx         | 100%    | 92.85%   | 100%    | 100%    | ✅     |
| ListaCDT.jsx          | 97.82%  | 76.47%   | 100%    | 97.56%  | ✅     |
| login.jsx             | 93.02%  | 95.83%   | 85.71%  | 95.23%  | ✅     |
| registro.jsx          | 90.47%  | 89.47%   | 100%    | 90.24%  | ✅     |
| ProtectedRoute.jsx    | 83.33%  | 50%      | 100%    | 100%    | ✅     |
| **Cobertura Total**   | **79.29%** | **74.16%** | **81.08%** | **78.51%** | ✅ |

**Componentes con cobertura excelente (>90%):**
- ✅ AdminDashboard: Panel administrativo completo
- ✅ AuthProvider: Manejo de contexto de autenticación
- ✅ Dashboard: Navegación y rutas principales
- ✅ Footer: Componente presentacional
- ✅ FormularioCDT: Creación de solicitudes de CDT
- ✅ InitAdmin: Inicialización de administrador
- ✅ ListaCDT: Listado de solicitudes
- ✅ Login: Autenticación de usuarios
- ✅ Registro: Validación de formulario y creación de usuarios

---

## Métricas de Escenarios

### 1. HU1 - Inicio de Sesión Seguro
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Tiempo de autenticación | ~600ms | < 1.5s | ✅ |
| Validación de credenciales | 100% | 100% | ✅ |
| Persistencia de sesión | Sí | Sí | ✅ |
| Redirección automática | Sí | Sí | ✅ |
| Mensajes de error claros | Sí | Sí | ✅ |

**Pruebas E2E implementadas:**
- ✅ Login con credenciales válidas y acceso al dashboard
- ✅ Mensajes de error con credenciales inválidas
- ✅ Persistencia de sesión tras recargar página
- ✅ Redirección a login si no está autenticado

### 2. HU2 - Registrar Nueva Solicitud de CDT
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Tiempo de creación | ~1.2s | < 3s | ✅ |
| Validación de campos | 100% | 100% | ✅ |
| Persistencia en BD | 100% | 100% | ✅ |
| Confirmación visual | Sí | Sí | ✅ |

**Campos requeridos:** Producto, Monto, Plazo

**Pruebas E2E implementadas:**
- ✅ Visualización del formulario de nueva solicitud
- ✅ Ingreso de monto, plazo y tasa válidos
- ✅ Validación de campos vacíos o inválidos
- ✅ Confirmación de solicitud creada

### 3. HU3 - Listado de Solicitudes CDT
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Tiempo de carga | ~800ms | < 2s | ✅ |
| Visualización de solicitudes | 100% | 100% | ✅ |
| Funcionalidad de búsqueda | Sí | Sí | ✅ |
| Restricción de acceso | Sí | Sí | ✅ |

**Pruebas E2E implementadas:**
- ✅ Visualización de todas las solicitudes del cliente
- ✅ Búsqueda por monto de solicitud
- ✅ Restricción de acceso sin autenticación

### 4. HU4 - Modificar Solicitud CDT en Borrador
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Tiempo de carga | ~500ms | < 1s | ✅ |
| Tiempo de actualización | ~800ms | < 2s | ✅ |
| Pre-llenado de formulario | 100% | 100% | ✅ |
| Validación de cambios | Sí | Sí | ✅ |

**Pruebas E2E implementadas:**
- ✅ Edición de solicitud en borrador
- ✅ Actualización de monto y plazo
- ✅ Confirmación de cambios guardados

### 5. HU5 - Actualizar Estado de Solicitud (Admin)
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Cambio de estado | ~600ms | < 1.5s | ✅ |
| Confirmación requerida | Sí | Sí | ✅ |
| Restricción por rol | Sí | Sí | ✅ |
| Filtrado de solicitudes | Sí | Sí | ✅ |

**Estados disponibles:** Aprobada, Rechazada

**Pruebas E2E implementadas:**
- ✅ Cambio de estado a Aprobada
- ✅ Cambio de estado a Rechazada
- ✅ Restricción a usuarios sin rol de administrador
- ✅ Filtrado de solicitudes por monto

### 6. HU6 - Borrar Selección de Solicitud CDT
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Limpieza de formulario | Inmediata | Inmediata | ✅ |
| Campos limpiados | 100% | 100% | ✅ |
| Confirmación visual | Sí | Sí | ✅ |

**Pruebas E2E implementadas:**
- ✅ Cancelación de solicitud en curso
- ✅ Limpieza completa de campos del formulario

### 7. Protección de Rutas
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Verificación de auth | 100% | 100% | ✅ |
| Redirección automática | Inmediata | Inmediata | ✅ |
| Loader durante verificación | Sí | Sí | ✅ |

### Métricas de Rendimiento General
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| First Contentful Paint | ~1.2s | < 2s | ✅ |
| Time to Interactive | ~2.5s | < 4s | ✅ |
| Bundle Size (JS) | ~450KB | < 500KB | ✅ |
| Lighthouse Performance | ~85 | > 80 | ✅ |

### Resumen de Pruebas E2E (Playwright)
| Escenario | Tests | Estado |
|-----------|-------|--------|
| Login (HU1) | 4 | ✅ |
| Crear CDT (HU2) | 3 | ✅ |
| Listar CDT (HU3) | 3 | ✅ |
| Editar CDT (HU4) | 1 | ✅ |
| Admin - Actualizar (HU5) | 4 | ✅ |
| Borrar Selección (HU6) | 1 | ✅ |
| **Total** | **16** | **✅** |

---

**Última actualización**: Noviembre 2025
