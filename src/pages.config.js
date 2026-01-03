import Admin from './pages/Admin';
import AdminLogs from './pages/AdminLogs';
import Audience from './pages/Audience';
import FeedbackManagement from './pages/FeedbackManagement';
import Gallery from './pages/Gallery';
import GalleryStats from './pages/GalleryStats';
import Home from './pages/Home';
import Landing from './pages/Landing';
import ManualQueue from './pages/ManualQueue';
import Profile from './pages/Profile';
import QRDisplay from './pages/QRDisplay';
import ReserveTable from './pages/ReserveTable';
import Statistics from './pages/Statistics';
import Terms from './pages/Terms';
import UploadToScreen from './pages/UploadToScreen';
import UserManagement from './pages/UserManagement';


export const PAGES = {
    "Admin": Admin,
    "AdminLogs": AdminLogs,
    "Audience": Audience,
    "FeedbackManagement": FeedbackManagement,
    "Gallery": Gallery,
    "GalleryStats": GalleryStats,
    "Home": Home,
    "Landing": Landing,
    "ManualQueue": ManualQueue,
    "Profile": Profile,
    "QRDisplay": QRDisplay,
    "ReserveTable": ReserveTable,
    "Statistics": Statistics,
    "Terms": Terms,
    "UploadToScreen": UploadToScreen,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};