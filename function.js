const todoInput = document.querySelector('#inputTodo');
const addTodoButton = document.querySelector('#buttonTodoAdd');
const todoList = document.querySelector('#listTodo');
const form = document.querySelector('#todoForm');
const editModal = document.querySelector('#editModal');
const editInput = document.querySelector('#modal-input');
const saveEdit = document.querySelector('#saveEdit');
const cancelEdit = document.querySelector('#cancelEdit');
// store data in array
const todos = JSON.parse(localStorage.getItem('todos')) || [];
function addTodo() {
  const task = todoInput.value.trim();
  if (!task) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'A task is required! Please enter what you want to do',
      confirmButtonColor: 'rgba(43, 108, 238, 0.9)', // DOUBLE QUOTES
    });
    return;
  }
  // get value user and push it into todos JSON.parse
  todos.push({
    text: task,
    completed: false,
  });

  todoInput.value = '';
  todoInput.focus();
  saveTodos();
  renderTodos(); // need tawagin para mailabas yung data sa localStorage
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  addTodo();
});

// save to local sotrage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

let currentIndex = null;

function editTodo(index) {
  currentIndex = index; // store index
  editInput.value = todos[index].text; // show value current value before edit
  editModal.style.display = 'block'; // show modal
}

// need outside the editTodo function but its connected
// save edit modal
saveEdit.addEventListener('click', function () {
  const newTask = editInput.value.trim();

  if (newTask) {
    todos[currentIndex].text = newTask;
    saveTodos();
    renderTodos();
  }
  editModal.style.display = 'none'; // automatic close modal after click done
});

// cancel edit modal
cancelEdit.addEventListener('click', function () {
  editModal.style.display = 'none';
});

function renderTodos() {
  todoList.innerHTML = '';

  // count the task
  const countTask = document.querySelector('#countTask');
  countTask.textContent = todos.length; // get the size of object array

  // loop and do for each loop
  todos.forEach((todo, index) => {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    // Left section
    const leftSection = document.createElement('div');
    leftSection.className = 'todo-left';
    // Circle
    const circle = document.createElement('div');
    circle.className = 'todo-circle';
    // img
    const checkImg = document.createElement('img');

    // Text
    circle.onclick = function () {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
    };

    // Text
    const text = document.createElement('p');
    text.className = 'todo-text';
    text.textContent = todo.text;

    // check if task is done then do the line-through
    if (todo.completed) {
      text.style.textDecoration = 'line-through';
      text.style.opacity = '0.6';
      checkImg.src =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/20px-Flat_tick_icon.svg.png';
      checkImg.style.width = '20px';
      checkImg.style.height = '20px';
      circle.appendChild(checkImg);
    }

    // Right section (buttons)
    const rightSection = document.createElement('div');
    rightSection.className = 'todo-actions';
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'todo-btn todo-btn-edit';
    editBtn.innerHTML =
      '<span><i class="fa-solid fa-pen-to-square"></i></span>';
    editBtn.onclick = () => editTodo(index); // for ui modal
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-btn todo-btn-delete';
    deleteBtn.innerHTML = '<span><i class="fa-solid fa-trash"></i></span>';
    deleteBtn.onclick = function () {
      todos.splice(index, 1);
      localStorage.setItem('todos', JSON.stringify(todos));
      renderTodos();
    };
    // Build structure
    leftSection.appendChild(circle);
    leftSection.appendChild(text);
    rightSection.appendChild(editBtn);
    rightSection.appendChild(deleteBtn);
    todoItem.appendChild(leftSection);
    todoItem.appendChild(rightSection);
    todoList.appendChild(todoItem);
  });
}
// even the page reload still there the ui data
renderTodos();
