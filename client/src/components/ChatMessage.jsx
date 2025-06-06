import '../styles/ChatMessage.css';

export default function ChatMessage({ speaker, text }) {
  return(
    <div className={`chat-row ${speaker}`}>
      <div className={`chat-message ${speaker}`}>
        {text}
      </div>
    </div>
  )
}