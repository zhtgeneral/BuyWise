import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'; 

export default function HomePage() {
    const navigate = useNavigate();
    return (
        <main className="main-hero">
            <h1>Welcome to <span className="buywise-highlight">BuyWise</span></h1>
            <p>
                Our app helps shoppers streamline their experience by tailoring relevant products to their searches.
                In detail, users can message the chatbot to recieve relevant products and get help with navigating the app.
            </p>
            <p>
                Create an account, log in and begin chatting by clicking on the Create new chat button to get started!
            </p>
        </main>
    );
}