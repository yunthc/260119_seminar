import './style.css'

const messagesContainer = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

// 메시지를 화면에 추가하는 함수
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;
  messagesContainer.appendChild(messageDiv);
  
  // 스크롤을 항상 최신 메시지로 이동
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 간단한 봇 응답 로직
function getBotResponse(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('안녕')) {
    return "안녕하세요! 무엇을 도와드릴까요?";
  } else if (lowerText.includes('시간')) {
    return `현재 시간은 ${new Date().toLocaleTimeString()}입니다.`;
  } else {
    return "죄송해요, 이해하지 못했습니다. '안녕'이나 '시간'이라고 물어봐주세요.";
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault(); // 폼 제출 시 새로고침 방지
  
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, 'user'); // 사용자 메시지 추가
  messageInput.value = '';

  // 봇 응답 지연 시뮬레이션 (0.5초)
  setTimeout(() => {
    const botResponse = getBotResponse(text);
    addMessage(botResponse, 'bot');
  }, 500);
});