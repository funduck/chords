import { Route, Routes } from "react-router";
import Search from "./features/search/search";
import Song from "./features/song/song";
import Room from "./features/room/room";

class RoutesEnum {
  static Search = "/";
  static Room = "/room";
  // static Settings = "/settings";
  // static About = "/about";
  static Song = function (songId?: string): string {
    if (songId == null) {
      return "/song";
    }
    return "/song/" + songId;
  };
}

export { RoutesEnum };

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Search />} />
      <Route path="room" element={<Room />} />
      <Route path="song" element={<Song />} />
      <Route path="song/:songId" element={<Song />} />
      {/* <Route path="settings" element={<Settings />} />
      <Route path="about" element={<About />} /> */}
    </Routes>
  );
}
export default AppRoutes;
