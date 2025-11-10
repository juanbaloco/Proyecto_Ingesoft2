import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { AdminRoute } from "../components/AdminRoute";

const mockStore = configureStore([]);

describe("AdminRoute", () => {
  test("redirige a login si no autenticado", () => {
    const store = mockStore({ auth: { status: "not-authenticated", role: null } });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminRoute>
            <div>Contenido admin</div>
          </AdminRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByText(/contenido admin/i)).not.toBeInTheDocument();
  });

  test("renderiza children si es admin autenticado", () => {
    const store = mockStore({ auth: { status: "authenticated", role: "admin" } });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminRoute>
            <div>Contenido admin</div>
          </AdminRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/contenido admin/i)).toBeInTheDocument();
  });
});
