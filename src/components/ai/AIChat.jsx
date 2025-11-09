import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { getMoodLabel } from '../../utils/moodUtils';

// AI responses based on mood and user input
const getAIResponse = (mood, userMessage) => {
  const moodLabel = getMoodLabel(mood);
  const lowerMessage = userMessage.toLowerCase();
  
  // Responses for different moods
  const responses = {
    1: [ // Terrible
      "I'm sorry you're feeling terrible. It's okay to have difficult days. Can you tell me more about what's making you feel this way?",
      "I hear you're going through a tough time. Remember, these feelings are temporary. What's been weighing on your mind?",
      "Thank you for sharing. Feeling terrible is valid. What would help you feel even a little bit better right now?",
      "I'm here for you. Sometimes talking about what's bothering us can help. What's on your mind?",
      "You're not alone in feeling this way. Can you share what's been making you feel terrible today?",
    ],
    2: [ // Bad
      "I understand you're feeling bad today. What's been contributing to these feelings?",
      "It sounds like you're having a rough day. Would you like to talk about what's bothering you?",
      "Thank you for being open about feeling bad. What do you think might help improve your mood?",
      "I'm here to listen. What's been on your mind that's making you feel this way?",
      "Feeling bad is completely normal. Can you tell me more about what's going on?",
    ],
    3: [ // Okay
      "You're feeling okay today - that's a good starting point! What would you like to talk about?",
      "Okay is a valid feeling. Is there anything specific on your mind today?",
      "Thanks for checking in. How are you hoping to feel today?",
      "Feeling okay is perfectly fine. What's been happening in your day?",
      "I'm glad you're taking time to reflect. What would you like to explore today?",
    ],
    4: [ // Good
      "That's wonderful that you're feeling good! What's been contributing to your positive mood?",
      "I'm happy to hear you're feeling good! What made your day better?",
      "Great to know you're in a good mood! What's been going well for you?",
      "Feeling good is something to celebrate! What's been making you happy?",
      "That's fantastic! What would you like to talk about while you're feeling good?",
    ],
    5: [ // Amazing
      "Wow, you're feeling amazing! That's wonderful! What's been making your day so great?",
      "I love that you're feeling amazing! What's been the highlight of your day?",
      "That's incredible! Feeling amazing is something to savor. What's been bringing you joy?",
      "You're radiating positivity! What's been making you feel so amazing?",
      "This is great to hear! What would you like to share about your amazing day?",
    ],
  };
  
  // Get responses for the current mood
  const moodResponses = responses[mood] || responses[3];
  
  // Check for specific keywords in user message
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    return "I understand you're feeling down. It's important to acknowledge these feelings. Have you considered talking to someone close to you, or would you like to explore some coping strategies together?";
  }
  
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
    return "Anxiety and worry can be overwhelming. Let's take a moment. What specific situation is causing you stress? Sometimes breaking it down can help.";
  }
  
  if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
    return "Feeling angry or frustrated is valid. What's been triggering these feelings? Sometimes understanding the source can help us process it better.";
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || lowerMessage.includes('great')) {
    return "I'm so glad you're feeling happy! What's been bringing you joy? It's wonderful to celebrate the good moments in life.";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! I'm here whenever you need to talk. How else can I support you today?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what should')) {
    return "I'm here to help. Based on how you're feeling, I'd suggest taking some deep breaths, maybe going for a walk, or doing something you enjoy. What feels most doable right now?";
  }
  
  // Default: return a random response from mood-specific responses
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
};

const AIChat = ({ detectedMood }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with a greeting based on mood
  useEffect(() => {
    if (detectedMood && messages.length === 0) {
      const moodLabel = getMoodLabel(detectedMood);
      const greeting = detectedMood <= 2
        ? `Hi there. I noticed you're feeling ${moodLabel.toLowerCase()} today. I'm here to listen and support you. What's on your mind?`
        : detectedMood === 3
        ? `Hello! I see you're feeling ${moodLabel.toLowerCase()} today. How can I help you?`
        : `Hi! Great to see you're feeling ${moodLabel.toLowerCase()}! What would you like to talk about?`;
      
      setMessages([{
        id: 1,
        text: greeting,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }
  }, [detectedMood, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim() || !detectedMood) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(detectedMood, userMessage.text);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700); // 800-1500ms delay
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      marginTop: '2rem',
      background: 'var(--surface)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      maxHeight: '80vh',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Bot size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>AI Support Chat</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            {detectedMood ? `Based on your ${getMoodLabel(detectedMood).toLowerCase()} mood` : 'Ready to chat'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg)',
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: message.sender === 'user'
                ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))'
                : 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: message.sender === 'ai' ? '1px solid var(--border)' : 'none',
            }}>
              {message.sender === 'user' ? (
                <User size={16} color="white" />
              ) : (
                <Bot size={16} color="var(--accent-600)" />
              )}
            </div>
            <div style={{
              maxWidth: '75%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: message.sender === 'user'
                ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))'
                : 'var(--surface)',
              color: message.sender === 'user' ? 'white' : 'var(--text)',
              border: message.sender === 'ai' ? '1px solid var(--border)' : 'none',
              boxShadow: message.sender === 'ai' ? 'var(--shadow-sm)' : 'none',
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {message.text}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--border)',
            }}>
              <Bot size={16} color="var(--accent-600)" />
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: 'typing 1.4s infinite',
                }} />
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: 'typing 1.4s infinite 0.2s',
                }} />
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: 'typing 1.4s infinite 0.4s',
                }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={detectedMood ? "Type your message..." : "Select a mood first to start chatting"}
            disabled={!detectedMood}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !detectedMood || isTyping}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              background: (input.trim() && detectedMood && !isTyping)
                ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))'
                : 'var(--border)',
              color: 'white',
              cursor: (input.trim() && detectedMood && !isTyping) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={18} />
          </button>
        </div>
        {!detectedMood && (
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            💡 Tip: Use the camera to detect your mood first, then come back here to chat!
          </p>
        )}
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default AIChat;

