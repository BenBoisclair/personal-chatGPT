import { signOut } from "firebase/auth";
import { auth } from '../firebase';

const LogOut = () => {

    const handleClick = () => {
        signOut(auth)
            .then(() => {
                console.log('Signed Out');
            })
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        window.location.reload();
    }

    return (
        <div className="side-menu-button log-out-button" onClick={handleClick}>
            Log Out
        </div>
    )
}

export default LogOut;