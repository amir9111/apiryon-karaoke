import Admin from './pages/Admin';
import Audience from './pages/Audience';
import Home from './pages/Home';
import ManualQueue from './pages/ManualQueue';
import Profile from './pages/Profile';
import QueueManager from './pages/QueueManager';
import Statistics from './pages/Statistics';
import Terms from './pages/Terms';
import UploadToScreen from './pages/UploadToScreen';
import UserManagement from './pages/UserManagement';
import Landing from './pages/Landing';
import ReserveTable from './pages/ReserveTable';


export const PAGES = {
    "Admin": Admin,
    "Audience": Audience,
    "Home": Home,
    "ManualQueue": ManualQueue,
    "Profile": Profile,
    "QueueManager": QueueManager,
    "Statistics": Statistics,
    "Terms": Terms,
    "UploadToScreen": UploadToScreen,
    "UserManagement": UserManagement,
    "Landing": Landing,
    "ReserveTable": ReserveTable,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};