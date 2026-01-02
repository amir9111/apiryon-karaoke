import Admin from './pages/Admin';
import Audience from './pages/Audience';
import Gallery from './pages/Gallery';
import GalleryStats from './pages/GalleryStats';
import Home from './pages/Home';
import Landing from './pages/Landing';
import ManualQueue from './pages/ManualQueue';
import Profile from './pages/Profile';
import QueueManager from './pages/QueueManager';
import ReserveTable from './pages/ReserveTable';
import Statistics from './pages/Statistics';
import Terms from './pages/Terms';
import UploadToScreen from './pages/UploadToScreen';
import UserManagement from './pages/UserManagement';
import FeedbackManagement from './pages/FeedbackManagement';


export const PAGES = {
    "Admin": Admin,
    "Audience": Audience,
    "Gallery": Gallery,
    "GalleryStats": GalleryStats,
    "Home": Home,
    "Landing": Landing,
    "ManualQueue": ManualQueue,
    "Profile": Profile,
    "QueueManager": QueueManager,
    "ReserveTable": ReserveTable,
    "Statistics": Statistics,
    "Terms": Terms,
    "UploadToScreen": UploadToScreen,
    "UserManagement": UserManagement,
    "FeedbackManagement": FeedbackManagement,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};