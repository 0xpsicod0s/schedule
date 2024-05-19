const searchInput = document.querySelector('.search-input');
const btnAddTask = document.querySelector('button');
const saveButton = document.querySelector('.save-button');
const cancelButton = document.querySelector('.cancel-button');
const notifyButton = document.querySelector('.notify-button');

const tasksArray = JSON.parse(localStorage.getItem("tasks")) || [];


if (("Notification" in window) && Notification.permission === 'granted') notifyButton.classList.add('disabled');

function saveLocalStorage(tasksArray) {
    if (window.localStorage) {
        localStorage.setItem("tasks", JSON.stringify(tasksArray));
    }
}

function insertTask(taskName, taskDate) {
    const taskList = document.querySelector('.task-list');
    taskList.innerHTML += `
        <li>
            <span class="task-text">${taskName}</span>
            <span class="task-date">${taskDate}</span>
            <span class="delete-button">&times;</span>
        </li>
    `;
}

function createCalendar(year, month) {
    const element = document.querySelector('.calendar');
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const date = new Date(year, month);
    
    element.innerHTML = '';
    days.forEach(day => {
        element.innerHTML += `<div class="header">${day}</div>`
    });
    
    while (date.getMonth() === month) {
        element.innerHTML += `<div class="day">${date.getDate()}</div>`
        date.setDate(date.getDate() + 1);
    }
}

function formatDate(number) {
    return number < 10 ? `0${number}` : number;
}

function getDate(year, month, day) {
    const date = new Date(year, month, day);
    return `${formatDate(date.getDate())}/${formatDate(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function showNotification() {
    const li = document.querySelectorAll('li');
    li.forEach(task => {
        const { textContent: taskDate } = task.querySelector('.task-date');
        const taskDay = taskDate.slice(0, 2);
        const taskMonth = taskDate.slice(3, 5);
        const taskYear = taskDate.slice(6, 10);
        const currentDay = formatDate(new Date().getDate());
        const currentMonth = formatDate(new Date().getMonth() + 1);
        const currentYear = formatDate(new Date().getFullYear());
        if (currentDay == taskDay && currentMonth == taskMonth && currentYear == taskYear) {
            const { textContent: taskName } = task.querySelector('.task-text');
            if (Notification.permission === 'granted') {
                new Notification(`Tarefa do dia: ${taskName}`, {
                    body: `Hoje, no dia ${currentDay}, você tem uma tarefa`
                });
            }
        }

    });
}

btnAddTask.onclick = () => {
    const calendar = document.querySelector('.calendar-container');
    const taskInput = document.querySelector('.task-input');
    createCalendar(new Date().getFullYear(), new Date().getMonth());
    const days = document.querySelectorAll('.day');
    
    if (!taskInput.value) return;
    calendar.classList.remove('disabled');
    let daySelected = null;
    days.forEach(day => {
        day.onclick = () => {
            if (daySelected) daySelected.classList.remove('selected');
            daySelected = day;
            day.classList.add('selected');
        }
    });
}

searchInput.oninput = () => {
    const tasks = document.querySelectorAll('li');
    tasks.forEach(task => {
        const lowerCaseTask = task.textContent.replace('\u00d7', '').toLowerCase();
        const lowerCaseSearch = searchInput.value.toLowerCase();
        if (lowerCaseTask.includes(lowerCaseSearch)) {
            task.style.display = 'block';
            return;
        }
        task.style.display = 'none';
    });
}

saveButton.onclick = () => {
    const taskInput = document.querySelector('.task-input');
    const calendar = document.querySelector('.calendar-container');
    const daySelected = document.querySelector('.selected');
    const date = getDate(new Date().getFullYear(), new Date().getMonth(), daySelected.textContent);
    if (!taskInput.value) return;
    tasksArray.push({
        taskName: taskInput.value,
        taskDate: date
    });
    insertTask(taskInput.value, date);
    saveLocalStorage(tasksArray);
    calendar.classList.add('disabled');
}

cancelButton.onclick = () => document.querySelector('.calendar-container').classList.add('disabled');

notifyButton.onclick = () => {
    if (!("Notification" in window)) {
        const errorMsg = document.querySelector('.error-message');
        errorMsg.classList.remove('disabled');
        return;
    }
    Notification.requestPermission().then(notification => notification === 'granted' ? notifyButton.classList.add('disabled') : '');
}

window.onload = () => {
    tasksArray.forEach(({ taskName, taskDate }) => insertTask(taskName, taskDate));
    showNotification();
    
    const btnDelTask = document.querySelectorAll('.delete-button');
    btnDelTask.forEach(button => {
        button.onclick = ({ target }) => {
            const taskRemoved = target.parentElement;
            tasksArray.forEach(({ taskName }, index) => {
                if (taskName === taskRemoved.querySelector('.task-text').textContent) {
                    tasksArray.splice(index, 1);
                };
            });
            taskRemoved.remove();
            saveLocalStorage(tasksArray);
        }
    });
}