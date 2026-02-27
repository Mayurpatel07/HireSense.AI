import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewQuestionsModal } from './InterviewQuestionsModal';
import { BotAvatar } from './BotAvatar';
import { getInterviewQuestionsFromDetails } from '../services/jobService';
import { InterviewQuestionsResult } from '../types';

/**
 * Enhanced Expressive Animated Chatbot Widget
 * Features:
 * - Expressive avatar with idle animations: blinking, nodding, waving, shaking
 * - Typing indicator animation when thinking
 * - Staggered option appearance with smooth animations
 * - Avatar expression changes while speaking
 * - Help bubble with tips
 * - Three main options: Resume Analyzer, Job Match, Interview Prep
 * - Interactive job role collection for interview prep
 * - Responsive design with personality
 * - Pure CSS animations and JavaScript timers (no animation libraries)
 */

type MessageType = 'welcome' | 'option' | 'response' | 'input' | 'typing';
type AvatarExpression = 'idle' | 'speaking' | 'thinking' | 'excited' | 'happy';
type IdleAnimation = 'blink' | 'nod' | 'wave' | 'shake' | 'bounce';

interface Message {
  type: MessageType;
  text: string;
  data?: any;
}

export const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionsResult | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [jobDetailsInput, setJobDetailsInput] = useState('');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  
  // Avatar expression and animation state
  const [avatarExpression, setAvatarExpression] = useState<AvatarExpression>('idle');
  const [currentIdleAnimation, setCurrentIdleAnimation] = useState<IdleAnimation>('bounce');
  const [visibleOptions, setVisibleOptions] = useState<number>(0);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentBubbleIndex, setCurrentBubbleIndex] = useState(0);

  // Promotional bubble messages
  const bubbleMessages = [
    'Analyze Resume using AI',
    'Get AI-based Job Match',
    'Interview Preparation'
  ];

  /**
   * Cycle through random idle animations
   * - Blink eyes
   * - Nod head
   * - Wave hand
   * - Shake/wiggle
   * - Bounce
   */
  useEffect(() => {
    if (isOpen || messages.length > 0) return; // Don't animate when chat is open or has messages

    const animations: IdleAnimation[] = ['blink', 'nod', 'wave', 'shake', 'bounce'];
    let currentIndex = 0;

    const idleInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % animations.length;
      setCurrentIdleAnimation(animations[currentIndex]);
      
      // Trigger blink every cycle
      if (animations[currentIndex] === 'blink') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 300);
      }
    }, 3000); // Change animation every 3 seconds

    return () => clearInterval(idleInterval);
  }, [isOpen, messages.length]);

  /**
   * Cycle through promotional bubbles when bot is idle
   * Shows each bubble for 4 seconds before cycling to the next
   */
  useEffect(() => {
    if (isOpen) {
      setShowHelpBubble(false);
      return;
    }

    // Show first bubble after 2 seconds of being idle
    const initialDelay = setTimeout(() => {
      setShowHelpBubble(true);
      setCurrentBubbleIndex(0);
    }, 2000);

    const bubbleInterval = setInterval(() => {
      setShowHelpBubble(true);
      setCurrentBubbleIndex((prev) => (prev + 1) % bubbleMessages.length);
      
      // Hide bubble briefly between transitions
      setTimeout(() => setShowHelpBubble(false), 3500);
    }, 4000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(bubbleInterval);
    };
  }, [isOpen, bubbleMessages.length]);

  /**
   * Handle opening the chat window with animated greeting
   */
  const handleOpenChat = () => {
    setIsOpen(true);
    setAvatarExpression('speaking');
    // Don't set idle animation while chat is open - controlled by useEffect
    setVisibleOptions(0);
    setMessages([{ type: 'typing', text: '...' }]);

    // Show typing animation for 1.2 seconds
    setTimeout(() => {
      setMessages([
        { type: 'welcome', text: "Hi! I can help you with these topics. Please choose one:" }
      ]);
      setAvatarExpression('happy');

      // Show options one by one with staggered delays
      setTimeout(() => setVisibleOptions(1), 500);
      setTimeout(() => setVisibleOptions(2), 1000);
      setTimeout(() => setVisibleOptions(3), 1500);

      // Return to idle after a moment
      setTimeout(() => setAvatarExpression('idle'), 3000);
    }, 1200);
  };

  const openInterviewPrepFlow = () => {
    setIsOpen(true);
    setShowHelpBubble(false);
    setVisibleOptions(0);
    setShowInterviewForm(true);
    setAvatarExpression('speaking');
    setMessages([
      { type: 'response', text: 'Interview Preparation selected!' },
      { type: 'input', text: 'Tell me about the job role so I can generate relevant questions.' }
    ]);
    setTimeout(() => setAvatarExpression('idle'), 2000);
  };

  useEffect(() => {
    const handleOpenInterviewPrep = () => {
      openInterviewPrepFlow();
    };

    window.addEventListener('open-ai-interview-prep', handleOpenInterviewPrep);

    return () => {
      window.removeEventListener('open-ai-interview-prep', handleOpenInterviewPrep);
    };
  }, []);

  // Handle option click
  const handleOptionClick = (option: string) => {
    setAvatarExpression('excited');
    
    switch (option) {
      case 'resume':
        setMessages([...messages, { type: 'response', text: 'Opening Resume Analyzer...' }]);
        setTimeout(() => {
          navigate('/resume-analyzer');
          setIsOpen(false);
          setAvatarExpression('idle');
        }, 800);
        break;

      case 'match':
        setMessages([...messages, { type: 'response', text: 'Opening AI Job Matcher...' }]);
        setTimeout(() => {
          navigate('/jobs');
          setIsOpen(false);
          setAvatarExpression('idle');
        }, 800);
        break;

      case 'interview':
        setShowInterviewForm(true);
        setAvatarExpression('speaking');
        setMessages([
          ...messages,
          { type: 'response', text: 'Interview Preparation selected!' },
          { type: 'input', text: 'Tell me about the job role so I can generate relevant questions.' }
        ]);
        setTimeout(() => setAvatarExpression('idle'), 2000);
        break;

      default:
        break;
    }
  };

  // Handle interview questions generation
  const handleGenerateInterviewQuestions = async () => {
    if (!jobDetailsInput.trim()) {
      setAvatarExpression('speaking');
      setMessages([...messages, { type: 'response', text: '✗ Please tell me about the job role.' }]);
      setTimeout(() => setAvatarExpression('idle'), 1500);
      return;
    }

    try {
      setGeneratingQuestions(true);
      setAvatarExpression('thinking');
      setMessages([...messages, { type: 'typing', text: 'Generating interview questions...' }]);

      // Extract job title from first line or use default
      const lines = jobDetailsInput.trim().split('\n');
      const firstLine = lines[0].trim();
      const jobTitle = firstLine.length > 3 && firstLine.length < 100 ? firstLine : 'Job Role';
      const jobDescription = jobDetailsInput.trim();

      const result = await getInterviewQuestionsFromDetails(
        jobTitle,
        jobDescription,
        [],
        []
      );

      if (result.data) {
        setInterviewQuestions(result.data);
        setShowInterviewModal(true);
        setAvatarExpression('excited');
        setMessages(prev => prev.slice(0, -1).concat([{ type: 'response', text: '✓ Questions generated! Check the modal.' }]));
        setShowInterviewForm(false);
        setJobDetailsInput('');
        setTimeout(() => setAvatarExpression('idle'), 2000);
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      setAvatarExpression('speaking');
      setMessages(prev => prev.slice(0, -1).concat([{ type: 'response', text: '✗ Error generating questions. Please try again.' }]));
      setTimeout(() => setAvatarExpression('idle'), 1500);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Reset chat
  const handleReset = () => {
    setMessages([]);
    setVisibleOptions(0);
    setAvatarExpression('idle');
    setShowInterviewForm(false);
    setJobDetailsInput('');
  };

  return (
    <>
      {/* Inline Styles with Expressive Animations */}
      <style>
        {`
          /***
           * CHATBOT WIDGET - ENHANCED EXPRESSIVE ANIMATIONS
           * All animations are CSS-based with JavaScript timing control
           ***/

          /* ============ CONTAINER & LAYOUT ============ */
          .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            z-index: 1000;
          }

          /* Promotional Bubble - shows features when bot is idle */
          .help-bubble {
            position: absolute;
            top: -70px;
            right: 15px;
            background: white;
            color: #333;
            padding: 12px 18px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            animation: bubbleFadeInOut 4s ease-in-out;
            pointer-events: none;
            z-index: 1002;
            border: 2px solid #e0e0e0;
          }

          /* Add a speech bubble pointer */
          .help-bubble::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 30px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid white;
          }

          .help-bubble::before {
            content: '';
            position: absolute;
            bottom: -12px;
            right: 28px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 12px solid #e0e0e0;
            z-index: -1;
          }

          /* Promotional bubble animation: fade in, stay, fade out with bounce */
          @keyframes bubbleFadeInOut {
            0% {
              opacity: 0;
              transform: translateY(-15px) scale(0.8);
            }
            10% {
              opacity: 1;
              transform: translateY(0) scale(1.05);
            }
            15% {
              transform: translateY(0) scale(1);
            }
            85% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            95% {
              opacity: 0;
              transform: translateY(-10px) scale(0.9);
            }
            100% {
              opacity: 0;
              transform: translateY(-10px) scale(0.9);
            }
          }

          /* ============ CHATBOT AVATAR ============ */
          /* Avatar Button with Expression Changes */
          .chatbot-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: visible;
            padding: 0;
          }

          /* Default idle animation - gentle bounce */
          .chatbot-avatar[data-idle-animation="bounce"] {
            animation: bounceIdle 2s infinite;
          }

          /* Blink animation - eyes close and open */
          .chatbot-avatar[data-idle-animation="blink"] {
            animation: blinkExpression 2.5s infinite;
          }

          /* Nod animation - head nods gently */
          .chatbot-avatar[data-idle-animation="nod"] {
            animation: nodExpression 2s infinite;
          }

          /* Wave animation - hand waves */
          .chatbot-avatar[data-idle-animation="wave"] {
            animation: waveExpression 2.2s infinite;
          }

          /* Shake/Wiggle animation - body shakes */
          .chatbot-avatar[data-idle-animation="shake"] {
            animation: shakeExpression 2s infinite;
          }

          /* Speaking expression - animated mouth */
          .chatbot-avatar[data-expression="speaking"] {
            animation: speakingExpression 0.5s ease-in-out;
          }

          /* Thinking expression - contemplative */
          .chatbot-avatar[data-expression="thinking"] {
            animation: thinkingExpression 1.5s ease-in-out;
          }

          /* Excited expression - bouncy */
          .chatbot-avatar[data-expression="excited"] {
            animation: excitedExpression 0.6s ease-in-out;
          }

          /* Happy expression - friendly bounce */
          .chatbot-avatar[data-expression="happy"] {
            animation: happyExpression 0.8s ease-in-out;
          }

          /* Hover effect */
          .chatbot-avatar:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
          }

          /* ============ IDLE ANIMATIONS ============ */
          
          /* BOUNCE - gentle up and down motion */
          @keyframes bounceIdle {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          /* BLINK - eyes close briefly */
          @keyframes blinkExpression {
            0%, 10%, 90%, 100% {
              filter: brightness(1);
            }
            45%, 55% {
              filter: brightness(0.5) drop-shadow(0 0 3px rgba(0,0,0,0.3));
            }
          }

          /* NOD - head nods left and right */
          @keyframes nodExpression {
            0%, 100% {
              transform: rotateX(0deg);
            }
            25% {
              transform: rotateX(-8deg);
            }
            50% {
              transform: rotateX(0deg);
            }
            75% {
              transform: rotateX(8deg);
            }
          }

          /* WAVE - hand waves */
          @keyframes waveExpression {
            0%, 100% {
              transform: rotate(0deg);
            }
            10% {
              transform: rotate(15deg) translateY(-2px);
            }
            20% {
              transform: rotate(-10deg) translateY(-2px);
            }
            30% {
              transform: rotate(15deg) translateY(-2px);
            }
            40% {
              transform: rotate(-5deg) translateY(-2px);
            }
            50% {
              transform: rotate(10deg) translateY(-2px);
            }
            60% {
              transform: rotate(0deg);
            }
          }

          /* SHAKE - body shakes left and right */
          @keyframes shakeExpression {
            0%, 100% {
              transform: translateX(0);
            }
            10% {
              transform: translateX(-4px);
            }
            20% {
              transform: translateX(4px);
            }
            30% {
              transform: translateX(-4px);
            }
            40% {
              transform: translateX(4px);
            }
            50% {
              transform: translateX(-2px);
            }
            60% {
              transform: translateX(2px);
            }
            70% {
              transform: translateX(0);
            }
          }

          /* ============ EXPRESSION ANIMATIONS ============ */

          /* SPEAKING - animated happy expression */
          @keyframes speakingExpression {
            0%, 100% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.05) rotateZ(-2deg);
              filter: brightness(1.1);
            }
          }

          /* THINKING - contemplative with slight tilt */
          @keyframes thinkingExpression {
            0%, 100% {
              transform: rotateZ(0deg) scale(1);
            }
            50% {
              transform: rotateZ(-3deg) scale(0.98);
            }
          }

          /* EXCITED - quick bounces */
          @keyframes excitedExpression {
            0%, 100% {
              transform: scale(1) translateY(0);
            }
            25% {
              transform: scale(1.1) translateY(-8px);
            }
            50% {
              transform: scale(1) translateY(0);
            }
            75% {
              transform: scale(1.1) translateY(-8px);
            }
          }

          /* HAPPY - happy expression bounce */
          @keyframes happyExpression {
            0% {
              transform: scale(1) rotateZ(0deg);
            }
            50% {
              transform: scale(1.08) rotateZ(2deg);
            }
            100% {
              transform: scale(1) rotateZ(-2deg);
            }
          }

          /* ============ CHAT WINDOW ============ */
          .chat-window {
            position: absolute;
            bottom: 90px;
            right: 0;
            width: 380px;
            max-height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 50px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            opacity: 0;
            transform: scale(0.5) translateX(50px);
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* Chat window open state */
          .chat-window.open {
            opacity: 1;
            transform: scale(1) translateX(0);
            pointer-events: auto;
          }

          /* Chat Header */
          .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
          }

          .chat-header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
          }

          .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
          }

          .close-btn:hover {
            transform: rotate(90deg);
          }

          /* ============ MESSAGES & TYPING ============ */
          .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          /* Message Bubble */
          .message {
            display: flex;
            gap: 8px;
            animation: messageSlideIn 0.3s ease;
          }

          @keyframes messageSlideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message.assistant {
            justify-content: flex-start;
          }

          .message.user {
            justify-content: flex-end;
          }

          .message-content {
            max-width: 250px;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
          }

          .message.assistant .message-content {
            background: #f0f0f0;
            color: #333;
            border-bottom-left-radius: 4px;
          }

          .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
          }

          /* Typing animation - three animated dots */
          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 12px;
          }

          .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #999;
            animation: typingBounce 1.4s infinite;
          }

          .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typingBounce {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.5;
            }
            30% {
              transform: translateY(-10px);
              opacity: 1;
            }
          }

          /* ============ OPTIONS & BUTTONS ============ */
          .options-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 12px;
          }

          /* Options appear one by one with staggered animations */
          .option-button {
            padding: 12px 14px;
            background: #f0f0f0;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: #333;
            transition: all 0.2s;
            text-align: left;
            animation: optionSlideInFade 0.4s ease-out forwards;
            opacity: 0;
          }

          /* Option 1 - appears at 0.5s */
          .option-button:nth-child(1) {
            animation-delay: 0.5s;
          }

          /* Option 2 - appears at 1s */
          .option-button:nth-child(2) {
            animation-delay: 1s;
          }

          /* Option 3 - appears at 1.5s */
          .option-button:nth-child(3) {
            animation-delay: 1.5s;
          }

          /* Slide in and fade in animation for options */
          @keyframes optionSlideInFade {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .option-button:hover {
            background: #e8e8ff;
            border-color: #667eea;
            color: #667eea;
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
          }

          .option-button:active {
            transform: translateX(2px);
          }

          /* ============ INTERVIEW FORM ============ */
          .interview-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 12px;
          }

          .form-input {
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 13px;
            font-family: inherit;
            transition: all 0.2s;
          }

          .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-input::placeholder {
            color: #999;
          }

          .textarea-input {
            resize: vertical;
            min-height: 60px;
            max-height: 100px;
          }

          .form-button {
            padding: 10px 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .form-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .form-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* ============ CHAT FOOTER ============ */
          .chat-footer {
            padding: 12px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 8px;
          }

          .reset-btn {
            flex: 1;
            padding: 8px 12px;
            background: #f0f0f0;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            color: #666;
            transition: all 0.2s;
          }

          .reset-btn:hover {
            background: #e0e0e0;
            color: #333;
          }

          /* ============ RESPONSIVE DESIGN ============ */
          @media (max-width: 480px) {
            .chatbot-container {
              bottom: 10px;
              right: 10px;
            }

            .chatbot-avatar {
              width: 60px;
              height: 60px;
            }

            .chat-window {
              width: calc(100vw - 20px);
              bottom: 70px;
            }

            .message-content {
              max-width: 200px;
            }

            .help-bubble {
              display: none;
            }
          }

          /* ============ SCROLLBAR STYLING ============ */
          .chat-messages::-webkit-scrollbar {
            width: 6px;
          }

          .chat-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .chat-messages::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 10px;
          }

          .chat-messages::-webkit-scrollbar-thumb:hover {
            background: #764ba2;
          }
        `}
      </style>

      {/* Chatbot Widget Container */}
      <div className="chatbot-container">
        {/* Promotional Bubble - cycles through features when bot is idle */}
        {showHelpBubble && !isOpen && (
          <div className="help-bubble">
            {bubbleMessages[currentBubbleIndex]}
          </div>
        )}

        {/* Chat Window */}
        <div className={`chat-window ${isOpen ? 'open' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-title">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BotAvatar expression={avatarExpression as any} size={24} />
              </div>
              <span>AI Job Assistant</span>
            </div>
            <button
              className="close-btn"
              onClick={() => {
                setIsOpen(false);
                setAvatarExpression('idle');
                setVisibleOptions(0);
                setTimeout(() => setMessages([]), 300);
              }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {/* Render all messages */}
            {messages.map((msg, idx) => {
              if (msg.type === 'typing') {
                return (
                  <div key={idx} className="message assistant">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`message ${
                    msg.type === 'welcome' || msg.type === 'input'
                      ? 'assistant'
                      : 'user'
                  }`}
                >
                  <div className="message-content">{msg.text}</div>
                </div>
              );
            })}

            {/* Welcome Message with Staggered Options */}
            {messages.length === 1 &&
              messages[0].type === 'welcome' &&
              !showInterviewForm && (
                <div className="message assistant" style={{ marginTop: '8px' }}>
                  <div style={{ width: '100%' }}>
                    <div className="options-container">
                      {/* Option 1 - Resume Analyzer (appears after 0.5s) */}
                      {visibleOptions >= 1 && (
                        <button
                          className="option-button"
                          onClick={() => handleOptionClick('resume')}
                        >
                          Analyze Resume using AI
                        </button>
                      )}

                      {/* Option 2 - Job Match (appears after 1s) */}
                      {visibleOptions >= 2 && (
                        <button
                          className="option-button"
                          onClick={() => handleOptionClick('match')}
                        >
                          Get AI-based Job Match
                        </button>
                      )}

                      {/* Option 3 - Interview Prep (appears after 1.5s) */}
                      {visibleOptions >= 3 && (
                        <button
                          className="option-button"
                          onClick={() => handleOptionClick('interview')}
                        >
                          Interview Preparation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Interview Form */}
            {showInterviewForm && (
              <div className="message assistant" style={{ marginTop: '8px' }}>
                <div style={{ width: '100%' }}>
                  <div className="interview-form">
                    <textarea
                      className="form-input textarea-input"
                      placeholder="Tell me about the job role in detail (e.g., Senior React Developer with 3+ years experience in building scalable web applications...)" 
                      value={jobDetailsInput}
                      onChange={(e) => setJobDetailsInput(e.target.value)}
                      rows={6}
                      style={{ minHeight: '120px' }}
                    />
                    <button
                      className="form-button"
                      onClick={handleGenerateInterviewQuestions}
                      disabled={generatingQuestions}
                    >
                      {generatingQuestions ? 'Generating...' : 'Generate Questions'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Reset Button */}
          <div className="chat-footer">
            <button
              className="reset-btn"
              onClick={handleReset}
            >
              Reset Conversation
            </button>
          </div>
        </div>

        {/* Avatar Button with Expressive Animations */}
        <button
          className="chatbot-avatar"
          data-idle-animation={currentIdleAnimation}
          data-expression={avatarExpression}
          onClick={() => (isOpen ? setIsOpen(false) : handleOpenChat())}
          aria-label="Toggle chatbot"
          title="Chat with AI Assistant - Click to start!"
        >
          <BotAvatar
            expression={
              isBlinking
                ? 'blinking'
                : (avatarExpression as 'idle' | 'speaking' | 'thinking' | 'excited' | 'happy' | 'blinking')
            }
            size={70}
          />
        </button>
      </div>

      {/* Interview Questions Modal */}
      <InterviewQuestionsModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        data={interviewQuestions}
        isLoading={generatingQuestions}
      />
    </>
  );
};
