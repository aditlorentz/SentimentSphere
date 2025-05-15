import { useState, useEffect } from "react";
import { X, Send, Bot, MessageCircle, RotateCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  fromUser: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      fromUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for your message. How can I assist you further?",
        fromUser: false,
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        // Chat Window
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="bg-indigo-600 rounded-xl shadow-xl w-80 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-3 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="font-medium">AI Assistant</span>
              </div>
              <button
                className="text-white hover:text-gray-200 transition-colors duration-200"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-0">
              <div className="p-4 h-72 bg-white overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Bot className="h-12 w-12 mb-3 text-indigo-300" />
                    <p className="font-medium mb-1">AI Assistant</p>
                    <p className="text-sm">How can I help you today?</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.fromUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!msg.fromUser && (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <Bot className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                            msg.fromUser
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        {msg.fromUser && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ml-2 flex-shrink-0">
                            <span className="text-xs font-medium text-blue-600">You</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <Bot className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-gray-100 text-gray-800">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <form
                  className="flex items-center space-x-2"
                  onSubmit={handleSubmit}
                >
                  <Input 
                    className="bg-white border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 flex-1 focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Ask a question..."
                    value={message}
                    onChange={handleInputChange}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-full h-10 w-10 flex items-center justify-center text-white shadow-md transition-all duration-200"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Floating Button
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center animate-bounce-slow transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
