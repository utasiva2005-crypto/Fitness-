document.addEventListener("DOMContentLoaded", function () {
  // API Keys
  const apiNinjasKey = 'Uez4mfjEZ4cbE1WhzidmgQ==yxg4RAF2Yf9tJiMv';

  // DOM Elements
  const strengthBtn = document.getElementById('strengthBtn');
  const fatLossBtn = document.getElementById('fatLossBtn');
  const workoutBtn = document.getElementById('workoutBtn');
  const muscleInputStrength = document.getElementById('muscleInputStrength');
  const activityInput = document.getElementById('activityInput');
  const resultsContainer = document.getElementById('exerciseResults');
  const form = document.getElementById('calorie-form');
  const resultDiv = document.getElementById('result');

  function clearResults() {
    resultsContainer.innerHTML = '';
  }

  // ✅ Strength Training
  strengthBtn?.addEventListener('click', function (e) {
    e.preventDefault();
    clearResults();
    const muscle = muscleInputStrength.value.trim().toLowerCase();
    if (!muscle) {
      resultsContainer.innerHTML = `<p class="text-danger">Please enter a muscle group (e.g. biceps, chest, glutes).</p>`;
      return;
    }
    window.location.href = `output.html?muscle=${encodeURIComponent(muscle)}`;
  });

  function fetchStrengthWorkout(muscle) {
    resultsContainer.innerHTML = `<p class="text-info">Loading exercises for <strong>${muscle}</strong>...</p>`;
    fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${encodeURIComponent(muscle)}`, {
      method: 'GET',
      headers: { 'X-Api-Key': apiNinjasKey }
    })
      .then(response => {
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        displayStrengthExercises(data, muscle);
        setTimeout(() => {
          window.location.href = 'output.html';
        }, 1000);
      })
      .catch(error => {
        clearResults();
        resultsContainer.innerHTML = `<p class="text-danger">Error fetching exercises: ${error.message}</p>`;
      });
  }

  function displayStrengthExercises(data, muscle) {
    if (!Array.isArray(data) || data.length === 0) {
      resultsContainer.innerHTML = `<p class="text-warning">No exercises found for "${muscle}".</p>`;
      return;
    }

    let html = `<h3 class="text-white">💪 Strength Exercises for ${muscle}</h3>`;
    data.forEach(exercise => {
      html += `
        <div class="card bg-dark text-white mb-3">
          <div class="card-body">
            <h5 class="card-title">${exercise.name || 'N/A'}</h5>
            <p><strong>Type:</strong> ${exercise.type || 'N/A'}</p>
            <p><strong>Difficulty:</strong> ${exercise.difficulty || 'N/A'}</p>
            <p><strong>Instructions:</strong> ${exercise.instructions || 'N/A'}</p>
          </div>
        </div>`;
    });
    resultsContainer.innerHTML = html;
  }

  // ✅ Fat Loss - Calories Burned
  fatLossBtn?.addEventListener('click', function (e) {
    e.preventDefault();
    clearResults();
    const activity = activityInput.value.trim().toLowerCase();
    if (!activity) {
      resultsContainer.innerHTML = `<p class="text-danger">Please enter an activity to calculate calories burned.</p>`;
      return;

    }
                window.location.href = `output.html?activity=${encodeURIComponent(activity)}`;
    resultsContainer.innerHTML = `<p class="text-info">Calculating calories burned for <strong>${activity}</strong>...</p>`;
    fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(activity)}`, {
      method: 'GET',
      headers: { 'X-Api-Key': apiNinjasKey }
    })
      .then(response => response.json())
      .then(data => {
        displayCalories(data);
        setTimeout(() => {
          window.location.href = 'output.html';
        }, 1000);
      })
      .catch(error => {
        clearResults();
        resultsContainer.innerHTML = `<p class="text-danger">Error fetching calorie data: ${error.message}</p>`;
      });
  });

  function displayCalories(data) {
    if (!Array.isArray(data) || data.length === 0) {
      resultsContainer.innerHTML = `<p class="text-warning">No calorie data found for this activity.</p>`;
      return;
      
    }
    let html = `<h3 class="text-white">🔥 Calories Burned</h3>`;
    data.forEach(entry => {
      html += `
        <div class="card bg-dark text-white mb-3">
          <div class="card-body">
            <h5 class="card-title">${entry.name || 'N/A'}</h5>
            <p><strong>Duration:</strong> ${entry.duration_minutes || 'N/A'} minutes</p>
            <p><strong>Calories Burned:</strong> ${entry.total_calories || 'N/A'} kcal</p>
          </div>
        </div>`;
    });
    resultsContainer.innerHTML = html;
  }
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  resultDiv.innerHTML = '';

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const age = parseFloat(document.getElementById('age').value);
  const sex = document.getElementById('sex').value;
  const activityLevel = document.getElementById('activity-level').value;

  if (isNaN(weight) || isNaN(height) || isNaN(age)) {
    resultDiv.innerHTML = `<p class="text-danger">Please enter valid numbers for weight, height, and age.</p>`;
    return;
  }

  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extremelyActive: 1.9
  };

  const multiplier = multipliers[activityLevel];
  if (!multiplier) {
    resultDiv.innerHTML = `<p class="text-danger">Invalid activity level selected.</p>`;
    return;
  }

  const maintenanceCalories = bmr * multiplier;
  const weightLossCalories = maintenanceCalories - 500;
  const weightGainCalories = maintenanceCalories + 500;

  const resultHTML = `
    <h3 class="text-white">📊 Calorie Results</h3>
    <div class="card bg-dark text-white mb-3">
      <div class="card-body">
        <p><strong>Maintenance Calories:</strong> ${maintenanceCalories.toFixed(2)} kcal/day</p>
        <p><strong>Weight Loss Calories:</strong> ${weightLossCalories.toFixed(2)} kcal/day</p>
        <p><strong>Weight Gain Calories:</strong> ${weightGainCalories.toFixed(2)} kcal/day</p>
      </div>
    </div>
  `;
  resultDiv.innerHTML = resultHTML;

  // ✅ Save data to localStorage and redirect
  const calorieTrackingData = {
    weight,
    height,
    age,
    sex,
    activityLevel,
    maintenance: maintenanceCalories.toFixed(2),
    loss: weightLossCalories.toFixed(2),
    gain: weightGainCalories.toFixed(2)
  };
  localStorage.setItem('calorieTrackingData', JSON.stringify(calorieTrackingData));

  // ✅ Redirect after storing data
  const query = `weight=${weight}&height=${height}&age=${age}&sex=${sex}&level=${activityLevel}`;
  window.location.href = `output.html?track=calories&${query}`;
});
});
// ✅ Workout Plan Data
const workoutPlan = {
  biceps: [
    { name: "Bicep Curl", sets: 3, reps: 12 },
    { name: "Hammer Curl", sets: 3, reps: 10 },
    { name: "Concentration Curl", sets: 3, reps: 12 },
    { name: "Preacher Curl", sets: 3, reps: 10 },
    { name: "Cable Curl", sets: 3, reps: 15 }
  ],
  triceps: [
    { name: "Tricep Dips", sets: 3, reps: 12 },
    { name: "Tricep Pushdown", sets: 3, reps: 10 },
    { name: "Overhead Tricep Extension", sets: 3, reps: 12 },
    { name: "Skull Crushers", sets: 3, reps: 10 },
    { name: "Close-Grip Bench Press", sets: 4, reps: 8 }
  ],
  chest: [
    { name: "Push-Up", sets: 3, reps: 15 },
    { name: "Bench Press", sets: 4, reps: 10 },
    { name: "Incline Dumbbell Press", sets: 3, reps: 12 },
    { name: "Chest Fly", sets: 3, reps: 12 },
    { name: "Cable Crossover", sets: 3, reps: 15 }
  ],
  back: [
    { name: "Deadlift", sets: 4, reps: 6 },
    { name: "Lat Pulldown", sets: 3, reps: 12 },
    { name: "Seated Row", sets: 3, reps: 10 },
    { name: "Bent Over Row", sets: 3, reps: 10 },
    { name: "Pull-Up", sets: 3, reps: 8 }
  ],
  legs: [
    { name: "Barbell Squat", sets: 4, reps: 8 },
    { name: "Lunges", sets: 3, reps: 12 },
    { name: "Leg Press", sets: 4, reps: 10 },
    { name: "Leg Curl", sets: 3, reps: 12 },
    { name: "Calf Raise", sets: 3, reps: 20 }
  ],
  shoulders: [
    { name: "Shoulder Press", sets: 3, reps: 10 },
    { name: "Lateral Raise", sets: 3, reps: 15 },
    { name: "Front Raise", sets: 3, reps: 12 },
    { name: "Arnold Press", sets: 3, reps: 10 },
    { name: "Upright Row", sets: 3, reps: 12 }
  ],
  core: [
    { name: "Plank", sets: 3, reps: 60 },
    { name: "Russian Twist", sets: 3, reps: 20 },
    { name: "Leg Raise", sets: 3, reps: 15 },
    { name: "Bicycle Crunch", sets: 3, reps: 20 },
    { name: "Mountain Climbers", sets: 3, reps: 30 }
  ],
  glutes: [
    { name: "Hip Thrust", sets: 3, reps: 12 },
    { name: "Glute Bridge", sets: 3, reps: 15 },
    { name: "Donkey Kick", sets: 3, reps: 20 },
    { name: "Cable Kickback", sets: 3, reps: 12 },
    { name: "Step-Up", sets: 3, reps: 10 }
  ],
  forearms: [
    { name: "Wrist Curl", sets: 3, reps: 15 },
    { name: "Reverse Wrist Curl", sets: 3, reps: 15 },
    { name: "Farmer's Walk", sets: 3, reps: 30 },
    { name: "Barbell Wrist Roller", sets: 3, reps: 10 },
    { name: "Towel Pull-Up", sets: 3, reps: 8 }
  ],
  calves: [
    { name: "Standing Calf Raise", sets: 3, reps: 20 },
    { name: "Seated Calf Raise", sets: 3, reps: 20 },
    { name: "Single-Leg Calf Raise", sets: 3, reps: 15 },
    { name: "Jump Rope", sets: 3, reps: 60 },
    { name: "Box Jumps", sets: 3, reps: 12 }
  ]
};

  // ✅ Add other muscle groups here...

// ✅ Embedded Workout Plan
const workoutBtn = document.getElementById("workoutBtn");

workoutBtn?.addEventListener("click", function (e) {
  e.preventDefault();

  const muscle = document.getElementById("muscleInputWorkout").value.trim().toLowerCase();
  if (!muscle) {
    alert("Please enter a muscle group.");
    return;
  }

  const exercises = workoutPlan[muscle];
  if (!exercises || exercises.length === 0) {
    alert(`No exercises found for "${muscle}".`);
    return;
  }

  // ✅ Save selected workout data
  localStorage.setItem("workoutPlanData", JSON.stringify(exercises));

  // ✅ Redirect to output.html
  window.location.href = `output.html?plan=${encodeURIComponent(muscle)}`;
});
