/* ═══════════════════════════════════════════════════
   TODOLIST APP  —  function.js
   Original logic kept intact, wired to new layout.
════════════════════════════════════════════════════ */

// ── DOM ──────────────────────────────────────────────────────────
const todoInput = document.querySelector('#inputTodo');
const addTodoButton = document.querySelector('#buttonTodoAdd');
const todoList = document.querySelector('#listTodo');
const form = document.querySelector('#todoForm');
const editModal = document.querySelector('#editModal');
const editInput = document.querySelector('#modal-input');
const saveEdit = document.querySelector('#saveEdit');
const cancelEdit = document.querySelector('#cancelEdit');
const closeEditModal = document.querySelector('#closeEditModal');
const countTask = document.querySelector('#countTask');
const fabBtn = document.querySelector('#fabBtn');
const mobileBack = document.querySelector('#mobileBack');
const clearCompleted = document.querySelector('#clearCompleted');
const panelTitle = document.querySelector('#panelTitle');
const appShell = document.querySelector('.app-shell');

// Stat elements
const totalCount = document.querySelector('#totalCount');
const activeCount = document.querySelector('#activeCount');
const doneCount = document.querySelector('#doneCount');
const badgeAll = document.querySelector('#badgeAll');
const badgeActive = document.querySelector('#badgeActive');
const badgeDone = document.querySelector('#badgeDone');

// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');

// ── STATE ────────────────────────────────────────────────────────
// Keep original localStorage key 'todos' and {text, completed} shape
const todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentIndex = null;
let activeFilter = 'all'; // 'all' | 'active' | 'completed'

// ── STORAGE ──────────────────────────────────────────────────────
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── HELPERS ──────────────────────────────────────────────────────
function filteredTodos() {
  if (activeFilter === 'active') return todos.filter((t) => !t.completed);
  if (activeFilter === 'completed') return todos.filter((t) => t.completed);
  return todos;
}

const filterLabels = {
  all: 'All Tasks',
  active: 'Active',
  completed: 'Completed',
};

// ── UPDATE STATS & BADGES ────────────────────────────────────────
function updateStats() {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const active = total - done;
  const shown = filteredTodos().length;

  totalCount.textContent = total;
  activeCount.textContent = active;
  doneCount.textContent = done;

  badgeAll.textContent = total;
  badgeActive.textContent = active;
  badgeDone.textContent = done;

  countTask.textContent = shown;
}

// ── RENDER ───────────────────────────────────────────────────────
function renderTodos() {
  todoList.innerHTML = '';
  updateStats();

  const list = filteredTodos();

  if (list.length === 0) {
    const messages = {
      all: ['No tasks yet', 'Add your first task above.'],
      active: ['All caught up!', 'No active tasks remaining.'],
      completed: ['Nothing completed yet', 'Finish a task to see it here.'],
    };
    const [title, sub] = messages[activeFilter];
    todoList.innerHTML = `
      <div class="empty-tasks">
        <strong>${title}</strong>
        <p>${sub}</p>
      </div>`;
    return;
  }

  // Map filtered todos back to real index in todos[]
  list.forEach((todo) => {
    const index = todos.indexOf(todo);

    // ── Build item ──
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';

    // Left section
    const leftSection = document.createElement('div');
    leftSection.className = 'todo-left';

    // Circle checkbox
    const circle = document.createElement('div');
    circle.className = 'todo-circle' + (todo.completed ? ' checked' : '');
    if (todo.completed) {
      circle.innerHTML = '<i class="fa-solid fa-check"></i>';
    }

    circle.addEventListener('click', (e) => {
      e.stopPropagation();
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
    });

    // Text
    const text = document.createElement('p');
    text.className = 'todo-text' + (todo.completed ? ' done' : '');
    text.textContent = todo.text;

    // Click anywhere on item toggles completion
    todoItem.addEventListener('click', () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
    });

    // Right section (edit + delete)
    const rightSection = document.createElement('div');
    rightSection.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-btn todo-btn-edit';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editTodo(index);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-btn todo-btn-delete';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    // Assemble
    leftSection.appendChild(circle);
    leftSection.appendChild(text);
    rightSection.appendChild(editBtn);
    rightSection.appendChild(deleteBtn);
    todoItem.appendChild(leftSection);
    todoItem.appendChild(rightSection);
    todoList.appendChild(todoItem);
  });
}

// ── ADD TODO ─────────────────────────────────────────────────────
function addTodo() {
  const task = todoInput.value.trim();

  if (!task) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'A task is required! Please enter what you want to do',
      confirmButtonColor: '#EC5B13',
    });
    return;
  }

  todos.push({ text: task, completed: false });
  todoInput.value = '';
  todoInput.focus();
  saveTodos();

  // Switch to "all" filter so the new task is visible
  setFilter('all');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo();
});

// FAB opens keyboard focus on the input (slides to main panel on mobile)
fabBtn.addEventListener('click', () => {
  appShell.classList.add('panel-open');
  setTimeout(() => todoInput.focus(), 320);
});

// ── EDIT TODO ────────────────────────────────────────────────────
function editTodo(index) {
  currentIndex = index;
  editInput.value = todos[index].text;
  openModal();
}

saveEdit.addEventListener('click', () => {
  const newTask = editInput.value.trim();
  if (newTask) {
    todos[currentIndex].text = newTask;
    saveTodos();
    renderTodos();
  }
  closeModal();
});

// ── CLEAR COMPLETED ──────────────────────────────────────────────
clearCompleted.addEventListener('click', () => {
  const count = todos.filter((t) => t.completed).length;
  if (!count) return;

  Swal.fire({
    title: `Clear ${count} completed task${count > 1 ? 's' : ''}?`,
    text: 'This cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Clear',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      // Remove completed in-place (keep original array reference)
      for (let i = todos.length - 1; i >= 0; i--) {
        if (todos[i].completed) todos.splice(i, 1);
      }
      saveTodos();
      renderTodos();
    }
  });
});

// ── FILTERS ──────────────────────────────────────────────────────
function setFilter(filter) {
  activeFilter = filter;

  filterBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  panelTitle.textContent = filterLabels[filter];

  // On mobile, slide to the main panel when a filter is picked
  appShell.classList.add('panel-open');

  renderTodos();
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Mobile back — return to sidebar
mobileBack.addEventListener('click', () => {
  appShell.classList.remove('panel-open');
});

// ── MODAL HELPERS ────────────────────────────────────────────────
function openModal() {
  editModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => editInput.focus(), 80);
}

function closeModal() {
  editModal.classList.remove('open');
  document.body.style.overflow = '';
}

cancelEdit.addEventListener('click', closeModal);
closeEditModal.addEventListener('click', closeModal);

// Close on backdrop click
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editModal.classList.contains('open')) closeModal();
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === 'Enter' &&
    editModal.classList.contains('open')
  ) {
    saveEdit.click();
  }
});

// ── INIT ─────────────────────────────────────────────────────────
renderTodos();
