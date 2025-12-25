import Admin from './pages/Admin';
import Audience from './pages/Audience';
import EventProducer from './pages/EventProducer';
import Home from './pages/Home';
import ManualQueue from './pages/ManualQueue';
import Player from './pages/Player';
import Profile from './pages/Profile';
import QueueManager from './pages/QueueManager';
import SongManager from './pages/SongManager';
import Terms from './pages/Terms';


export const PAGES = {
    "Admin": Admin,
    "Audience": Audience,
    "EventProducer": EventProducer,
    "Home": Home,
    "ManualQueue": ManualQueue,
    "Player": Player,
    "Profile": Profile,
    "QueueManager": QueueManager,
    "SongManager": SongManager,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};