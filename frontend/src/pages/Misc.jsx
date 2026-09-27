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

export function Privacy() {
  useTitle("Privacidad");
  return (
    <div className="app-wrap" style={{ maxWidth: 720, lineHeight: 1.6 }}>
      <h1>Política de privacidad</h1>
      <p className="small">Última actualización: septiembre de 2026.</p>

      <p>DBP Ilustra es una plataforma de la Dirección de Bibliotecas Populares y Actividades
      Literarias de San Juan para que ilustradores, historietistas y creadores de manga publiquen
      su obra. Esta página explica qué datos usa el sitio y para qué.</p>

      <h2>Qué datos recogemos</h2>
      <ul>
        <li><strong>Al ingresar con Google:</strong> tu nombre, email y foto de perfil, para crear
        tu cuenta.</li>
        <li><strong>Datos que cargás vos:</strong> usuario, bio, ubicación, disciplinas y contacto
        público, si los completás en tu perfil.</li>
        <li><strong>Contenido que publicás:</strong> obras (enlaces a imágenes), series, comentarios,
        me gusta, a quién seguís y reportes que envíes.</li>
        <li><strong>Cookie de sesión:</strong> una cookie técnica (<code>ilustra_session</code>),
        necesaria para mantenerte identificado. No usamos cookies de publicidad ni de seguimiento
        de terceros.</li>
        <li><strong>Asistente del sitio:</strong> si le hacés una pregunta, el texto se envía a la
        API de Gemini (Google) junto con información pública del sitio para generar una respuesta.</li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>Para que puedas ingresar, publicar y participar de la comunidad (comentarios, seguir,
      notificaciones), para moderar el contenido publicado, y para que el asistente pueda responder
      preguntas sobre el sitio.</p>

      <h2>Con quién los compartimos</h2>
      <p>Con Google, únicamente para el ingreso con tu cuenta y para el funcionamiento del
      asistente (API de Gemini). No vendemos ni compartimos tus datos con terceros de publicidad —
      el sitio no tiene analítica ni anuncios.</p>

      <h2>Protección de las obras</h2>
      <p>Las imágenes que publicás nunca se muestran desde tu enlace original: se sirven reducidas,
      en formato WEBP y con marca de agua, para dificultar su descarga.</p>

      <h2>Tus derechos</h2>
      <p>Podés pedir acceder, corregir o eliminar tus datos y tu cuenta escribiéndonos a{" "}
      <a href="mailto:4vdel777@gmail.com">4vdel777@gmail.com</a>. Como sitio de un organismo
      público de San Juan, tratamos tus datos conforme a la Ley 25.326 de Protección de Datos
      Personales de la República Argentina.</p>

      <h2>Cambios a esta política</h2>
      <p>Si actualizamos esta página, vamos a cambiar la fecha de arriba.</p>
    </div>
  );
}
