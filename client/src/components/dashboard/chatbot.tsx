import { useState } from "react";
import { X, Send, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  fromUser: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="bg-indigo-600 rounded-md shadow-lg w-72 overflow-hidden">
        <div className="bg-indigo-700 p-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-medium">BOT</span>
          </div>
          <button
            className="text-white hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="p-0">
          <div className="p-3 h-64 bg-white overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-gray-500 mb-3 pt-3">
                <p>Want to ask something?</p>
              </div>
            ) : (
              <div className="space-y-3 py-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.fromUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        msg.fromUser
                          ? "bg-indigo-100 text-indigo-900"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form
              className="flex items-end space-x-2 mt-3"
              onSubmit={handleSubmit}
            >
              <Input 
                className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700 flex-1" 
                placeholder="Mulai mengajikan..."
                value={message}
                onChange={handleInputChange}
              />
              <Button 
                type="submit" 
                size="icon"
                variant="ghost"
                className="text-secondary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
