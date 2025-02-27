import React, { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GmailSection = ({ userEmail, dummyEmails,setGoogleToken,onLogout,rerenderSection,setRerenderSection }) => {
  const [emails, setEmails] = useState([]);
  const [token, setToken] = useState(null);
  const [replyTo, setReplyTo] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyMessageId, setReplyMessageId] = useState("");
  const [replyThreadId, setReplyThreadId] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem("gmail_token", tokenResponse.access_token);
      fetchEmails(tokenResponse.access_token);
      setToken(tokenResponse.access_token);
      setGoogleToken(tokenResponse.access_token)
    
    },
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events",
  });

  const fetchEmails = async (accessToken) => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4001/emails", {
        headers: { Authorization: accessToken },
      });
      setEmails(response.data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
    setLoading(false);
  };

  const logout = () => {
    googleLogout();
    setToken(null);
    localStorage.removeItem("gmail_token");
    setEmails([]);
    if (onLogout) onLogout(); 
  };

  const handleReply = async () => {
    if (!replyTo || !replyMessage) {
      alert("Please enter reply details.");
      return;
    }

    try {
      await axios.post("http://localhost:4001/send-email", {
        to: replyTo,
        subject: replySubject,
        message: replyMessage,
        access_token: token,
        inReplyTo: replyMessageId,
        references: replyMessageId,
        threadId: replyThreadId,
      });

      alert("Reply sent successfully!");
      setReplyTo("");
      setReplyMessage("");
      setReplySubject("");
      setReplyMessageId("");
      setReplyThreadId("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  useEffect(() => {
  
    const savedToken = localStorage.getItem("gmail_token");
    if (savedToken) {
      setToken(savedToken);
      if (rerenderSection === null || rerenderSection?.includes('mail')) {
      fetchEmails(savedToken);
      setRerenderSection("maildone")
    }
      setGoogleToken(savedToken)  
    }
  
  }, [rerenderSection]);

  const extractSenderName = (fromHeader, toHeader, userEmail) => {
    if (!fromHeader) return "Unknown";
  
    // Extract email from "Name <email@example.com>" format
    const extractEmail = (header) => {
      const match = header.match(/^(.*?)\s*<(.+?)>$/);
      return match ? match[2].trim() : header.trim(); // If match, return email, else return as is
    };
  
    // Extract name from "Name <email@example.com>", otherwise return the email
    const extractName = (header) => {
      const match = header.match(/^(.*?)\s*<(.+?)>$/);
      return match ? match[1].trim() : header.trim();
    };
  
    const senderEmail = extractEmail(fromHeader);
    const receiverEmail = toHeader ? extractEmail(toHeader) : "";
  
    // If sender and receiver emails are the same, return "Me"
    if (senderEmail === receiverEmail) {
      return "Me";
    }
  
    return senderEmail === userEmail ? "Me" : extractName(fromHeader);
  };
  
  

  const shortenContent = (text) => {
    const words = text.split(" ");
    return words.length > 5 ? words.slice(0, 5).join(" ") + "..." : text;
  };

  return (
    <div className="bg-white shadow-md rounded p-4 text-sm w-full h-full">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Gmail Section</h2>
    {token ? (
      <button className="bg-red-500 text-white px-3 py-2 rounded text-sm" onClick={logout}>
        Logout
      </button>
    ) : (
      <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm" onClick={login}>
        Login with Gmail
      </button>
    )}
  </div>

  {token ? (
    <>
      <div className="overflow-y-auto h-80 border p-2 rounded">
        {loading ? ( 
              <p className="text-gray-500 text-center">Loading emails...</p>
            ) : emails.length > 0 ? (
          emails.map((email, index) => {
            const fromHeader = email.payload.headers.find((h) => h.name === "From")?.value || "Unknown";
            const toHeader = email.payload.headers.find((h) => h.name === "To")?.value || "";
            const senderName = extractSenderName(fromHeader, toHeader);
            const subject = email.payload.headers.find((h) => h.name === "Subject")?.value || "No Subject";
            const content = shortenContent(email.snippet || "No Content Available");
            const messageId = email.payload.headers.find((h) => h.name === "Message-ID")?.value;
            const threadId = email.threadId;

            return (
              <div key={index} className="border-b p-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="truncate">{senderName}</span>
                  <span className="truncate text-gray-700 text-right">{subject}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span className="truncate">{content}</span>
                  <button
                    className="text-blue-500 text-sm underline"
                    onClick={() => {
                      setReplyTo(fromHeader);
                      setReplySubject(subject);
                      setReplyMessageId(messageId);
                      setReplyThreadId(threadId);
                    }}
                  >
                    Reply
                  </button>
                </div>
                {replyTo === fromHeader && replyMessageId === messageId && replyThreadId === threadId && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <textarea
                      className="w-full border p-2 text-sm"
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    ></textarea>
                    <button className="bg-green-500 text-white px-3 py-2 rounded mt-2 text-sm" onClick={handleReply}>
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">No emails found.</p>
        )}
      </div>
    </>
  ) : <>
  <div className="overflow-y-auto h-80 border p-2 rounded bg-gray-50">
    {dummyEmails && dummyEmails.length > 0 ? (
      dummyEmails.map((email, index) => (
        <div key={index} className="border-b p-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="truncate">{email.sender}</span>
            <span className="truncate text-gray-700 text-right">{email.subject}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span className="truncate">{shortenContent(email.content)}</span>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center">No dummy emails available.</p>
    )}
  </div>
  </>}
</div>

  );
};

export default GmailSection;
