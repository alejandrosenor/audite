import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import Auth from "./pages/Auth/Auth";
import Discover from "./pages/Discover";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Listening from "./pages/Listening";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Songs from "./pages/Songs";
import ToListen from "./pages/ToListen";
import Review from "./pages/Review";
import Achievements from "./pages/Achievements";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/to-listen" element={<ToListen />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/library" element={<Library />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review/:userAlbumId" element={<Review />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/achievements" element={<Achievements />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;