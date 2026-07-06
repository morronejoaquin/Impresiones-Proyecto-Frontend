import { inject } from "@angular/core";
import { AuthService } from "./services/Auth/auth.service";

export function appInitializer() {
  return () => {
    const authService = inject(AuthService);
    // Solo se carga el perfil si hay un token guardado
    if (localStorage.getItem('accessToken')) {
      authService.initAppSession();
    }
  };
}