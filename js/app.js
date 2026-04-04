// ===== COMPLETION ANIMATION =====
function showCompletionAnimation(lang){
    const div = document.createElement("div");
    div.className = "completion-popup";
    div.textContent = "🎉 " + lang.toUpperCase() + " COMPLETED!";

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);
}

// ===== NAVIGATION =====
function goLessons(lang){
    window.location.href = "./lessons.html?lang=" + lang;
}

// ===== USER LOAD =====
const currentUser = localStorage.getItem('currentUser');
let user = currentUser ? JSON.parse(localStorage.getItem(currentUser)) : null;

// SAFETY FIXES
if(user){
    user.completed = user.completed || [];
    user.badges = user.badges || [];
}

// ===== LESSON SYSTEM =====
let lessonData = null;

function initLesson(data){
    lessonData = data;
    updateProgress();
}

function choose(val){
    const slot = document.getElementById("slot");
    const result = document.getElementById("result");
    const nextBtn = document.getElementById("nextBtn");
    const box = document.querySelector(".code-box");

    slot.textContent = val;
    box.classList.remove("correct", "wrong");

    if(val === lessonData.correct){
        result.textContent = "✅ Correct!";
        box.classList.add("correct");

        if(nextBtn) nextBtn.style.display = "inline-block";

        if(user && !user.completed.includes(lessonData.key)){
            user.points += 10;
            user.completed.push(lessonData.key);

            localStorage.setItem(currentUser, JSON.stringify(user));
            updateProgress(); // 🔥 IMPORTANT
        }

    } else {
        result.textContent = "❌ Try again";
        box.classList.add("wrong");

        if(nextBtn) nextBtn.style.display = "none";
    }
}

// ===== NAVIGATION =====
function next(){ window.location.href = lessonData.next; }
function prev(){ window.location.href = lessonData.prev; }
function menu(){ window.location.href = lessonData.menu; }

// ===== PROGRESS SYSTEM =====
function updateProgress(){
    if(!user || !lessonData) return;

    const total = lessonData.totalLessons || 5;

    const completed = user.completed.filter(c =>
        c.startsWith(lessonData.lang)
    ).length;

    const percent = Math.floor((completed / total) * 100);

    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");
    const xp = document.getElementById("xp");

    if(bar) bar.style.width = percent + "%";
    if(text) text.textContent = percent + "% completed";
    if(xp) xp.textContent = user.points;

    // ===== BADGE SYSTEM =====
    if(percent === 100){
        if(!user.badges.includes(lessonData.lang)){
            user.badges.push(lessonData.lang);

            localStorage.setItem(currentUser, JSON.stringify(user));

            showCompletionAnimation(lessonData.lang);
        }
    }
}

// ===== AUTH SYSTEM =====
function signup(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(localStorage.getItem(username)){
        alert("User exists");
        return;
    }

    const newUser = {
        password,
        points: 0,
        completed: [],
        badges: [],
        streak: 0,
        lastLogin: null
    };

    localStorage.setItem(username, JSON.stringify(newUser));
    alert("Signup successful");
}

// ===== LOGIN + STREAK SYSTEM =====
function login(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const userData = JSON.parse(localStorage.getItem(username));

    if(userData && userData.password === password){

        const today = new Date().toDateString();

        if(userData.lastLogin !== today){

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if(userData.lastLogin === yesterday.toDateString()){
                userData.streak += 1;
            } else {
                userData.streak = 1;
            }

            // 🎁 DAILY REWARD
            userData.points += 5;

            userData.lastLogin = today;
        }

        localStorage.setItem(username, JSON.stringify(userData));
        localStorage.setItem("currentUser", username);

        window.location.href = "dashboard.html";

    } else {
        alert("Invalid login");
    }
}