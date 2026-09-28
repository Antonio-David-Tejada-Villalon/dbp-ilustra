import { Link } from "react-router-dom";
import { useTitle } from "../hooks";

export default function Guide() {
  useTitle("Guía para artistas");
  return (
    <div className="app-wrap app-narrow" style={{ lineHeight: 1.6 }}>
      <header className="app-page-head">
        <div className="il-overline">Ayuda</div>
        <h1 className="display-lg m-0">Guía para artistas</h1>
      </header>

      <p>Esta guía es para ilustradores, dibujantes, historietistas y creadores de manga que quieren
      empezar a publicar en DBP Ilustra. Explica paso a paso cómo funciona el sitio, con ejemplos.</p>

      <h2>1. Entrar y activar tu perfil de artista</h2>
      <p>Ingresá con el botón <strong>«Continuar con Google»</strong>, arriba a la derecha. Después andá a
      <Link to="/ajustes"> Ajustes</Link> y activá <strong>«Soy artista»</strong> — sin esto activado podés
      mirar, comentar y seguir artistas, pero no vas a ver la opción de publicar.</p>

      <h2>2. Publicar una obra suelta (ilustración, boceto)</h2>
      <p>Andá a <Link to="/publicar">Publicar</Link>, pestaña «Obra». Completá título, categoría y
      descripción, y pegá el <strong>enlace directo</strong> a tu imagen.</p>
      <p className="body-strong m-0">¿Qué es un enlace directo?</p>
      <p>Es el link que termina en el archivo de imagen en sí (<code>.jpg</code>, <code>.png</code>,
      <code>.webp</code> o <code>.gif</code>), no una página web que la muestra adentro. Por ejemplo:</p>
      <ul>
        <li className="body-strong">Sirve: <code>https://i.imgur.com/abc123.jpg</code></li>
        <li>No sirve: <code>https://imgur.com/abc123</code> (esa es la página, no la imagen)</li>
      </ul>
      <p>Para conseguirlo: subí tu imagen a un servicio público, abrí la imagen sola a pantalla completa,
      y hacé clic derecho → «Copiar dirección de imagen».</p>
      <p><strong>¿Qué servicio usar?</strong> Recomendamos <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer">imgur.com</a> — no
      pide cuenta y suele subir más rápido que otros. <a href="https://postimages.org" target="_blank" rel="noopener noreferrer">postimages.org</a> es otra
      buena opción, también sin cuenta. Si uno anda lento en tu conexión un día, probá con el otro: la
      velocidad de subida varía según el servicio y el momento, no depende de DBP Ilustra.</p>
      <p>Formatos aceptados: JPG, PNG, WEBP o GIF (si es animado, se muestra el primer cuadro), mínimo
      200 píxeles de lado, máximo 15 MB.</p>

      <h2>3. Publicar un cómic, manga o historieta (con capítulos)</h2>
      <ol>
        <li>En Publicar, pestaña «Nueva serie»: cargá título, tipo (cómic/manga/historieta) y portada.</li>
        <li>Una vez creada, pasás automáticamente a la pestaña «Capítulo».</li>
        <li>Pegá un enlace directo de imagen por línea, en el <strong>orden de lectura</strong> (página 1
        primero, después la 2, etc.). Hasta 80 páginas por capítulo.</li>
        <li>Para agregar más capítulos después, volvé a Publicar → «Capítulo» y elegí la serie.</li>
      </ol>

      <h2>4. Cómo se protegen tus obras</h2>
      <p>El sitio <strong>nunca</strong> muestra el enlace original de tu imagen: siempre la sirve
      reducida (máx. 1600 px) en formato WEBP, y bloquea el clic derecho, el arrastre y la selección
      sobre la imagen. Esto pasa siempre, lo elijas o no.</p>
      <p>Además, en <Link to="/ajustes">Ajustes</Link> podés activar una marca de agua opcional
      («@tuusuario · DBP Ilustra» superpuesto de forma sutil) como firma extra sobre tus obras. Está
      desactivada por defecto para que se vean limpias; vos decidís si la activás.</p>
      <p>Ninguna de las dos cosas es una <strong>garantía</strong>: nada impide una captura de pantalla.
      El archivo original sigue estando donde vos lo subiste.</p>

      <h2>5. Comunidad</h2>
      <p>Con tu cuenta podés dar me gusta, comentar (y responder comentarios), seguir a otros artistas,
      guardar obras para ver después, y compartir enlaces. Si ves contenido o un comentario que no
      corresponde, usá el botón de bandera para reportarlo — lo revisa el equipo de moderación.</p>

      <h2>6. Personalizar tu muro</h2>
      <p>En <Link to="/ajustes">Ajustes</Link> podés elegir el color de acento de tu muro (violeta,
      amarillo, celeste o coral), una portada, tu biografía, ubicación y contacto público. El tema
      general del sitio (Papel, Galería, Nocturno o Automático) es por dispositivo, lo elige cada
      persona que te visita — no es parte de tu perfil.</p>

      <h2>7. El asistente del sitio</h2>
      <p>El botón de chat (abajo a la derecha) responde dudas sobre cómo funciona el sitio y te ayuda a
      encontrar obras, series o artistas. Si tu pregunta no está cubierta acá, probalo ahí.</p>

      <h2>¿Algo no funciona o tenés otra duda?</h2>
      <p>Escribinos a <a href="mailto:4vdel777@gmail.com">4vdel777@gmail.com</a>. Más detalles legales en
      <Link to="/privacidad"> Privacidad</Link> y <Link to="/terminos">Términos</Link>.</p>
    </div>
  );
}
