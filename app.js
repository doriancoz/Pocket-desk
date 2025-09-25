// Register the service worker (for offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

// Install prompt (Android/desktop). iOS uses "Add to Home Screen" manually.
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  installBtn.hidden = true;
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});

// Local storage helpers
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// NOTES
const notesEl = document.getElementById('notes');
const saveNotesBtn = document.getElementById('saveNotes');
const notesSaved = document.getElementById('notesSaved');
notesEl.value = load('pd_notes', '');
saveNotesBtn.addEventListener('click', () => {
  save('pd_notes', notesEl.value);
  notesSaved.textContent = 'Saved';
  setTimeout(()=> notesSaved.textContent = '', 1200);
});

// TODOS
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const clearDoneBtn = document.getElementById('clearDone');
const todoCount = document.getElementById('todoCount');

let todos = load('pd_todos', []);
const renderTodos = () => {
  todoList.innerHTML = '';
  let remaining = 0;
  todos.forEach((t, i) => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!t.done;
    cb.addEventListener('change', () => {
      todos[i].done = cb.checked;
      save('pd_todos', todos);
      renderTodos();
    });
    const span = document.createElement('span');
    span.textContent = t.text;
    span.style.textDecoration = t.done ? 'line-through' : 'none';
    span.style.opacity = t.done ? '.6' : '1';
    const spacer = document.createElement('div');
    spacer.className = 'spacer';
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'delete';
    del.addEventListener('click', () => {
      todos.splice(i,1);
      save('pd_todos', todos);
      renderTodos();
    });
    li.append(cb, span, spacer, del);
    todoList.append(li);
    if (!t.done) remaining++;
  });
  todoCount.textContent = remaining + ' remaining';
};
renderTodos();

const addTodo = () => {
  const text = (todoInput.value || '').trim();
  if (!text) return;
  todos.unshift({ text, done: false });
  save('pd_todos', todos);
  todoInput.value = '';
  renderTodos();
};
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});
clearDoneBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save('pd_todos', todos);
  renderTodos();
});

// LINKS
const linkTitle = document.getElementById('linkTitle');
const linkURL = document.getElementById('linkURL');
const addLinkBtn = document.getElementById('addLink');
const linkList = document.getElementById('linkList');

let links = load('pd_links', []);
const renderLinks = () => {
  linkList.innerHTML = '';
  links.forEach((l, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = l.title || l.url;
    const spacer = document.createElement('div');
    spacer.className = 'spacer';
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'delete';
    del.addEventListener('click', () => {
      links.splice(i,1);
      save('pd_links', links);
      renderLinks();
    });
    li.append(a, spacer, del);
    linkList.append(li);
  });
};
renderLinks();

const addLink = () => {
  const title = (linkTitle.value || '').trim();
  const url = (linkURL.value || '').trim();
  if (!url) return;
  const normalized = url.match(/^https?:\/\//) ? url : 'https://' + url;
  links.unshift({ title, url: normalized });
  save('pd_links', links);
  linkTitle.value=''; linkURL.value='';
  renderLinks();
};
addLinkBtn.addEventListener('click', addLink);
linkURL.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') addLink(); });
