import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Artists from "./pages/Artists";
import Artwork from "./pages/Artwork";
import Category from "./pages/Category";
import Community from "./pages/Community";
import Discover from "./pages/Discover";
import Home from "./pages/Home";
import { Me, NotFound } from "./pages/Misc";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Publish from "./pages/Publish";
import Reader from "./pages/Reader";
import Saved from "./pages/Saved";
import Search from "./pages/Search";
import Series from "./pages/Series";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="descubrir" element={<Discover />} />
        <Route path="artistas" element={<Artists />} />
        <Route path="categoria/:cat" element={<Category />} />
        <Route path="comunidad" element={<Community />} />
        <Route path="obra/:id" element={<Artwork />} />
        <Route path="artista/:handle" element={<Profile />} />
        <Route path="serie/:id" element={<Series />} />
        <Route path="leer/:id/:n" element={<Reader />} />
        <Route path="publicar" element={<Publish />} />
        <Route path="notificaciones" element={<Notifications />} />
        <Route path="guardados" element={<Saved />} />
        <Route path="ajustes" element={<Settings />} />
        <Route path="buscar" element={<Search />} />
        <Route path="yo" element={<Me />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
