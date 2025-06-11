import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'; 

export default function HomePage() {
    const navigate = useNavigate();
    return (
        <main className="main-hero">
            <h1>Welcome to <span className="buywise-highlight">BuyWise</span></h1>
            <p>
                Please Enjoy Our Demo! 
                Click <span className="highlight-link" onClick={() => navigate('/chat')}>here</span> to begin.
            </p>
        </main>
    );
}