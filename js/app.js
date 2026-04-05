// ===========================
// HACKEROFADI CORE JS
// ===========================

// ===== GLOBALS =====
const currentUser = localStorage.getItem('currentUser');
let user = currentUser ? JSON.parse(localStorage.getItem(currentUser)) : null;

// SAFETY FIXES
if(user){
    user.completed = user.completed || [];
    user.badges = user.badges || [];
    user.streak = user.streak || 0;
    user.lastLogin = user.lastLogin || null;
    user.points = user.points || 0;
}

// ===== COMPLETION ANIMATION =====
function showCompletionAnimation(text){
    const div = document.createElement("div");
    div.className = "completion-popup";
    div.textContent = `🎉 ${text.toUpperCase()} COMPLETED!`;
    Object.assign(div.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "#0ff",
        color: "#111",
        padding: "10px 15px",
        borderRadius: "5px",
        boxShadow: "0 0 15px #0ff",
        fontFamily: "monospace",
        fontWeight: "bold",
        zIndex: 9999
    });
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 2500);
}

// ===== AUTH SYSTEM =====
function signup(){
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if(!username || !password){ alert("Fill all fields"); return; }
    if(localStorage.getItem(username)){ alert("User exists"); return; }

    const newUser = { 
        password, points:0, completed:[], badges:[], streak:0, lastLogin:null, tasks:[] 
    };

    localStorage.setItem(username, JSON.stringify(newUser));
    alert("Signup successful");
}

function login(){
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const userData = JSON.parse(localStorage.getItem(username));
    if(!userData || userData.password !== password){ alert("Invalid login"); return; }

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    // STREAK SYSTEM
    if(userData.lastLogin !== today){
        userData.streak = (userData.lastLogin === yesterday.toDateString()) ? (userData.streak+1) : 1;
        userData.points += 5; // daily reward
        userData.lastLogin = today;
    }

    localStorage.setItem(username, JSON.stringify(userData));
    localStorage.setItem("currentUser", username);
    window.location.href = "dashboard.html";
}

// ===== LESSON SYSTEM =====
let lessonData = null;
function initLesson(data){
    lessonData = data;
    updateProgress();
}

function choose(val){
    if(!lessonData || !user) return;

    const slot = document.getElementById("slot");
    const result = document.getElementById("result");
    const nextBtn = document.getElementById("nextBtn");
    const box = document.querySelector(".code-box");

    slot.textContent = val;
    box.classList.remove("correct","wrong");

    if(val === lessonData.correct){
        result.textContent = "✅ Correct!";
        box.classList.add("correct");
        if(nextBtn) nextBtn.style.display="inline-block";

        if(!user.completed.includes(lessonData.key)){
            user.points += 10;
            user.completed.push(lessonData.key);
            saveUser();
            updateProgress();
        }

    } else {
        result.textContent = "❌ Try again";
        box.classList.add("wrong");
        if(nextBtn) nextBtn.style.display="none";
    }
}

function next(){ if(lessonData?.next) window.location.href = lessonData.next; }
function prev(){ if(lessonData?.prev) window.location.href = lessonData.prev; }
function menu(){ if(lessonData?.menu) window.location.href = lessonData.menu; }

// ===== PROGRESS SYSTEM =====
function updateProgress(){
    if(!user || !lessonData) return;

    const total = lessonData.totalLessons || 5;
    const completed = user.completed.filter(c => c.startsWith(lessonData.lang)).length;
    const percent = Math.floor((completed/total)*100);

    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");
    const xpElem = document.getElementById("xp");

    if(bar) bar.style.width = `${percent}%`;
    if(text) text.textContent = `${percent}% completed`;
    if(xpElem) xpElem.textContent = user.points;

    if(percent===100 && !user.badges.includes(lessonData.lang)){
        user.badges.push(lessonData.lang);
        saveUser();
        showCompletionAnimation(lessonData.lang);
    }
}

// ===== TODO TRACKER =====
function initTodoTracker(containerId="todo-tracker"){
    const container = document.getElementById(containerId);
    if(!container) return;

    container.innerHTML = `
        <h2>Hackerofadi To-Do Tracker</h2>
        <input id="task-input" placeholder="Add task..." />
        <input id="task-deadline" type="datetime-local" />
        <select id="task-priority">
            <option value="🔥">🔥 Important</option>
            <option value="⚡">⚡ Intermediate</option>
            <option value="💤">💤 Low</option>
        </select>
        <button id="add-task">Add Task</button>
        <ul id="task-list"></ul>
    `;

    const taskList = container.querySelector("#task-list");
    const taskInput = container.querySelector("#task-input");
    const deadlineInput = container.querySelector("#task-deadline");
    const prioritySelect = container.querySelector("#task-priority");
    const addBtn = container.querySelector("#add-task");

    user.tasks = user.tasks || [];

    function renderTasks(){
        taskList.innerHTML="";
        const now = new Date();
        user.tasks.forEach((t,i)=>{
            const li = document.createElement("li");
            li.textContent = `${t.priority} ${t.text}`;
            if(t.done) li.classList.add("done");

            if(t.deadline){
                const dl = document.createElement("span");
                dl.className="deadline";
                const diffH = Math.floor((new Date(t.deadline)-now)/1000/60/60);
                dl.textContent = diffH>0? `${diffH}h left` : '⚠️ overdue';
                li.appendChild(dl);
            }

            li.onclick = ()=>{
                t.done = !t.done;
                user.points += t.done? 5 : -5;
                if(user.points<0) user.points=0;
                saveUser();
                renderTasks();
                showCompletionAnimation(t.done? t.text : `${t.text} undone`);
            };

            taskList.appendChild(li);
        });
    }

    addBtn.onclick = ()=>{
        if(taskInput.value.trim()==="") return;
        user.tasks.push({text:taskInput.value, priority:prioritySelect.value, deadline:deadlineInput.value, done:false});
        taskInput.value=""; deadlineInput.value="";
        saveUser(); renderTasks();
    };

    renderTasks();
}

// ===== SAVE USER =====
function saveUser(){
    if(currentUser && user){
        localStorage.setItem(currentUser, JSON.stringify(user));
    }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded",()=>{
    if(user) initTodoTracker();
});