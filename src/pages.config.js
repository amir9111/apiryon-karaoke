import Home from './pages/Home';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import Audience from './pages/Audience';
import Profile from './pages/Profile';
import SongManager from './pages/SongManager';
import Player from './pages/Player';
import SendMessage from './pages/SendMessage';


export const PAGES = {
    "Home": Home,
    "Admin": Admin,
    "Terms": Terms,
    "Audience": Audience,
    "Profile": Profile,
    "SongManager": SongManager,
    "Player": Player,
    "SendMessage": SendMessage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};