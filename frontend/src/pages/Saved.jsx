import { useAuth } from "../auth";
import { Button } from "../ds/ilustra";
import { usePaged, useTitle } from "../hooks";
import { PagedGrid } from "../components/Feed";
import { Empty, Loading } from "../components/States";

export default function Saved() {
  useTitle("Guardados");
  const { user, setLoginOpen } = useAuth();
  const paged = usePaged(user ? "/me/saved" : null);
  if (user === undefined) return <Loading />;
  if (!user) return <div className="app-wrap"><Empty title="Ingresá para ver tus guardados" action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} /></div>;
  return (
    <div className="app-wrap">
      <header className="app-page-head"><h1 className="display-lg m-0">Guardados</h1></header>
      <PagedGrid paged={paged} emptyTitle="Todavía no guardaste obras" emptyText="Tocá el marcador de cualquier obra para sumarla acá." />
    </div>
  );
}
