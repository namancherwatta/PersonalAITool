import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react'; 

const Assistant = ({ user,setRerenderSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
        setMessages((prev) => [...prev, { role: 'bot', content: 'Please log in to use Assistant.' }]);
        return;
      }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const gtoken=localStorage.getItem("gmail_token")
      console.log(gtoken)
      const response = await fetch('http://localhost:4001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: user?.token,'googletoken': gtoken},
        body: JSON.stringify({ message: input }),
      });
     
      const data = await response.json();
      console.log(data)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.intent) {
        setRerenderSection(data.intent);
      } else if (data.reply) {
        const keywords = ["todo", "health", "mail", "calendar","doctor"];
        const matchedKeyword = keywords.find(keyword => data.reply.toLowerCase().includes(keyword));
      
        if (matchedKeyword) {
          setRerenderSection(matchedKeyword);
        }
      }
      
    } catch (error) {
      console.error('Error fetching assistant response:', error);
    }

    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white shadow-lg rounded-lg w-96 p-4 border border-gray-200 relative">
          {/* Close Button */}
          <button
            onClick={toggleChat}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          >
            <X size={20} />
          </button>

          <h3 className="text-lg font-semibold mb-2">Assistant Chat</h3>

          <div className="h-60 overflow-y-auto border p-2 mb-2">
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <p className={msg.role === 'user' ? 'text-blue-600' : 'text-gray-800'} style={{ whiteSpace: 'pre-line' }}>
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border flex-grow p-2 rounded-l"
              placeholder="Ask something..."
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded-r">Send</button>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default Assistant;
