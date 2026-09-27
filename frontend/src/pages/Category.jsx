import { Link, useParams } from "react-router-dom";
import { CATEGORIES, SectionHeader, ScrollRow } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { PagedGrid, SeriesCard } from "../components/Feed";
import { Empty } from "../components/States";

const SERIAL = { comic: "Series de cómic", manga: "Series de manga", historieta: "Series de historieta" };
const INTRO = {
  ilustracion: "Ilustración digital y tradicional de artistas de San Juan.",
  comic: "Cómics y novelas gráficas, por capítulos y en páginas sueltas.",
  manga: "Manga y estilos inspirados en el cómic japonés.",
  historieta: "La historieta, con sello propio.",
  boceto: "Procesos, estudios y cuadernos de bocetos.",
};

export default function Category() {
  const { cat } = useParams();
  const label = CATEGORIES[cat];
  useTitle(label);
  const series = useApi(SERIAL[cat] ? `/series?category=${cat}` : null);
  const paged = usePaged(label ? `/artworks?category=${cat}&sort=recent` : null);
  if (!label) return <div className="app-wrap"><Empty title="Esa categoría no existe" action={<Link to="/descubrir">Ir a Descubrir</Link>} /></div>;
  return (
    <div className="app-wrap">
      <header className="app-page-head">
        <div className="il-overline">Categoría</div>
        <h1 className="display-lg m-0">{label}</h1>
        <p className="body-lg m-0 text-muted-ink">{INTRO[cat]}</p>
      </header>
      {SERIAL[cat] && series.data?.items?.length > 0 && (
        <section><SectionHeader title={SERIAL[cat]} /><ScrollRow itemWidth={220}>{series.data.items.map((s) => <SeriesCard key={s.id} s={s} />)}</ScrollRow></section>
      )}
      <section>
        <SectionHeader title={SERIAL[cat] ? "Páginas y piezas sueltas" : "Obras recientes"} />
        <PagedGrid paged={paged} emptyTitle="Todavía no hay obras en esta categoría" />
      </section>
    </div>
  );
}
