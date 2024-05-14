import "../../App.css"
import { useNavigate } from 'react-router-dom';

export default function mainLine({ user, userRole }) {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        console.log(userRole);

        if (user) {
            if (userRole === 'donor') {
                navigate("/dashboard");
            } else {
                navigate("/register");
                alert('Please register as a donor to make a donation.');
                
            }
        } else {
            navigate("/login");;
        }
    }


    return (
        <div className="textBox">
            <h1>SHARE AND CARE</h1>
            <p>Together we can end hunger</p>
            <button className="ExploreBtn" onClick={handleDonateClick}>
                Donate
            </button>
        </div>
    )
}