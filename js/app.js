// ==============================
// HACKEROFADI APP.JS
// FULL CYBERPUNK HUD + LESSONS + TODO
// ==============================

// ===== USER LOAD =====
const currentUser = localStorage.getItem('currentUser');
let user = currentUser ? JSON.parse(localStorage.getItem(currentUser)) : null;

if(!user){
    alert("Login first");
    window.location.href = "index.html";
}

// SAFETY
user.completed = user.completed || [];
user.badges = user.badges || [];
user.streak = user.streak || 0;

// ===== HUD UPDATE =====
function updateHUD(){
    document.getElementById("username").textContent = currentUser;
    document.getElementById("xp").textContent = user.points;
    document.getElementById("level").textContent = Math.floor(user.points/50)+1;
    document.getElementById("badges").textContent = user.badges.length ? user.badges.join(", ") : "None";
    document.getElementById("streak").textContent = user.streak;
}
updateHUD();

// ===== LEADERBOARD =====
const leaderboard = document.getElementById("leaderboard");
function renderLeaderboard(){
    leaderboard.innerHTML = "";
    let users = [];
    for(let i=0;i<localStorage.length;i++){
        const key = localStorage.key(i);
        if(key !== "currentUser"){
            try{
                const data = JSON.parse(localStorage.getItem(key));
                if(data && data.points!==undefined) users.push({name:key, points:data.points});
            }catch(e){}
        }
    }
    users.sort((a,b)=>b.points-a.points);
    users.forEach((u,index)=>{
        const div = document.createElement("div");
        div.className = "user-box";
        let achievement = "Beginner";
        if(u.points>50) achievement="Intermediate";
        if(u.points>150) achievement="Pro";
        div.innerHTML = `<span>#${index+1} ${u.name}</span><span>⭐ ${u.points} | ${achievement}</span>`;
        leaderboard.appendChild(div);
    });
}
renderLeaderboard();

// ===== LESSON NAVIGATION =====
let lessonData = null;
function initLesson(data){
    lessonData = data;
    updateProgress();
}
function goLessons(lang){ window.location.href = "./lessons.html?lang=" + lang; }

// ===== LESSON SYSTEM =====
function choose(val){
    if(!lessonData) return;
    const slot = document.getElementById("slot");
    const result = document.getElementById("result");
    const nextBtn = document.getElementById("nextBtn");
    const box = document.querySelector(".code-box");
    slot.textContent = val;
    box.classList.remove("correct","wrong");
    if(val === lessonData.correct){
        result.textContent = "✅ Correct!";
        box.classList.add("correct");
        if(nextBtn) nextBtn.style.display = "inline-block";
        if(!user.completed.includes(lessonData.key)){
            user.points += 10;
            user.completed.push(lessonData.key);
            localStorage.setItem(currentUser, JSON.stringify(user));
            updateProgress();
            updateHUD();
        }
    } else {
        result.textContent = "❌ Try again";
        box.classList.add("wrong");
        if(nextBtn) nextBtn.style.display = "none";
    }
}
function next(){ window.location.href = lessonData.next; }
function prev(){ window.location.href = lessonData.prev; }
function menu(){ window.location.href = lessonData.menu; }

// ===== PROGRESS =====
function updateProgress(){
    if(!user || !lessonData) return;
    const total = lessonData.totalLessons || 5;
    const completed = user.completed.filter(c=>c.startsWith(lessonData.lang)).length;
    const percent = Math.floor((completed/total)*100);
    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");
    const xp = document.getElementById("xp");
    if(bar) bar.style.width = percent + "%";
    if(text) text.textContent = percent+"% completed";
    if(xp) xp.textContent = user.points;

    // BADGES
    if(percent === 100 && !user.badges.includes(lessonData.lang)){
        user.badges.push(lessonData.lang);
        localStorage.setItem(currentUser, JSON.stringify(user));
        showCompletionAnimation(lessonData.lang);
        updateHUD();
    }
}

// ===== COMPLETION ANIMATION =====
function showCompletionAnimation(lang){
    const div = document.createElement("div");
    div.className = "completion-popup";
    div.textContent = "🎉 "+lang.toUpperCase()+" COMPLETED!";
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),2500);
}

// ===== AUTH =====
function signup(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if(localStorage.getItem(username)){
        alert("User exists");
        return;
    }
    const newUser = { password, points:0, completed:[], badges:[], streak:0, lastLogin:null };
    localStorage.setItem(username, JSON.stringify(newUser));
    alert("Signup successful");
}

function login(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const userData = JSON.parse(localStorage.getItem(username));
    if(userData && userData.password===password){
        const today = new Date().toDateString();
        if(userData.lastLogin !== today){
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);
            if(userData.lastLogin === yesterday.toDateString()) userData.streak+=1;
            else userData.streak=1;
            userData.points+=5; // daily bonus
            userData.lastLogin = today;
        }
        localStorage.setItem(username, JSON.stringify(userData));
        localStorage.setItem("currentUser", username);
        window.location.href="dashboard.html";
    } else alert("Invalid login");
}

// ===== TODO TRACKER =====
function initTodoTracker(){
    const todoDiv = document.getElementById("todo-tracker");
    todoDiv.innerHTML=`
        <h2>To-Do Tracker</h2>
        <input type="text" id="task-input" placeholder="Add new task...">
        <select id="priority">
            <option value="🔥">Important</option>
            <option value="⚡">Intermediate</option>
            <option value="💤">Low</option>
        </select>
        <input type="date" id="deadline">
        <button onclick="addTask()">Add Task</button>
        <ul id="task-list"></ul>
    `;
    renderTasks();
}

let tasks = JSON.parse(localStorage.getItem(currentUser+"_tasks")) || [];

function renderTasks(){
    const ul = document.getElementById("task-list");
    ul.innerHTML="";
    tasks.forEach((t,index)=>{
        const li = document.createElement("li");
        li.innerHTML=`<span>${t.priority} ${t.text} <span class="deadline">${t.deadline||""}</span></span>`;
        if(t.done) li.classList.add("done");
        li.onclick = ()=>{
            t.done=!t.done;
            if(t.done) user.points+=5; // reward points
            localStorage.setItem(currentUser+"_tasks",JSON.stringify(tasks));
            localStorage.setItem(currentUser, JSON.stringify(user));
            renderTasks();
            updateHUD();
        }
        ul.appendChild(li);
    });
}

function addTask(){
    const text=document.getElementById("task-input").value;
    const priority=document.getElementById("priority").value;
    const deadline=document.getElementById("deadline").value;
    if(!text) return alert("Add task text!");
    tasks.push({text,priority,deadline,done:false});
    localStorage.setItem(currentUser+"_tasks",JSON.stringify(tasks));
    document.getElementById("task-input").value="";
    renderTasks();
}