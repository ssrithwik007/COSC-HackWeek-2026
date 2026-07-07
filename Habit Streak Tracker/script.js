// State
let habits = [];

// DOM Elements
const addHabitForm = document.getElementById('add-habit-form');
const habitNameInput = document.getElementById('habit-name-input');
const habitsContainer = document.getElementById('habits-container');

const totalHabitsEl = document.getElementById('total-habits');
const completedTodayEl = document.getElementById('completed-today');
const longestStreakEl = document.getElementById('longest-streak');
const longestAllTimeEl = document.getElementById('longest-all-time');

// Format date to YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate the last 30 days array
function getPast30Days() {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(formatDate(d));
    }
    return days;
}

// Load from LocalStorage
function loadHabits() {
    const saved = localStorage.getItem('habitStreakTracker_habits');
    if (saved) {
        habits = JSON.parse(saved);
        habits.forEach(h => {
            if (!Array.isArray(h.completedDates)) h.completedDates = [];
        });
    }
    renderHabits();
    updateDashboard();
}

// Save to LocalStorage
function saveHabits() {
    localStorage.setItem('habitStreakTracker_habits', JSON.stringify(habits));
    updateDashboard();
}

// Add a new habit
function addHabit(e) {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    
    if (!name) return;
    
    if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
        alert('A habit with this name already exists!');
        return;
    }

    const newHabit = {
        id: Date.now().toString(),
        name,
        completedDates: []
    };

    habits.push(newHabit);
    saveHabits();
    habitNameInput.value = '';
    renderHabits();
}

// Delete a habit
function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        renderHabits();
    }
}

// Toggle completion for a specific date
function toggleCompletion(habitId, dateStr) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = formatDate(new Date());
    if (dateStr > today) return; 

    const dateIndex = habit.completedDates.indexOf(dateStr);
    
    if (dateIndex === -1) {
        habit.completedDates.push(dateStr);
    } else {
        habit.completedDates.splice(dateIndex, 1);
    }
    
    saveHabits();
    renderHabits(); 
}

// Calculate streak
function calculateStreak(habit) {
    const todayStr = formatDate(new Date());
    let streak = 0;
    let d = new Date();
    
    // Check if today is completed
    if (habit.completedDates.includes(todayStr)) {
        let checkStr = todayStr;
        while (habit.completedDates.includes(checkStr)) {
            streak++;
            d.setDate(d.getDate() - 1);
            checkStr = formatDate(d);
        }
    } else {
        // Evaluate yesterday
        d.setDate(d.getDate() - 1);
        let yesterdayStr = formatDate(d);
        
        if (habit.completedDates.includes(yesterdayStr)) {
            let checkStr = yesterdayStr;
            while (habit.completedDates.includes(checkStr)) {
                streak++;
                d.setDate(d.getDate() - 1);
                checkStr = formatDate(d);
            }
        }
    }

    return streak;
}

// Calculate longest streak of all time
function calculateBestStreak(habit) {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const sortedDates = [...habit.completedDates].sort();
    let best = 1;
    let current = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1]);
        const currDate = new Date(sortedDates[i]);
        
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            current++;
            if (current > best) best = current;
        } else if (diffDays > 1) {
            current = 1;
        }
    }
    
    return best;
}

// Render the calendar for a habit
function renderCalendar(habit, container) {
    container.innerHTML = '';
    const past30Days = getPast30Days();
    const today = formatDate(new Date());

    past30Days.forEach(dateStr => {
        const isCompleted = habit.completedDates.includes(dateStr);
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        const box = document.createElement('div');
        box.className = 'day-box';
        if (isCompleted) box.classList.add('completed');
        if (isToday) box.classList.add('today');
        if (isFuture) box.classList.add('future');
        
        const displayDate = new Date(dateStr).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
        box.setAttribute('data-date', displayDate);

        if (!isFuture) {
            box.addEventListener('click', () => toggleCompletion(habit.id, dateStr));
        }
        
        container.appendChild(box);
    });
}

// Render all habits
function renderHabits() {
    habitsContainer.innerHTML = '';
    
    if (habits.length === 0) {
        habitsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No habits added yet. Start by adding one above!</p>';
        return;
    }

    habits.forEach(habit => {
        const streak = calculateStreak(habit);
        const bestStreak = calculateBestStreak(habit);
        const totalCompleted = habit.completedDates.length;
        
        const card = document.createElement('div');
        card.className = 'habit-card';
        
        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-info">
                    <h2>${habit.name}</h2>
                    <div class="habit-stats">
                        <span>Streak: <span class="streak-highlight">${streak}</span></span>
                        <span>Best: <strong>${bestStreak}</strong></span>
                        <span>Total: <strong>${totalCompleted}</strong> days</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteHabit('${habit.id}')">Delete</button>
            </div>
            <div class="calendar-container" id="calendar-${habit.id}"></div>
        `;
        
        habitsContainer.appendChild(card);
        
        const calendarContainer = document.getElementById(`calendar-${habit.id}`);
        renderCalendar(habit, calendarContainer);
    });
}

// Update Dashboard Statistics
function updateDashboard() {
    const today = formatDate(new Date());
    
    const totalCount = habits.length;
    const completedTodayCount = habits.filter(h => h.completedDates.includes(today)).length;
    
    let maxStreak = 0;
    let maxAllTime = 0;
    habits.forEach(h => {
        const streak = calculateStreak(h);
        const best = calculateBestStreak(h);
        if (streak > maxStreak) maxStreak = streak;
        if (best > maxAllTime) maxAllTime = best;
    });

    totalHabitsEl.textContent = totalCount;
    completedTodayEl.textContent = completedTodayCount;
    longestStreakEl.textContent = maxStreak;
    if (longestAllTimeEl) longestAllTimeEl.textContent = maxAllTime;
}

// Event Listeners
addHabitForm.addEventListener('submit', addHabit);

// Initialization
document.addEventListener('DOMContentLoaded', loadHabits);
