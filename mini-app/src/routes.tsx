import { Route, Routes } from "react-router";
import Search from "./features/search/search";
import About from "./features/about/about";
import Settings from "./features/settings/settings";
import Song from "./features/song/song";

class RoutesEnum {
  static Search = "/";
  static Settings = "/settings";
  static About = "/about";
  static Song = function (songId: string | null | undefined): string {
    return "/song/" + songId;
  };
}

export { RoutesEnum };

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Search />} />
      <Route path="song/:songId" element={<Song />} />
      <Route path="settings" element={<Settings />} />
      <Route path="about" element={<About />} />
    </Routes>
  );
}
export default AppRoutes;
