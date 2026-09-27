import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Button } from "../ds/ilustra";
import { useTitle } from "../hooks";
import { Empty, Loading } from "../components/States";

export function Me() {
  const { user, setLoginOpen } = useAuth();
  if (user === undefined) return <Loading />;
  if (user) return <Navigate to={`/artista/${user.slug}`} replace />;
  return <div className="app-wrap"><Empty title="Ingresá para ver tu perfil" action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} /></div>;
}

export function NotFound() {
  useTitle("Página no encontrada");
  return <div className="app-wrap"><Empty title="No encontramos esta página" text="Puede que el enlace esté roto o que el contenido se haya quitado."
    action={<Link to="/"><Button>Volver al inicio</Button></Link>} /></div>;
}
