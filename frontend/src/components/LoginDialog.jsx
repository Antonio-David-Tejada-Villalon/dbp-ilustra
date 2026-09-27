import { useAuth } from "../auth";
import { Logo } from "../ds/ilustra";
import Dialog from "./Dialog";
import GoogleButton from "./GoogleButton";

export default function LoginDialog() {
  const { loginOpen, setLoginOpen } = useAuth();
  const close = () => setLoginOpen(false);
  return (
    <Dialog open={loginOpen} onClose={close} title="Ingresar">
      <div className="d-grid gap-3 text-center justify-items-center">
        <div className="d-flex justify-content-center"><Logo variant="vertical" height={72} /></div>
        <p className="m-0 text-muted-ink">Entrá con tu cuenta de Google para comentar, dar me gusta, guardar obras y seguir artistas.</p>
        <div className="d-flex justify-content-center"><GoogleButton onDone={close} /></div>
        <small className="text-muted-ink">Solo usamos tu nombre, correo y foto de perfil de Google.</small>
      </div>
    </Dialog>
  );
}
