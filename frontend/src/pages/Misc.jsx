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

export function Terms() {
  useTitle("Términos de servicio");
  return (
    <div className="app-wrap" style={{ maxWidth: 720, lineHeight: 1.6 }}>
      <h1>Términos de servicio</h1>
      <p className="small">Última actualización: septiembre de 2026.</p>

      <p>DBP Ilustra es una plataforma de la Dirección de Bibliotecas Populares y Actividades
      Literarias de San Juan para que ilustradores, historietistas y creadores de manga publiquen
      su obra, armen su muro y conversen con el público. Al usar el sitio aceptás estos términos.</p>

      <h2>Tu cuenta</h2>
      <p>Ingresás con tu cuenta de Google. Sos responsable de lo que publiques y de la actividad
      que ocurra desde tu cuenta.</p>

      <h2>Contenido que publicás</h2>
      <ul>
        <li>Las obras te pertenecen a vos. Al publicarlas, le das a DBP Ilustra el permiso para
        mostrarlas en el sitio (reducidas y con marca de agua, como se explica en la
        Privacidad).</li>
        <li>Solo podés publicar contenido del que tengas los derechos, mediante un enlace directo
        a una imagen pública.</li>
        <li>No está permitido publicar contenido ilegal, que infrinja derechos de terceros, o que
        acose o discrimine a otras personas.</li>
      </ul>

      <h2>Moderación</h2>
      <p>El equipo de moderadores y administradores puede ocultar o quitar obras, comentarios o
      cuentas que incumplan estas reglas, y gestionar los reportes que envíe la comunidad.</p>

      <h2>Protección de las obras</h2>
      <p>El sitio reduce y marca con agua las imágenes para dificultar su descarga, pero esto es
      una medida disuasiva: nada impide una captura de pantalla. La versión original sigue siendo
      pública en el servicio donde vos la subiste.</p>

      <h2>Sin garantías</h2>
      <p>El sitio se ofrece "tal cual". No garantizamos disponibilidad continua ni la persistencia
      de los enlaces de imágenes que aloja cada artista en servicios externos.</p>

      <h2>Cambios</h2>
      <p>Podemos actualizar estos términos; vamos a cambiar la fecha de arriba cuando lo hagamos.</p>

      <h2>Contacto</h2>
      <p>Consultas a <a href="mailto:4vdel777@gmail.com">4vdel777@gmail.com</a>.</p>
    </div>
  );
}
