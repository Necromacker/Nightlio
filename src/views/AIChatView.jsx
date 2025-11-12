import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle } from 'lucide-react';
import { getMoodLabel } from '../utils/moodUtils';

// AI responses based on mood and user input
const getAIResponse = (mood, userMessage, conversationStage) => {
  const moodLabel = getMoodLabel(mood);
  const lowerMessage = userMessage.toLowerCase();
  
  // Stage 3: React to user's feelings and provide solutions
  if (conversationStage >= 3) {
    // Negative moods (1-2)
    if (mood <= 2) {
      if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
        return "Work stress can be really challenging. Remember that your worth isn't defined by your job. Have you tried setting boundaries or talking to someone at work about how you're feeling? Sometimes a small change in routine can make a big difference.";
      }
      
      if (lowerMessage.includes('relationship') || lowerMessage.includes('friend') || lowerMessage.includes('family') || lowerMessage.includes('partner')) {
        return "Relationships can be complex and emotionally draining. It's important to communicate your needs clearly. Have you considered writing down your feelings first? Sometimes that helps clarify what you want to say. Remember, healthy relationships require effort from both sides.";
      }
      
      if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
        return "Anxiety can feel overwhelming, but you're taking a great step by talking about it. Try the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. Repeat a few times. What specific situation is causing you the most stress right now?";
      }
      
      if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
        return "I'm sorry you're feeling this way. These feelings are valid and temporary, even when they don't feel like it. Have you tried doing something small that usually brings you joy? Sometimes even a 10-minute walk or listening to your favorite song can help shift your mood slightly.";
      }
      
      if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad') || lowerMessage.includes('annoyed')) {
        return "Anger is a natural emotion, and it's okay to feel it. The key is how we handle it. Have you tried journaling about what triggered these feelings? Sometimes understanding the root cause helps us process it better. What's been making you feel this way?";
      }
      
      // Generic response for negative moods
      return "Thank you for sharing that with me. It takes courage to open up about difficult feelings. Remember, you're not alone in this. Have you tried any coping strategies that have helped you in the past? Sometimes revisiting what worked before can be helpful. What do you think might help you feel even a little bit better?";
    }
    
    // Positive moods (4-5)
    if (mood >= 4) {
      if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || lowerMessage.includes('great') || lowerMessage.includes('wonderful')) {
        return "I'm so glad to hear you're feeling happy! That's wonderful! What's been the highlight of your day? It's great to celebrate these positive moments. Remember to savor these feelings - they're just as important as processing the difficult ones.";
      }
      
      if (lowerMessage.includes('accomplish') || lowerMessage.includes('success') || lowerMessage.includes('achieved') || lowerMessage.includes('proud')) {
        return "That's fantastic! Celebrating your accomplishments is so important. You should be proud of yourself! What helped you achieve this? Sometimes reflecting on what went well can help us replicate that success in the future.";
      }
      
      if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful') || lowerMessage.includes('blessed')) {
        return "Gratitude is such a powerful emotion! It's wonderful that you're taking time to appreciate the good things in your life. Practicing gratitude regularly can actually help improve your overall well-being. What are you most grateful for today?";
      }
      
      // Generic response for positive moods
      return "I'm really happy to hear you're feeling good! That's wonderful! What's been contributing to your positive mood? It's great to acknowledge and celebrate these moments. Is there anything specific you'd like to talk about while you're feeling this way?";
    }
    
    // Neutral mood (3)
    return "Thanks for sharing. It sounds like you're in a reflective space today. That's perfectly okay - not every day needs to be high or low. Is there anything on your mind that you'd like to explore or discuss?";
  }
  
  // Stage 2: Encourage sharing
  if (conversationStage === 2) {
    return "Go ahead and share your feelings with me. I'm here to listen without judgment. What's been on your mind today?";
  }
  
  // Default fallback
  return "I'm here to listen. Please share what's on your mind.";
};

const AIChatView = ({ detectedMood }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState(1); // 1: initial question, 2: encourage sharing, 3+: conversation
  const [moodConfirmed, setMoodConfirmed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with step 1: "I noticed you are feeling [mood] today... is that right?"
  useEffect(() => {
    if (detectedMood && messages.length === 0) {
      const moodLabel = getMoodLabel(detectedMood);
      const initialMessage = `I noticed you're feeling ${moodLabel.toLowerCase()} today... is that right?`;
      
      setMessages([{
        id: 1,
        text: initialMessage,
        sender: 'ai',
        timestamp: new Date(),
      }]);
      setConversationStage(1);
    } else if (!detectedMood && messages.length === 0) {
      setMessages([{
        id: 1,
        text: "Hi! I'm here to support you. To get started, please use the camera to detect your mood first, or select a mood manually.",
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
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      let aiResponse;
      let nextStage = conversationStage;

      // Stage 1: User confirms or denies mood
      if (conversationStage === 1) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('yes') || lowerInput.includes('yeah') || lowerInput.includes('yep') || lowerInput.includes('correct') || lowerInput.includes('right') || lowerInput.includes('true')) {
          setMoodConfirmed(true);
          nextStage = 2;
          aiResponse = "Go ahead and share your feelings with me. I'm here to listen without judgment. What's been on your mind today?";
        } else if (lowerInput.includes('no') || lowerInput.includes('not') || lowerInput.includes('wrong') || lowerInput.includes('incorrect')) {
          aiResponse = "I understand. How are you actually feeling today? Please share your true feelings with me.";
          // Stay in stage 1 but allow them to correct
        } else {
          // If they don't confirm/deny, assume yes and move forward
          setMoodConfirmed(true);
          nextStage = 2;
          aiResponse = "Go ahead and share your feelings with me. I'm here to listen without judgment. What's been on your mind today?";
        }
        setConversationStage(nextStage);
      } else {
        // Stage 2+: Normal conversation
        nextStage = Math.max(conversationStage, 3); // Move to stage 3 after first response
        setConversationStage(nextStage);
        aiResponse = getAIResponse(detectedMood, userInput, nextStage);
      }

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
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{
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
            <MessageCircle size={20} />
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
                alignItems: 'center',
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
              placeholder={detectedMood ? "Type your message..." : "Use the camera to detect your mood first"}
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
                maxHeight: '44px',
                outline: 'none',
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
    </div>
  );
};

export default AIChatView;

