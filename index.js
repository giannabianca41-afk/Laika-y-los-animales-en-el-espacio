// --- STARFIELD CANVAS BACKGROUND ---
const starsCanvas = document.getElementById('stars-canvas');
const starsCtx = starsCanvas.getContext('2d');
let stars = [];

function resizeCanvas() {
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  stars = [];
  const starCount = Math.floor((starsCanvas.width * starsCanvas.height) / 8000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      radius: Math.random() * 1.5,
      color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
      blinkSpeed: Math.random() * 0.02 + 0.005,
      blinkDir: Math.random() > 0.5 ? 1 : -1,
      opacity: Math.random()
    });
  }
}

function drawStars() {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  stars.forEach(star => {
    // Animate opacity
    star.opacity += star.blinkSpeed * star.blinkDir;
    if (star.opacity >= 1) {
      star.opacity = 1;
      star.blinkDir = -1;
    } else if (star.opacity <= 0.1) {
      star.opacity = 0.1;
      star.blinkDir = 1;
    }

    starsCtx.beginPath();
    starsCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starsCtx.fillStyle = star.color.replace(/[^,]+(?=\))/, star.opacity);
    starsCtx.fill();
  });
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawStars);


// --- SLIDE NAVIGATION SYSTEM ---
const slides = document.querySelectorAll('.slide');
const navDots = document.querySelectorAll('.nav-dot');
const progressBar = document.getElementById('progress-bar');
let currentSlideIndex = 0;

function showSlide(index) {
  if (index < 0 || index >= slides.length) return;

  // Deactivate current slide
  slides[currentSlideIndex].classList.remove('active');
  navDots[currentSlideIndex].classList.remove('active');

  // Activate new slide
  currentSlideIndex = index;
  slides[currentSlideIndex].classList.add('active');
  navDots[currentSlideIndex].classList.add('active');

  // Update progress bar
  const progressPercent = (currentSlideIndex / (slides.length - 1)) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Specific slide actions (e.g. stop game if we leave slide 4)
  if (currentSlideIndex !== 4) {
    stopGame();
  }
}

// Navigation Event Listeners
document.getElementById('start-btn').addEventListener('click', () => showSlide(1));
document.getElementById('restart-all-btn').addEventListener('click', () => {
  resetQuiz();
  showSlide(0);
});

document.querySelectorAll('.prev-slide-btn').forEach(btn => {
  btn.addEventListener('click', () => showSlide(currentSlideIndex - 1));
});

document.querySelectorAll('.next-slide-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Special exception for next on quiz slide: don't let next-slide-btn do normal navigation if it's the skip btn
    if (btn.id === 'quiz-skip-btn') {
      showSlide(currentSlideIndex + 1);
    } else {
      showSlide(currentSlideIndex + 1);
    }
  });
});

navDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const slideIdx = parseInt(dot.getAttribute('data-slide'));
    showSlide(slideIdx);
  });
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
    if (currentSlideIndex < slides.length - 1) showSlide(currentSlideIndex + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
    if (currentSlideIndex > 0) showSlide(currentSlideIndex - 1);
  }
});

// Mouse Wheel navigation (debounced)
let lastWheelTime = 0;
document.addEventListener('wheel', (e) => {
  const currentTime = new Date().getTime();
  if (currentTime - lastWheelTime < 1000) return; // 1s debounce

  // Ignore wheel scroll if user is scrolling inside a glass panel
  const activePanel = slides[currentSlideIndex].querySelector('.glass-panel');
  if (activePanel) {
    const isScrollable = activePanel.scrollHeight > activePanel.clientHeight;
    const isScrollingDown = e.deltaY > 0;
    const isAtBottom = activePanel.scrollHeight - activePanel.scrollTop === activePanel.clientHeight;
    const isAtTop = activePanel.scrollTop === 0;

    if (isScrollable) {
      if (isScrollingDown && !isAtBottom) return; // let them scroll down inside
      if (!isScrollingDown && !isAtTop) return;    // let them scroll up inside
    }
  }

  if (e.deltaY > 30) {
    if (currentSlideIndex < slides.length - 1) {
      showSlide(currentSlideIndex + 1);
      lastWheelTime = currentTime;
    }
  } else if (e.deltaY < -30) {
    if (currentSlideIndex > 0) {
      showSlide(currentSlideIndex - 1);
      lastWheelTime = currentTime;
    }
  }
}, { passive: true });


// --- TIMELINE INTERACTIVITY (Card 3) ---
const timelineData = {
  "1948": {
    title: "Albert I",
    nation: "EE. UU.",
    text: "Primer mono rhesus enviado al espacio en un cohete V-2 capturado a Alemania. Lamentablemente, falleció de asfixia mecánica durante el vuelo.",
    vehicle: "Cohete V-2",
    status: "Misión Fallida (Pionera)"
  },
  "1949": {
    title: "Albert II",
    nation: "EE. UU.",
    text: "Primer primate en alcanzar el espacio exterior propiamente dicho (superando la línea de Kármán a 134 km). Falleció debido a un fallo en el paracaídas de la cápsula durante el impacto de reentrada.",
    vehicle: "Cohete V-2",
    status: "Fallecimiento en Reentrada"
  },
  "1950": {
    title: "Primer Ratón Espacial",
    nation: "EE. UU.",
    text: "Un ratón común fue enviado a una altitud de 137 km en un cohete V-2. El paracaídas de retorno falló y se desintegró al impactar.",
    vehicle: "Cohete V-2",
    status: "Fallo de Retorno"
  },
  "1951": {
    title: "Yorick y Ratones",
    nation: "EE. UU.",
    text: "El mono Yorick (también llamado Albert VI) y 11 ratones alcanzaron una altitud menor pero sobrevivieron al impacto. Fue el primer vuelo donde se recuperó con vida a un primate tras el reingreso espacial.",
    vehicle: "Aerobee RTV-A-1",
    status: "Supervivencia Exitosa"
  },
  "1957": {
    title: "Laika",
    nation: "URSS",
    text: "Perrita callejera de Moscú. Se convirtió en el primer ser vivo en orbitar la Tierra a bordo del Sputnik II. Trágicamente, falleció a las pocas horas por hipertermia debido a un fallo técnico en el aislamiento térmico.",
    vehicle: "Sputnik II",
    status: "Órbita Completada (Trágico)"
  },
  "1960": {
    title: "Mushka y Pchyolka",
    nation: "URSS",
    text: "Pasaron un día en órbita a bordo del Sputnik 6. Al reentrar, la trayectoria errónea obligó a los soviéticos a activar una carga explosiva remota para autodestruir la nave y evitar que EE. UU. capturara sus datos científicos.",
    vehicle: "Sputnik 6",
    status: "Autodestrucción Política"
  },
  "1966": {
    title: "Ugolyok y Veterok",
    nation: "URSS",
    text: "Últimos perros del programa espacial soviético. Orbitaron la Tierra durante 22 días consecutivos en una misión biológica de largo aliento. Regresaron sanos y salvos, marcando el récord de permanencia de perros en órbita.",
    vehicle: "Kosmos 110",
    status: "Supervivencia y Récord"
  }
};

const timelineNodes = document.querySelectorAll('.timeline-node');
const timelineTitle = document.getElementById('timeline-title');
const timelineNation = document.getElementById('timeline-nation');
const timelineText = document.getElementById('timeline-text');
const timelineVehicle = document.getElementById('timeline-vehicle');
const timelineStatus = document.getElementById('timeline-status');

timelineNodes.forEach(node => {
  node.addEventListener('click', () => {
    timelineNodes.forEach(n => n.classList.remove('active'));
    node.classList.add('active');

    const year = node.getAttribute('data-year');
    const data = timelineData[year];

    timelineTitle.textContent = data.title;
    timelineNation.textContent = data.nation;
    timelineText.textContent = data.text;
    timelineVehicle.textContent = data.vehicle;
    timelineStatus.textContent = data.status;

    // Apply brief neon pulse animation
    const detailCard = document.getElementById('timeline-detail-card');
    detailCard.style.animation = 'none';
    detailCard.offsetHeight; // Trigger reflow
    detailCard.style.animation = 'fadeIn 0.5s ease';
  });
});


// --- SATELLITE HOTSPOTS (Card 4) ---
const hotspots = document.querySelectorAll('.capsule-hotspot');
const tooltipBox = document.getElementById('capsule-tooltip-box');

hotspots.forEach(hotspot => {
  hotspot.addEventListener('click', (e) => {
    e.stopPropagation();
    const tooltipText = hotspot.getAttribute('data-tooltip');
    tooltipBox.textContent = tooltipText;
    tooltipBox.classList.add('active');
    
    // Pulse hotspot effect
    hotspots.forEach(h => h.style.background = 'var(--cyan)');
    hotspot.style.background = 'var(--gold)';
  });
});

// Click anywhere else to hide/reset tooltip
document.addEventListener('click', () => {
  tooltipBox.textContent = "Haz click en los puntos para leer";
  tooltipBox.classList.remove('active');
  hotspots.forEach(h => h.style.background = 'var(--cyan)');
});


// --- MINIJUEGO: LAIKA'S SPACE RUN (Card 5) ---
const gameCanvas = document.getElementById('game-canvas');
const gameCtx = gameCanvas.getContext('2d');
const gameOverlay = document.getElementById('game-overlay');
const gameStartBtn = document.getElementById('game-start-btn');
const gameTitle = document.getElementById('game-title');
const gameOverlayScore = document.getElementById('game-overlay-score');
const gameScoreDisplay = document.getElementById('game-score');
const gameHighScoreDisplay = document.getElementById('game-highscore');

let gameRunning = false;
let gameInterval;
let gameScore = 0;
let gameHighscore = localStorage.getItem('laika_game_highscore') || 0;
gameHighScoreDisplay.textContent = gameHighscore;

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -8.5;
const FLOOR_Y = gameCanvas.height - 40;

// Game State variables
let laika = {
  x: 55,
  y: FLOOR_Y - 24,
  width: 24,
  height: 24,
  vy: 0,
  isJumping: false
};

let obstacles = [];
let starsCollectibles = [];
let gameFrame = 0;
let obstacleSpawnRate = 110;
let gameSpeed = 3.5;

function startGame() {
  gameRunning = true;
  gameScore = 0;
  gameFrame = 0;
  obstacleSpawnRate = 110;
  gameSpeed = 3.5;
  obstacles = [];
  starsCollectibles = [];
  
  laika.y = FLOOR_Y - 24;
  laika.vy = 0;
  laika.isJumping = false;
  
  gameOverlay.classList.add('hidden');
  gameScoreDisplay.textContent = gameScore;
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
}

function stopGame() {
  gameRunning = false;
  clearInterval(gameInterval);
  gameOverlay.classList.remove('hidden');
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  
  if (gameScore > gameHighscore) {
    gameHighscore = gameScore;
    localStorage.setItem('laika_game_highscore', gameHighscore);
    gameHighScoreDisplay.textContent = gameHighscore;
  }
  
  gameTitle.textContent = "FIN DEL VUELO";
  gameOverlayScore.textContent = `Puntuación: ${gameScore}`;
  gameStartBtn.textContent = "Volar de Nuevo";
  gameOverlay.classList.remove('hidden');
}

// User Controls
function handleJump() {
  if (!gameRunning) return;
  if (!laika.isJumping) {
    laika.vy = JUMP_FORCE;
    laika.isJumping = true;
  }
}

// Listeners for game input
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowUp') {
    if (currentSlideIndex === 4) {
      e.preventDefault();
      handleJump();
    }
  }
});

gameCanvas.addEventListener('click', () => {
  handleJump();
});

gameStartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  startGame();
});

// Update Game Loop
function updateGame() {
  gameFrame++;
  
  // Clear Canvas
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  // Draw Background Elements (Space Ground & Star trail)
  drawGameBackground();
  
  // Physics for Laika
  laika.vy += GRAVITY;
  laika.y += laika.vy;
  
  if (laika.y >= FLOOR_Y - laika.height) {
    laika.y = FLOOR_Y - laika.height;
    laika.vy = 0;
    laika.isJumping = false;
  }
  
  // Draw Laika (using simple text emoji or clean graphics)
  gameCtx.font = "26px Arial";
  gameCtx.fillText("🐕", laika.x, laika.y + 20);
  
  // Spawn obstacles
  if (gameFrame % obstacleSpawnRate === 0) {
    spawnObstacle();
    // Dynamically increase speed & difficulty
    if (gameSpeed < 7.5) {
      gameSpeed += 0.15;
      obstacleSpawnRate = Math.max(65, obstacleSpawnRate - 4);
    }
  }
  
  // Move and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;
    
    // Draw obstacle
    gameCtx.font = "24px Arial";
    gameCtx.fillText(obs.emoji, obs.x, obs.y + 20);
    
    // Collision detection
    if (detectCollision(laika, obs)) {
      gameOver();
      return;
    }
    
    // Scoring check
    if (obs.x < laika.x && !obs.scored) {
      obs.scored = true;
      gameScore += 10;
      gameScoreDisplay.textContent = gameScore;
    }
    
    // Remove if off-screen
    if (obs.x < -30) {
      obstacles.splice(i, 1);
    }
  }
}

function spawnObstacle() {
  const obstacleEmojis = ["🛰️", "☄️", "⚙️", "🚀"];
  const randomEmoji = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)];
  
  // Random height (ground obstacles or mid-air obstacles)
  const onGround = Math.random() > 0.4;
  const obstacleY = onGround ? FLOOR_Y - 24 : FLOOR_Y - 70;
  
  obstacles.push({
    x: gameCanvas.width + 20,
    y: obstacleY,
    width: 20,
    height: 20,
    emoji: randomEmoji,
    scored: false
  });
}

function detectCollision(rect1, rect2) {
  // Simple circle-like bounding collision for better gameplay feeling
  const dx = (rect1.x + rect1.width/2) - (rect2.x + rect2.width/2);
  const dy = (rect1.y + rect1.height/2) - (rect2.y + rect2.height/2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 22; // collision radius
}

function drawGameBackground() {
  // Floor line
  gameCtx.beginPath();
  gameCtx.moveTo(0, FLOOR_Y);
  gameCtx.lineTo(gameCanvas.width, FLOOR_Y);
  gameCtx.strokeStyle = "rgba(157, 78, 221, 0.4)";
  gameCtx.lineWidth = 3;
  gameCtx.stroke();
  
  // Simple stars in background moving left
  gameCtx.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let i = 0; i < 6; i++) {
    let starX = (gameFrame * 0.8 + (i * 120)) % gameCanvas.width;
    gameCtx.fillRect(gameCanvas.width - starX, 30 + (i * 20) % 80, 2, 2);
  }
}


// --- ETHICS SLIDER INTERACTIVITY (Card 6) ---
const ethicsSlider = document.getElementById('ethics-slider');
const reflectionText = document.getElementById('ethics-reflection-text');
const reflectionCard = document.getElementById('ethics-reflection-card');

const ethicsPerspectives = [
  {
    range: [0, 25],
    text: "🌱 <strong>Ética Absoluta y Bienestar:</strong> Esta postura condena enérgicamente cualquier uso de animales para experimentos científicos. Sostiene que las vidas animales tienen un valor intrínseco y que causar dolor o muerte deliberada en aras del avance humano es un dilema moral inaceptable que debemos erradicar por completo.",
    color: "rgba(46, 213, 115, 0.1)",
    borderColor: "rgba(46, 213, 115, 0.4)"
  },
  {
    range: [26, 50],
    text: "🔍 <strong>Transición hacia Alternativas:</strong> Una visión equilibrada que valora la historia pero exige el cese actual. Acepta que los vuelos con animales aportaron datos médicos en 1950, pero sostiene que hoy es injustificable continuar utilizándolos gracias a los modelos computacionales e Inteligencia Artificial.",
    color: "rgba(0, 242, 254, 0.1)",
    borderColor: "rgba(0, 242, 254, 0.4)"
  },
  {
    range: [51, 75],
    text: "⚖️ <strong>Regulación y Bienestar Minimizado:</strong> Enfoque pragmático (el principio de las 3R: Reemplazar, Reducir, Refinar). Argumenta que la experimentación médica con animales sigue siendo temporalmente necesaria para asegurar la salud de vacunas y vuelos espaciales tripulados, pero exige leyes estrictas para eliminar el dolor.",
    color: "rgba(157, 78, 221, 0.1)",
    borderColor: "rgba(157, 78, 221, 0.4)"
  },
  {
    range: [76, 100],
    text: "🚀 <strong>Prioridad de Progreso Humano:</strong> Considera que los fines científicos colectivos justifican los medios biológicos. Desde este punto de vista, el sacrificio de animales como Laika fue una trágica necesidad sin la cual hubiera sido imposible asegurar la vida de seres humanos en órbita o avanzar en la cura de enfermedades graves.",
    color: "rgba(255, 215, 0, 0.1)",
    borderColor: "rgba(255, 215, 0, 0.4)"
  }
];

function updateEthicsText(value) {
  const perspective = ethicsPerspectives.find(p => value >= p.range[0] && value <= p.range[1]);
  if (perspective) {
    reflectionText.innerHTML = perspective.text;
    reflectionCard.style.backgroundColor = perspective.color;
    reflectionCard.style.borderColor = perspective.borderColor;
  }
}

ethicsSlider.addEventListener('input', (e) => {
  updateEthicsText(parseInt(e.target.value));
});

// Initialize with default slider value
updateEthicsText(50);


// --- QUIZ INTERACTIVE LOGIC (Card 7) ---
const quizQuestions = [
  {
    q: "¿Cuál fue la causa real del deceso de Laika en órbita?",
    options: [
      "Falta de oxígeno tras una semana de viaje.",
      "Sobrecalentamiento/Hipertermia en la cuarta órbita por fallo técnico.",
      "Eutanasia pacífica programada por los científicos.",
      "Asfixia debido al impacto de basura espacial."
    ],
    correct: 1,
    exp: "Laika falleció pocas horas después del lanzamiento por hipertermia (más de 40 °C en la cabina) debido al fallo en el control de temperatura de la Sputnik II."
  },
  {
    q: "¿Por qué los científicos soviéticos seleccionaron perros callejeros hembras?",
    options: [
      "Eran más inteligentes y fáciles de entrenar frente a machos.",
      "Por su pelaje grueso que las protegía del frío absoluto del espacio.",
      "Eran más tolerantes al encierro y facilitaban el diseño del traje espacial de residuos.",
      "Estaban disponibles en mayor número en las calles de Moscú."
    ],
    correct: 2,
    exp: "Los perros callejeros toleraban mejor el confinamiento y las hembras permitían un arnés recolector de desechos mucho más simple."
  },
  {
    q: "¿Qué trágico destino sufrieron Mushka y Pchyolka en el vuelo de 1960?",
    options: [
      "Fueron desintegradas por la radiación solar extrema.",
      "Su cápsula fue autodestruida por control remoto para evitar que cayera en manos de EE. UU.",
      "Fallecieron por falta de alimento en un viaje de dos semanas.",
      "Lograron aterrizar pero se extraviaron en los bosques de Siberia."
    ],
    correct: 1,
    exp: "Al desviarse de su ruta de retorno, la URSS activó una carga explosiva remota para proteger la confidencialidad de los datos científicos ante su rival de la Guerra Fría."
  },
  {
    q: "¿Qué institución estadounidense se fundó en 1958 como respuesta directa al éxito del Sputnik?",
    options: [
      "La NASA.",
      "El Pentágono.",
      "La Fuerza Espacial de EE. UU.",
      "La CIA."
    ],
    correct: 0,
    exp: "El pánico y la sorpresa por el dominio tecnológico soviético llevaron al presidente Eisenhower a crear la NASA en julio de 1958."
  },
  {
    q: "¿Qué porcentaje de los perros de prueba soviéticos sobrevivió entre 1951 y 1952?",
    options: [
      "El 100% de los perros.",
      "Alrededor del 55% (5 de 9 perros).",
      "Ninguno sobrevivió debido a fallos de cohetes.",
      "Aproximadamente el 20% (1 de 5 perros)."
    ],
    correct: 1,
    exp: "Durante las pruebas iniciales de vuelos suborbitales con perros entre 1951 y 1952, sobrevivieron 5 de los 9 perros testeados."
  }
];

let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnswered = false;

const quizWrapper = document.getElementById('quiz-wrapper');
const quizResultsScreen = document.getElementById('quiz-results-screen');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizCurrentScore = document.getElementById('quiz-current-score');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsBox = document.getElementById('quiz-options-box');
const quizExplanationBox = document.getElementById('quiz-explanation-box');
const quizNextBtn = document.getElementById('quiz-next-btn');
const quizSkipBtn = document.getElementById('quiz-skip-btn');
const quizNavFooter = document.getElementById('quiz-nav-footer');

const quizRestartBtn = document.getElementById('quiz-restart-btn');
const badgeIcon = document.getElementById('badge-icon');
const badgeRankTitle = document.getElementById('badge-rank-title');
const badgeRankDesc = document.getElementById('badge-rank-desc');
const quizCorrectCount = document.getElementById('quiz-correct-count');

function loadQuestion() {
  quizAnswered = false;
  quizExplanationBox.style.display = 'none';
  quizNextBtn.style.display = 'none';
  
  const currentQ = quizQuestions[quizCurrentIndex];
  quizProgressText.textContent = `Pregunta ${quizCurrentIndex + 1} de ${quizQuestions.length}`;
  quizQuestionText.textContent = currentQ.q;
  
  quizOptionsBox.innerHTML = '';
  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(idx));
    quizOptionsBox.appendChild(btn);
  });
}

function selectAnswer(selectedIdx) {
  if (quizAnswered) return;
  quizAnswered = true;
  
  const currentQ = quizQuestions[quizCurrentIndex];
  const optionButtons = quizOptionsBox.querySelectorAll('.quiz-option-btn');
  
  if (selectedIdx === currentQ.correct) {
    optionButtons[selectedIdx].classList.add('correct');
    quizScore++;
    quizCurrentScore.textContent = quizScore;
  } else {
    optionButtons[selectedIdx].classList.add('incorrect');
    optionButtons[currentQ.correct].classList.add('correct');
  }
  
  // Disable all options
  optionButtons.forEach(btn => btn.disabled = true);
  
  // Show explanation
  quizExplanationBox.textContent = currentQ.exp;
  quizExplanationBox.style.display = 'block';
  
  // Show next button
  quizNextBtn.style.display = 'inline-flex';
}

function handleNextQuestion() {
  quizCurrentIndex++;
  if (quizCurrentIndex < quizQuestions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizWrapper.style.display = 'none';
  quizNavFooter.style.display = 'none';
  quizResultsScreen.style.display = 'flex';
  
  quizCorrectCount.textContent = quizScore;
  
  // Ranks based on scores
  if (quizScore <= 1) {
    badgeIcon.textContent = "🛰️";
    badgeRankTitle.textContent = "Recluta Espacial";
    badgeRankDesc.textContent = "Has comenzado tu viaje por la historia de la carrera espacial. Relee los paneles informativos sobre el Sputnik II y la cronología para consolidar tus datos.";
  } else if (quizScore <= 3) {
    badgeIcon.textContent = "🚀";
    badgeRankTitle.textContent = "Piloto Orbital";
    badgeRankDesc.textContent = "¡Buen trabajo! Tienes un conocimiento sólido sobre el viaje de Laika y el contexto ideológico de la época. ¡Sigue investigando!";
  } else {
    badgeIcon.textContent = "👑";
    badgeRankTitle.textContent = "Comandante Científico";
    badgeRankDesc.textContent = "¡Sobresaliente! Eres un experto en historia espacial. Comprendes perfectamente las causas físicas de la misión Sputnik y el complejo dilema ético que rodea el sacrificio animal.";
  }
}

function resetQuiz() {
  quizCurrentIndex = 0;
  quizScore = 0;
  quizCurrentScore.textContent = 0;
  quizWrapper.style.display = 'flex';
  quizNavFooter.style.display = 'flex';
  quizResultsScreen.style.display = 'none';
  loadQuestion();
}

quizNextBtn.addEventListener('click', handleNextQuestion);
quizRestartBtn.addEventListener('click', resetQuiz);

// Initialize Quiz
loadQuestion();
