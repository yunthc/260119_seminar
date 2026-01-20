import { GoogleGenerativeAI } from "@google/generative-ai";
import './style.css'

// 1. HTML 구조 렌더링
document.querySelector('#app').innerHTML = `
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>Chatbots</h3>
      </div>
      <nav class="sidebar-nav">
        <a href="/" class="nav-item">
          <span class="icon">😐</span>
          Simple Bot
        </a>
        <a href="/advancedchatbot.html" class="nav-item active">
          <span class="icon">🤖</span>
          Advanced AI
        </a>
      </nav>
    </aside>
    <main class="main-content">
      <div class="chat-container advanced">
        <div class="chat-header">
          <div class="header-title">
            <span class="bot-icon">🤖</span>
            <h2>Advanced AI (Pro Model)</h2>
          </div>
          <button id="clear-btn" class="clear-btn" title="대화 지우기">🗑️</button>
        </div>
        <div class="messages" id="messages">
          <div class="message bot">
            <div class="avatar">🤖</div>
            <div class="text">안녕하세요! 고성능 Pro 모델이 탑재된 챗봇입니다. 무엇을 도와드릴까요?</div>
          </div>
        </div>
        <form class="chat-form" id="chat-form">
          <input type="text" id="message-input" placeholder="메시지를 입력하세요..." autocomplete="off" />
          <button type="submit" id="send-btn">전송</button>
        </form>
      </div>
    </main>
  </div>
`

// 2. 동적 스타일 추가
const style = document.createElement('style');
style.textContent = `
  /* 레이아웃 재설정 */
  body { display: block; margin: 0; padding: 0; }
  .app-layout { display: flex; height: 100vh; width: 100vw; background-color: #f4f7f6; }
  
  /* 사이드바 스타일 */
  .sidebar {
    width: 260px; background: #2c3e50; color: white;
    display: flex; flex-direction: column; padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  }
  .sidebar-header h3 {
    margin: 0 0 20px 0; font-size: 1.2rem; color: #ecf0f1;
    border-bottom: 1px solid #34495e; padding-bottom: 15px;
  }
  .sidebar-nav { display: flex; flex-direction: column; gap: 10px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 12px 15px;
    color: #bdc3c7; text-decoration: none; border-radius: 8px; transition: all 0.2s;
  }
  .nav-item:hover { background: #34495e; color: white; }
  .nav-item.active { background: #667eea; color: white; }
  .nav-item .icon { font-size: 1.2rem; }
  
  .main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }

  .chat-container.advanced {
    display: flex;
    flex-direction: column;
    height: 85vh;
    width: 100%;
    max-width: 600px;
    margin: 0;
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.15);
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
  }
  .chat-header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-title { display: flex; align-items: center; gap: 10px; }
  .header-title h2 { margin: 0; font-size: 1.1rem; font-weight: 600; }
  .clear-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; }
  .clear-btn:hover { transform: scale(1.1); }
  
  .messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f4f7f6;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .message { display: flex; align-items: flex-end; gap: 8px; max-width: 85%; animation: fadeIn 0.3s ease; }
  .message.user { align-self: flex-end; flex-direction: row-reverse; }
  
  .message .text {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 0.95rem;
    line-height: 1.5;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    word-break: break-word;
  }
  .message.bot .text { background: white; color: #333; border-bottom-left-radius: 4px; }
  .message.user .text { background: #667eea; color: white; border-bottom-right-radius: 4px; }
  
  .avatar {
    width: 32px; height: 32px;
    background: #e0e0e0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .message.user .avatar { background: #667eea; }
  
  /* 타이핑 인디케이터 애니메이션 */
  .typing-indicator span {
    display: inline-block; width: 6px; height: 6px;
    background: #b0b0b0; border-radius: 50%; margin: 0 2px;
    animation: typing 1.4s infinite both;
  }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);

// 3. 챗봇 클래스 정의
class AdvancedChatbot {
  constructor() {
    this.messagesContainer = document.getElementById('messages');
    this.form = document.getElementById('chat-form');
    this.input = document.getElementById('message-input');
    this.clearBtn = document.getElementById('clear-btn');
    this.isTyping = false;
    
    // SDK 초기화
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.error("⚠️ VITE_GEMINI_API_KEY가 없습니다. .env 파일을 확인하세요.");
    }
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.clearBtn.addEventListener('click', () => this.clearChat());
  }

  handleSubmit(e) {
    e.preventDefault();
    const text = this.input.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    this.input.value = '';
    this.processResponse(text);
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const avatar = sender === 'bot' ? '🤖' : '👤';
    const formattedText = this.escapeHtml(text).replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
      <div class="avatar">${avatar}</div>
      <div class="text">${formattedText}</div>
    `;
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTyping() {
    if (this.isTyping) return;
    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `<div class="avatar">🤖</div><div class="text typing-indicator"><span></span><span></span><span></span></div>`;
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTyping() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
    this.isTyping = false;
  }

  scrollToBottom() { this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight; }
  
  clearChat() {
    this.messagesContainer.innerHTML = `<div class="message bot"><div class="avatar">🤖</div><div class="text">대화가 초기화되었습니다.</div></div>`;
  }

  escapeHtml(text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  async processResponse(text) {
    this.showTyping();

    try {
      if (!this.genAI) throw new Error("API 키가 설정되지 않았습니다.");

      // 1. 모델 설정
      // 'gemini-1.5-pro'는 현재 사용 가능한 가장 똑똑한 모델 중 하나입니다.
      // 만약 'gemini-2.0-flash-exp' 같은 실험적 모델을 원하시면 아래 값을 변경하세요.
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 2. 답변 생성 요청
      const result = await model.generateContent(text);
      const response = await result.response;
      const botResponse = response.text();

      this.hideTyping();
      this.addMessage(botResponse, 'bot');
      
    } catch (error) {
      console.error("Gemini SDK Error:", error);
      this.hideTyping();
      
      let errorMsg = "오류가 발생했습니다.";
      if (error.message.includes("API key")) errorMsg = "⚠️ API 키 오류입니다. .env 파일을 확인해주세요.";
      if (error.message.includes("404")) errorMsg = "⚠️ 해당 모델을 찾을 수 없습니다. 모델명을 'gemini-1.5-flash' 또는 'gemini-1.5-pro'로 변경해보세요.";
      
      this.addMessage(errorMsg, 'bot');
    }
  }
}

new AdvancedChatbot();