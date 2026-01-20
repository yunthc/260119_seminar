import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <div class="messages" id="messages">
      <div class="message bot">안녕하세요! 무엇을 도와드릴까요?</div>
    </div>
    <form class="chat-form" id="chat-form">
      <input type="text" id="message-input" placeholder="메시지를 입력하세요..." autocomplete="off" />
      <button type="submit">전송</button>
    </form>
  </div>
`

const messagesContainer = document.getElementById('messages')
const chatForm = document.getElementById('chat-form')
const messageInput = document.getElementById('message-input')

const appendMessage = (text, sender) => {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${sender}`
  messageDiv.textContent = text
  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const message = messageInput.value.trim()
  if (!message) return

  appendMessage(message, 'user')
  messageInput.value = ''

  // 간단한 봇 응답 시뮬레이션
  setTimeout(() => {
    appendMessage(`Echo: ${message}`, 'bot')
  }, 300)
})
