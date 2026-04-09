document.addEventListener('DOMContentLoaded', function () {
  const promptInput  = document.getElementById('prompt');
  const sendBtn      = document.getElementById('send');
  const chatEl       = document.getElementById('chat');
  const newConvBtn   = document.getElementById('new-conv-btn');
  const convListEl   = document.getElementById('conv-list');
  const emptyState   = document.getElementById('empty-state');

  let currentConvId  = null;

  // ── Helpers de render ──────────────────────────────────────

  function mdToHtml(text) {
    try {
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(marked.parse(String(text)));
      }
    } catch (_) {}
    return String(text).replace(/</g, '&lt;');
  }

  function renderMessage(role, content, createdAt) {
    if (emptyState) emptyState.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'message ' + role; // "user" o "model"

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = mdToHtml(content);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = createdAt ? new Date(createdAt).toLocaleString() : '';

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
    return wrapper;
  }

  function renderTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message model';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = 'Escribiendo…';
    wrapper.appendChild(bubble);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
    return wrapper;
  }

  // ── Conversaciones ─────────────────────────────────────────

  async function loadConversations() {
    const res = await fetch('/conversations/');
    if (!res.ok) return;
    const convs = await res.json();
    convListEl.innerHTML = '';
    convs.forEach(renderConvItem);
  }

  function renderConvItem(conv) {
    const item = document.createElement('div');
    item.className = 'conv-item' + (conv.id === currentConvId ? ' active' : '');
    item.dataset.id = conv.id;
    item.textContent = conv.title || `Conversación #${conv.id}`;
    item.addEventListener('click', () => selectConversation(conv.id));
    convListEl.appendChild(item);
  }

  async function selectConversation(convId) {
    currentConvId = convId;

    // Marcar activo en sidebar
    document.querySelectorAll('.conv-item').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.id) === convId);
    });

    // Habilitar composer
    promptInput.disabled = false;
    sendBtn.disabled = false;
    promptInput.focus();

    // Cargar mensajes
    chatEl.innerHTML = '';
    const res = await fetch(`/conversations/${convId}/messages`);
    if (!res.ok) return;
    const messages = await res.json();
    if (messages.length === 0) {
      const ph = document.createElement('div');
      ph.id = 'empty-state';
      ph.textContent = 'Aún no hay mensajes. ¡Escribí algo!';
      chatEl.appendChild(ph);
    } else {
      messages.forEach(m => renderMessage(m.role, m.content, m.created_at));
    }
  }

  newConvBtn.addEventListener('click', async () => {
    const res = await fetch('/conversations/', { method: 'POST' });
    if (!res.ok) return;
    const conv = await res.json();
    renderConvItem(conv);
    selectConversation(conv.id);
  });

  // ── Envío de mensajes ──────────────────────────────────────

  async function sendMessage() {
    const text = promptInput.value.trim();
    if (!text || !currentConvId) return;
    promptInput.value = '';
    sendBtn.disabled = true;

    renderMessage('user', text, new Date().toISOString());
    const typingEl = renderTyping();

    try {
      const res = await fetch(`/conversations/${currentConvId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      typingEl.remove();

      if (!res.ok) {
        const err = await res.text();
        renderMessage('model', `Error ${res.status}: ${err}`, new Date().toISOString());
        return;
      }

      const msg = await res.json();
      renderMessage(msg.role, msg.content, msg.created_at);
    } catch (err) {
      typingEl.remove();
      renderMessage('model', `Error de red: ${err.message}`, new Date().toISOString());
    } finally {
      sendBtn.disabled = false;
      promptInput.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  promptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) sendMessage();
  });

  // ── Init ──────────────────────────────────────────────────
  loadConversations();
});
