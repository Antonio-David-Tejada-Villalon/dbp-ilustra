import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { img } from "../api";
import { useAuth } from "../auth";
import { BottomNav, Logo, NavBar } from "../ds/ilustra";
import AssistantWidget from "./AssistantWidget";
import GoogleButton from "./GoogleButton";
import LoginDialog from "./LoginDialog";

const ACTIVE = [
  ["/descubrir", "descubrir"], ["/artistas", "artistas"], ["/artista/", "artistas"], ["/categoria/ilustracion", "ilustraciones"],
  ["/categoria/comic", "comics"], ["/categoria/manga", "manga"], ["/categoria/historieta", "historieta"], ["/comunidad", "comunidad"],
];
const BOTTOM = [["/descubrir", "descubrir"], ["/publicar", "publicar"], ["/notificaciones", "alertas"], ["/yo", "perfil"], ["/ajustes", "perfil"]];

function UserMenu({ user, onClose }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  const go = (p) => { onClose(); nav(p); };
  return (
    <div className="app-menu" role="menu">
      <div className="app-menu-head"><strong>{user.name}</strong><span>{user.handle}</span></div>
      <button role="menuitem" onClick={() => go(`/artista/${user.slug}`)}>Mi muro</button>
      <button role="menuitem" onClick={() => go("/publicar")}>Publicar</button>
      <button role="menuitem" onClick={() => go("/guardados")}>Guardados</button>
      <button role="menuitem" onClick={() => go("/ajustes")}>Ajustes y estilo del muro</button>
      {user.isStaff && <a role="menuitem" href="/admin/">Panel de administración</a>}
      <button role="menuitem" onClick={async () => { onClose(); await logout(); nav("/"); }}>Cerrar sesión</button>
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [pathname]);
  const active = (ACTIVE.find(([p]) => pathname.startsWith(p)) || [])[1];
  const bottomActive = pathname === "/" ? "inicio" : (BOTTOM.find(([p]) => pathname.startsWith(p)) || [])[1];
  const reader = pathname.startsWith("/leer/");
  const u = user ? { ...user, avatar: img(user.avatar, 400) } : null;

  return (
    <>
      <a className="app-skip" href="#main">Saltar al contenido</a>
      {!reader && (
        <div className="app-top">
          <NavBar linkAs={Link} active={active} user={u} unread={user?.unread}
            signIn={user === null ? <GoogleButton size="medium" /> : <span />}
            onSearch={(q) => nav(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar")}
            onNotifications={() => nav("/notificaciones")} onUser={() => setMenu((m) => !m)} />
          {menu && u && <UserMenu user={u} onClose={() => setMenu(false)} />}
        </div>
      )}
      <main id="main" className={reader ? "" : "app-main"}>
        <Outlet />
      </main>
      {!reader && (
        <footer className="app-footer">
          <Logo variant="horizontal" height={28} />
          <p>Una plataforma de la Dirección de Bibliotecas Populares y Actividades Literarias de San Juan.</p>
          <p className="small">Las obras pertenecen a sus autores. Prohibida su reproducción sin permiso.</p>
          <p className="small"><Link to="/privacidad">Privacidad</Link></p>
        </footer>
      )}
      {!reader && <div className="app-bottom"><BottomNav linkAs={Link} active={bottomActive} unread={user?.unread}
        hrefs={{ perfil: user ? `/artista/${user.slug}` : "/yo" }} /></div>}
      <AssistantWidget />
      <LoginDialog />
    </>
  );
}
