import Admin from './pages/Admin';
import Audience from './pages/Audience';
import Home from './pages/Home';
import ManualQueue from './pages/ManualQueue';
import Profile from './pages/Profile';
import QueueManager from './pages/QueueManager';
import Terms from './pages/Terms';
import UserManagement from './pages/UserManagement';
import UploadToScreen from './pages/UploadToScreen';


export const PAGES = {
    "Admin": Admin,
    "Audience": Audience,
    "Home": Home,
    "ManualQueue": ManualQueue,
    "Profile": Profile,
    "QueueManager": QueueManager,
    "Terms": Terms,
    "UserManagement": UserManagement,
    "UploadToScreen": UploadToScreen,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};