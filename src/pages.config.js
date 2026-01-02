import Admin from './pages/Admin';
import Audience from './pages/Audience';
import FeedbackManagement from './pages/FeedbackManagement';
import Gallery from './pages/Gallery';
import GalleryStats from './pages/GalleryStats';
import Home from './pages/Home';
import Landing from './pages/Landing';
import ManualQueue from './pages/ManualQueue';
import Profile from './pages/Profile';
import ReserveTable from './pages/ReserveTable';
import Statistics from './pages/Statistics';
import Terms from './pages/Terms';
import UploadToScreen from './pages/UploadToScreen';
import UserManagement from './pages/UserManagement';
import AdminLogs from './pages/AdminLogs';


export const PAGES = {
    "Admin": Admin,
    "Audience": Audience,
    "FeedbackManagement": FeedbackManagement,
    "Gallery": Gallery,
    "GalleryStats": GalleryStats,
    "Home": Home,
    "Landing": Landing,
    "ManualQueue": ManualQueue,
    "Profile": Profile,
    "ReserveTable": ReserveTable,
    "Statistics": Statistics,
    "Terms": Terms,
    "UploadToScreen": UploadToScreen,
    "UserManagement": UserManagement,
    "AdminLogs": AdminLogs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};