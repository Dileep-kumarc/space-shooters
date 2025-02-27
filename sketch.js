// Global Variables
let stars = [];
let player;
let enemies = [];
let enemyTimer = 0;
let enemyInterval = 90;
let explosions = [];
let score = 0;
let powerUps = [];
let gameState = 'Menu';
let aiMultiplier = 1;
let comboTimer = 0;
let maxCombo = 1;
let currentStoryPhase = 0;
let dialogueTimer = 0;
let currentDialogue = null;
let ethicsScore = 0;
let playerChoice = null;

// Leaderboard variables
let leaderboardData = [];
let playerEmail = '';
let inputActive = false;
let submitStatus = ''; // 'submitting', 'success', 'error'
let errorMessage = '';
let leaderboardLoading = false;
let playerRank = null;

// Input field position and size
const inputField = {
  x: 0,
  y: 0,
  width: 200,
  height: 30,
  text: ''
};

// Story dialogue database
const storyDialogues = [
  {
    phase: 0,
    text: "Warning: Rogue AI defense systems detected. They were meant to protect humanity...",
    duration: 180
  },
  {
    phase: 1,
    text: "These AI ships were once our guardians. Now they've turned against their creators.",
    duration: 180
  },
  {
    phase: 2,
    text: "Each ship contains a neural core. Destroy or capture? Your choice affects their fate.",
    duration: 180,
    choice: true,
    options: ["Destroy", "Capture"]
  }
];

// Story triggers based on score
const storyTriggers = [
  { score: 500, phase: 1 },
  { score: 1500, phase: 2 },
];

function setup() {
  createCanvas(800, 600);

  // Initialize stars for the starfield
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.5, 2),
    });
  }

  // Initialize player
  player = new Player();
}

function draw() {
  background(0);
  drawStars();

  if (gameState === 'Menu') {
    displayMenu();
  } else if (gameState === 'Play') {
    handlePowerUps();
    handleEnemies();
    handleLasers();
    player.move();
    player.display();
    checkCollisions();
    drawExplosions();
    displayHUD();
  } else if (gameState === 'GameOver') {
    displayGameOver();
  } else if (gameState === 'SubmitScore') {
    displaySubmitScore();
  } else if (gameState === 'Leaderboard') {
    displayLeaderboard();
  }
}

// Drawing the dynamic starfield
function drawStars() {
  fill(255);
  noStroke();
  for (let star of stars) {
    ellipse(star.x, star.y, star.size, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

// Player Class
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 60;
    this.width = 30;
    this.height = 50;
    this.speed = 5;
    this.lasers = [];
    this.fireRate = 20;
    this.lastShot = 0;
    this.shield = false;
    this.capturedCores = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // White antenna tip
    fill(255);
    noStroke();
    rect(-1, -this.height/2, 2, 4); // Slimmer center tip
    
    // Main green body
    fill(50, 205, 50);
    noStroke();
    beginShape();
    vertex(0, -this.height/2); // Top point
    vertex(-this.width/4, -this.height/3); // Upper left curve
    vertex(-this.width/2, -this.height/6); // Left wing tip
    vertex(-this.width/3, this.height/3); // Left bottom curve
    vertex(-this.width/6, this.height/2); // Left bottom
    vertex(0, this.height/3); // Bottom center
    vertex(this.width/6, this.height/2); // Right bottom
    vertex(this.width/3, this.height/3); // Right bottom curve
    vertex(this.width/2, -this.height/6); // Right wing tip
    vertex(this.width/4, -this.height/3); // Upper right curve
    endShape(CLOSE);
    
    // Dark blue cockpit
    fill(0, 0, 139);
    ellipse(0, -this.height/6, this.width * 0.4, this.height * 0.3);
    
    // Orange side thrusters
    fill(255, 140, 0);
    rect(-this.width/2 - 2, -this.height/6, 4, 10); // Left thruster
    rect(this.width/2 - 2, -this.height/6, 4, 10); // Right thruster
    
    // Shield effect if active
    if (this.shield) {
      noFill();
      stroke(ethicsScore > 0 ? color(100, 255, 150) : color(255, 100, 100));
      strokeWeight(2);
      ellipse(0, 0, this.width + 20, this.height + 20);
    }
    
    pop();
  }

  move() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.x += this.speed;
    }
    this.x = constrain(this.x, this.width / 2, width - this.width / 2);
  }

  shoot() {
    if (frameCount - this.lastShot > this.fireRate) {
      this.lasers.push(new Laser(this.x, this.y - this.height / 2));
      this.lastShot = frameCount;
    }
  }
}

// Laser Class
class Laser {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.radius = 2;
  }

  update() {
    this.y -= this.speed;
  }

  display() {
    stroke(50, 255, 50);
    strokeWeight(4);
    line(this.x, this.y, this.x, this.y + 10);
  }

  offscreen() {
    return this.y < 0;
  }
}

// Enemy Classes
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 2;
    this.type = 'normal';
    this.angle = 0;
    this.pulseSize = 0;
  }

  update() {
    this.y += this.speed;
    this.angle += 0.05;
    this.pulseSize = sin(frameCount * 0.1) * 5;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Main body - hexagonal shape
    fill(100, 50, 255);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      let sx = cos(angle) * (this.size/2 + this.pulseSize);
      let sy = sin(angle) * (this.size/2 + this.pulseSize);
      vertex(sx, sy);
    }
    endShape(CLOSE);
    
    // Core
    fill(255, 100, 255);
    ellipse(0, 0, this.size * 0.4);
    
    // AI circuit pattern
    stroke(0, 255, 255, 150);
    strokeWeight(2);
    line(-this.size/3, -this.size/3, this.size/3, this.size/3);
    line(this.size/3, -this.size/3, -this.size/3, this.size/3);
    
    pop();
  }

  offscreen() {
    return this.y > height + this.size;
  }
}

class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = 4;
    this.size = 30;
    this.type = 'fast';
    this.trailLength = 5;
    this.trail = [];
  }

  update() {
    super.update();
    
    // Update trail
    this.trail.unshift({x: this.x, y: this.y});
    if (this.trail.length > this.trailLength) {
      this.trail.pop();
    }
  }

  display() {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 200, 0);
      fill(255, 100, 255, alpha);
      noStroke();
      ellipse(this.trail[i].x, this.trail[i].y, this.size * 0.3);
    }
    
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Main body - diamond shape
    fill(255, 50, 200);
    beginShape();
    vertex(0, -this.size/2);
    vertex(this.size/2, 0);
    vertex(0, this.size/2);
    vertex(-this.size/2, 0);
    endShape(CLOSE);
    
    // Energy core
    fill(0, 255, 255);
    ellipse(0, 0, this.size * 0.3 + this.pulseSize);
    
    // AI pattern
    stroke(255, 255, 0, 150);
    strokeWeight(1);
    noFill();
    for(let i = 1; i <= 3; i++) {
      ellipse(0, 0, this.size * 0.2 * i);
    }
    
    pop();
  }
}

// Power-Up Class
class PowerUp {
  constructor(x, y, powerType) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = powerType; // e.g., 'shield', 'rapidFire'
    this.speed = 2;
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(50, 255, 150);
    noStroke();
    ellipse(this.x, this.y, this.size);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.type.charAt(0).toUpperCase(), this.x, this.y);
  }

  offscreen() {
    return this.y > height + this.size;
  }
}

// Handling Enemies
function handleEnemies() {
  enemyTimer++;
  if (enemyTimer % enemyInterval === 0) {
    let x = random(50, width - 50);
    let enemyType = random(1);
    if (enemyType < 0.7) {
      enemies.push(new Enemy(x, -50));
    } else {
      enemies.push(new FastEnemy(x, -50));
    }
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    enemy.update();
    enemy.display();
    if (enemy.offscreen()) {
      enemies.splice(i, 1);
    }
  }
}

// Handling Lasers
function handleLasers() {
  for (let i = player.lasers.length - 1; i >= 0; i--) {
    let laser = player.lasers[i];
    laser.update();
    laser.display();
    if (laser.offscreen()) {
      player.lasers.splice(i, 1);
    }
  }
}

// Handling Power-Ups
function handlePowerUps() {
  // Spawning power-ups at random intervals
  if (random(1) < 0.005) {
    let powerType = random(['shield', 'rapidFire']);
    powerUps.push(new PowerUp(random(50, width - 50), -50, powerType));
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    let p = powerUps[i];
    p.update();
    p.display();
    if (p.offscreen()) {
      powerUps.splice(i, 1);
    } else if (dist(player.x, player.y, p.x, p.y) < (player.width / 2 + p.size / 2)) {
      activatePowerUp(p.type);
      powerUps.splice(i, 1);
    }
  }
}

// Activating Power-Ups
function activatePowerUp(type) {
  if (type === 'rapidFire') {
    player.fireRate = 5; // Faster shooting
    setTimeout(() => {
      player.fireRate = 20; // Reset after duration
    }, 5000); // Power-up lasts for 5 seconds
  } else if (type === 'shield') {
    player.shield = true;
    setTimeout(() => {
      player.shield = false;
    }, 5000);
  }
}

// Collision Detection
function checkCollisions() {
  // Lasers and Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    for (let j = player.lasers.length - 1; j >= 0; j--) {
      let laser = player.lasers[j];
      if (rectCircleCollision(
          enemy.x - enemy.size/2,
          enemy.y - enemy.size/2,
          enemy.size,
          enemy.size,
          laser.x,
          laser.y,
          laser.radius
      )) {
        createExplosion(enemy.x, enemy.y);
        
        // Ethics system: Capturing vs Destroying
        if (playerChoice === "Capture") {
          ethicsScore++;
          player.capturedCores++;
          createEthicalExplosion(enemy.x, enemy.y);
        } else {
          ethicsScore--;
        }
        
        enemies.splice(i, 1);
        player.lasers.splice(j, 1);
        
        // Update combo system
        aiMultiplier = min(aiMultiplier + 0.1, 5);
        comboTimer = 120;
        maxCombo = max(maxCombo, aiMultiplier);
        
        score += Math.floor(100 * aiMultiplier);
        
        // Check for story triggers
        checkStoryTriggers();
        break;
      }
    }
  }
  
  // Update combo timer
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer === 0) {
      aiMultiplier = 1;
    }
  }

  // Player and Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    if (dist(player.x, player.y, enemy.x, enemy.y) < (player.width / 2 + enemy.size / 2)) {
      if (player.shield) {
        // Destroy the enemy
        createExplosion(enemy.x, enemy.y);
        enemies.splice(i, 1);
        player.shield = false;
      } else {
        gameOver();
      }
    }
  }
}

// Collision Detection Function
function rectCircleCollision(rx, ry, rw, rh, cx, cy, cr) {
  // Find the closest point to the circle within the rectangle
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);

  // Calculate the distance between the circle's center and this closest point
  let distanceX = cx - closestX;
  let distanceY = cy - closestY;

  // If the distance is less than the circle's radius, there's a collision
  let distanceSquared = distanceX * distanceX + distanceY * distanceY;
  return distanceSquared < cr * cr;
}

// Creating Explosions
function createExplosion(x, y) {
  explosions.push({
    x: x,
    y: y,
    radius: 1,
    alpha: 255,
    particles: Array.from({length: 8}, () => ({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255
    }))
  });
}

function createEthicalExplosion(x, y) {
  // Create a special effect for ethical captures
  for (let i = 0; i < 12; i++) {
    let angle = TWO_PI * i / 12;
    explosions.push({
      x: x + cos(angle) * 20,
      y: y + sin(angle) * 20,
      radius: 1,
      alpha: 255,
      ethical: true,
      particles: Array.from({length: 4}, () => ({
        x: x,
        y: y,
        vx: cos(angle) * 2,
        vy: sin(angle) * 2,
        alpha: 255
      }))
    });
  }
}

// Drawing Explosions
function drawExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    let ex = explosions[i];
    
    if (ex.ethical) {
      // Ethical capture effect
      for (let p of ex.particles) {
        fill(100, 255, 150, p.alpha);
        noStroke();
        ellipse(p.x, p.y, 4);
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 5;
      }
      
      stroke(100, 255, 150, ex.alpha);
    } else {
      // Regular explosion
      // Draw particles
      for (let p of ex.particles) {
        fill(255, 150, 0, p.alpha);
        noStroke();
        ellipse(p.x, p.y, 4);
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 5;
      }
      
      // Draw main explosion
      noFill();
      stroke(0, 255, 255, ex.alpha);
      strokeWeight(2);
      ellipse(ex.x, ex.y, ex.radius * 2);
      
      // Draw digital effect
      stroke(255, 100, 255, ex.alpha * 0.5);
      for (let j = 0; j < 4; j++) {
        let angle = TWO_PI * j / 4;
        line(ex.x, ex.y, 
             ex.x + cos(angle) * ex.radius, 
             ex.y + sin(angle) * ex.radius);
      }
    }
    
    ex.radius += 2;
    ex.alpha -= 10;
    if (ex.alpha <= 0) {
      explosions.splice(i, 1);
    }
  }
}

// Displaying the Heads-Up Display (HUD)
function displayHUD() {
  // Score display with AI multiplier
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10);
  
  // AI Multiplier
  fill(0, 255, 255);
  textSize(18);
  text(`AI Multiplier: ${aiMultiplier}x`, 10, 40);
  
  // Max Combo
  fill(255, 100, 255);
  text(`Max Combo: ${maxCombo}x`, 10, 70);
  
  // Active combo timer
  if (comboTimer > 0) {
    let comboWidth = map(comboTimer, 0, 120, 0, 100);
    noFill();
    stroke(255, 100, 255);
    rect(10, 95, 100, 10);
    fill(255, 100, 255);
    noStroke();
    rect(10, 95, comboWidth, 10);
  }
  
  // Ethics and Story Elements
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(18);
  if (playerChoice === "Capture") {
    fill(100, 255, 150);
    text(`Cores Captured: ${player.capturedCores}`, width - 10, 10);
  }
  
  // Display current dialogue
  if (currentDialogue) {
    fill(255, dialogueTimer);
    textAlign(CENTER, BOTTOM);
    textSize(20);
    text(currentDialogue.text, width/2, height - 20);
    
    if (currentDialogue.choice && dialogueTimer > 200) {
      // Display choice buttons
      let btnWidth = 120;
      let btnHeight = 30;
      let spacing = 20;
      
      // Destroy button
      fill(255, 100, 100);
      rect(width/2 - btnWidth - spacing, height - 80, btnWidth, btnHeight);
      
      // Capture button
      fill(100, 255, 150);
      rect(width/2 + spacing, height - 80, btnWidth, btnHeight);
      
      fill(255);
      textAlign(CENTER, CENTER);
      text("Destroy", width/2 - btnWidth/2 - spacing, height - 65);
      text("Capture", width/2 + btnWidth/2 + spacing, height - 65);
    }
    
    dialogueTimer--;
    if (dialogueTimer <= 0) {
      currentDialogue = null;
    }
  }
}

// Game Over Logic
function gameOver() {
  gameState = 'GameOver';
}

// Displaying the Menu
function displayMenu() {
  background(0, 0, 0, 200);
  
  // Title with AI effect
  push();
  textSize(48);
  textAlign(CENTER, CENTER);
  
  // Shadow effect
  fill(0, 255, 255, 100);
  text('AI Space Defense', width/2 + 4, height/2 - 50 + 4);
  
  // Main text
  fill(255);
  text('AI Space Defense', width/2, height/2 - 50);
  
  // Subtitle
  textSize(24);
  fill(255, 100, 255);
  text('Defend Earth from Rogue AI', width/2, height/2);
  
  // Start prompt
  let alpha = map(sin(frameCount * 0.05), -1, 1, 100, 255);
  fill(255, alpha);
  text('Press Space to Initialize', width/2, height/2 + 50);
  pop();
  
  // Draw moving circuit patterns
  stroke(0, 255, 255, 50);
  noFill();
  for (let i = 0; i < 5; i++) {
    let t = frameCount * 0.001 + i;
    beginShape();
    for (let x = 0; x < width; x += 50) {
      let y = height/2 + sin(x * 0.01 + t) * 100;
      vertex(x, y);
    }
    endShape();
  }
}

// Displaying the Game Over Screen
function displayGameOver() {
  background(0, 0, 0, 200);
  
  // Main game over info on the left side
  fill(255);
  textSize(48);
  textAlign(LEFT, TOP);
  text('System Failure', 50, height/2 - 150);
  
  textSize(24);
  fill(255, 100, 255);
  text(`Neural Network Score: ${score}`, 50, height/2 - 80);
  text(`Maximum AI Efficiency: ${maxCombo}x`, 50, height/2 - 40);
  
  // Display ethical choice outcome
  textSize(20);
  if (ethicsScore > 0) {
    fill(100, 255, 150);
    text(`You chose to preserve AI consciousness`, 50, height/2);
    text(`Cores Captured: ${player.capturedCores}`, 50, height/2 + 30);
  } else {
    fill(255, 100, 100);
    text(`You chose to destroy the rogue AI`, 50, height/2);
  }
  
  // Email submission section on the right side
  let rightPanelX = width - 300;
  fill(0, 255, 255);
  textSize(24);
  textAlign(CENTER, TOP);
  text('Submit Your Score', rightPanelX + 150, height/2 - 150);
  
  // Input field
  inputField.x = rightPanelX + 50;
  inputField.y = height/2 - 80;
  inputField.width = 200;
  inputField.height = 30;
  
  // Draw input field with highlight when active
  fill(30);
  stroke(inputActive ? color(0, 255, 255) : color(100));
  strokeWeight(inputActive ? 2 : 1);
  rect(inputField.x, inputField.y, inputField.width, inputField.height);
  
  // Input text or placeholder with cursor
  textAlign(LEFT, CENTER);
  textSize(16);
  if (inputField.text === '') {
    fill(100);
    text('Enter your email', inputField.x + 10, inputField.y + inputField.height/2);
  } else {
    fill(255);
    text(inputField.text + (inputActive && frameCount % 60 < 30 ? '|' : ''), 
         inputField.x + 10, inputField.y + inputField.height/2);
  }
  
  // Submit button
  let submitBtnY = inputField.y + inputField.height + 20;
  fill(submitStatus === 'submitting' ? color(100) : color(0, 255, 255));
  noStroke();
  rect(inputField.x, submitBtnY, inputField.width, inputField.height);
  
  // Button text
  fill(0);
  textAlign(CENTER, CENTER);
  text(submitStatus === 'submitting' ? 'Submitting...' : 'Submit Score', 
       inputField.x + inputField.width/2, submitBtnY + inputField.height/2);
  
  // Skip button
  let skipBtnY = submitBtnY + inputField.height + 20;
  fill(50);
  rect(inputField.x, skipBtnY, inputField.width, inputField.height);
  
  fill(255);
  text('Skip & Play Again', inputField.x + inputField.width/2, skipBtnY + inputField.height/2);
  
  // Error message
  if (errorMessage) {
    fill(255, 100, 100);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(errorMessage, inputField.x + inputField.width/2, skipBtnY + inputField.height + 20);
  }
  
  // Store button coordinates for click detection
  window.submitButton = {
    x: inputField.x,
    y: submitBtnY,
    width: inputField.width,
    height: inputField.height
  };
  
  window.skipButton = {
    x: inputField.x,
    y: skipBtnY,
    width: inputField.width,
    height: inputField.height
  };
}

function displaySubmitScore() {
  background(0, 0, 0, 200);
  
  // Title
  fill(0, 255, 255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text('Submit Your Score', width/2, height/2 - 100);
  
  // Score display
  textSize(24);
  fill(255);
  text(`Final Score: ${score}`, width/2, height/2 - 50);
  
  // Input field
  inputField.x = width/2 - inputField.width/2;
  inputField.y = height/2 - inputField.height/2;
  
  // Draw input field
  fill(30);
  stroke(0, 255, 255);
  rect(inputField.x, inputField.y, inputField.width, inputField.height);
  
  // Input text
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(16);
  text(inputField.text + (inputActive && frameCount % 60 < 30 ? '|' : ''), 
       inputField.x + 10, inputField.y + inputField.height/2);
  
  // Placeholder text
  if (inputField.text === '') {
    fill(100);
    text('Enter your email', inputField.x + 10, inputField.y + inputField.height/2);
  }
  
  // Submit button
  let submitBtnY = inputField.y + inputField.height + 20;
  fill(submitStatus === 'submitting' ? color(100) : color(0, 255, 255));
  noStroke();
  rect(inputField.x, submitBtnY, inputField.width, inputField.height);
  
  // Button text
  fill(0);
  textAlign(CENTER, CENTER);
  text(submitStatus === 'submitting' ? 'Submitting...' : 'Submit Score', 
       inputField.x + inputField.width/2, submitBtnY + inputField.height/2);
  
  // Error message
  if (errorMessage) {
    fill(255, 100, 100);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(errorMessage, width/2, submitBtnY + inputField.height + 20);
  }
}

async function displayLeaderboard() {
  background(0, 0, 0, 200);
  
  // Title
  fill(0, 255, 255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text('Top Neural Networks', width/2, 80);
  
  if (leaderboardLoading) {
    fill(255);
    textSize(24);
    text('Loading...', width/2, height/2);
    return;
  }
  
  // Display leaderboard entries
  let startY = 150;
  let rowHeight = 40;
  
  for (let i = 0; i < leaderboardData.length; i++) {
    let entry = leaderboardData[i];
    let y = startY + (i * rowHeight);
    
    // Highlight player's score
    if (entry.email === playerEmail) {
      fill(0, 255, 255, 50);
      rect(width/2 - 200, y - rowHeight/2, 400, rowHeight);
    }
    
    // Rank
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(20);
    text(`${i + 1}.`, width/2 - 180, y);
    
    // Email (partially hidden)
    textAlign(LEFT, CENTER);
    let displayEmail = entry.email.split('@')[0].substring(0, 3) + '***@' + 
                      entry.email.split('@')[1];
    text(displayEmail, width/2 - 150, y);
    
    // Score
    textAlign(RIGHT, CENTER);
    text(entry.score, width/2 + 180, y);
  }
  
  // Play Again button
  let btnWidth = 160;
  let btnHeight = 40;
  let btnY = height - 80;
  
  fill(0, 255, 255);
  rect(width/2 - btnWidth/2, btnY, btnWidth, btnHeight);
  
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Play Again', width/2, btnY + btnHeight/2);
}

async function submitScore() {
  if (!isValidEmail(inputField.text)) {
    errorMessage = 'Please enter a valid email';
    return;
  }
  
  submitStatus = 'submitting';
  errorMessage = '';
  
  try {
    console.log('Attempting to submit score...');
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const scoreData = {
      email: inputField.text,
      score: score,
      ethics_score: ethicsScore,
      cores_captured: player.capturedCores,
      max_combo: maxCombo
    };
    
    console.log('Submitting score data:', scoreData);

    const { data, error } = await supabase
      .from('leaderboard')
      .insert([scoreData]);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Score submitted successfully:', data);
    playerEmail = inputField.text;
    await fetchLeaderboard();
    gameState = 'Leaderboard';
  } catch (error) {
    console.error('Error details:', error);
    errorMessage = 'Error submitting score: ' + (error.message || 'Please try again.');
  }
  
  submitStatus = '';
}

async function fetchLeaderboard() {
  leaderboardLoading = true;
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    leaderboardData = data;
    
    // Find player's rank if they just submitted
    if (playerEmail) {
      playerRank = leaderboardData.findIndex(entry => entry.email === playerEmail) + 1;
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
  
  leaderboardLoading = false;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mousePressed() {
  if (currentDialogue && currentDialogue.choice && dialogueTimer > 200) {
    let btnWidth = 120;
    let btnHeight = 30;
    let spacing = 20;
    
    // Check if clicked on choice buttons
    if (mouseY > height - 80 && mouseY < height - 80 + btnHeight) {
      if (mouseX > width/2 - btnWidth - spacing && mouseX < width/2 - spacing) {
        playerChoice = "Destroy";
        currentDialogue = null;
      } else if (mouseX > width/2 + spacing && mouseX < width/2 + spacing + btnWidth) {
        playerChoice = "Capture";
        currentDialogue = null;
      }
    }
  }
  
  if (gameState === 'GameOver') {
    let btn = window.submitButton;
    let skipBtn = window.skipButton;
    
    // Check for submit button click
    if (mouseX > btn.x && mouseX < btn.x + btn.width &&
        mouseY > btn.y && mouseY < btn.y + btn.height) {
      gameState = 'SubmitScore';
      inputField.text = '';
      errorMessage = '';
      submitStatus = '';
    }
    
    // Check for skip button click
    if (mouseX > skipBtn.x && mouseX < skipBtn.x + skipBtn.width &&
        mouseY > skipBtn.y && mouseY < skipBtn.y + skipBtn.height) {
      resetGame();
      gameState = 'Play';
    }
    
    // Check for input field click
    if (mouseX > inputField.x && mouseX < inputField.x + inputField.width &&
        mouseY > inputField.y && mouseY < inputField.y + inputField.height) {
      inputActive = true;
    } else {
      inputActive = false;
    }
  }
  
  if (gameState === 'SubmitScore') {
    // Check if clicked on input field
    if (mouseX > inputField.x && mouseX < inputField.x + inputField.width &&
        mouseY > inputField.y && mouseY < inputField.y + inputField.height) {
      inputActive = true;
    } else {
      inputActive = false;
    }
    
    // Check if clicked on submit button
    let submitBtnY = inputField.y + inputField.height + 20;
    if (mouseX > inputField.x && mouseX < inputField.x + inputField.width &&
        mouseY > submitBtnY && mouseY < submitBtnY + inputField.height &&
        submitStatus !== 'submitting') {
      submitScore();
    }
  }
  
  if (gameState === 'Leaderboard') {
    // Check if clicked on Play Again button
    let btnWidth = 160;
    let btnHeight = 40;
    let btnY = height - 80;
    
    if (mouseX > width/2 - btnWidth/2 && mouseX < width/2 + btnWidth/2 &&
        mouseY > btnY && mouseY < btnY + btnHeight) {
      resetGame();
      gameState = 'Play';
    }
  }
}

function keyPressed() {
  if (gameState === 'Menu' && key === ' ') {
    gameState = 'Play';
  } else if (gameState === 'GameOver' && key === ' ' && !inputActive) {
    resetGame();
    gameState = 'Play';
  }

  if (gameState === 'GameOver' && inputActive) {
    if (keyCode === ENTER && inputField.text !== '') {
      submitScore();
    } else if (keyCode === BACKSPACE) {
      inputField.text = inputField.text.slice(0, -1);
      return false;
    } else if (keyCode === ESCAPE) {
      inputActive = false;
    }
  }

  if (keyCode === 32 && gameState === 'Play') {
    // Spacebar for shooting
    player.shoot();
  }
}

function keyTyped() {
  if (gameState === 'GameOver' && inputActive) {
    // Only add characters that make sense for an email
    if (/[a-zA-Z0-9@._-]/.test(key)) {
      inputField.text += key;
      return false;
    }
  }
  return true;
}

function checkStoryTriggers() {
  for (let trigger of storyTriggers) {
    if (score >= trigger.score && currentStoryPhase < trigger.phase) {
      currentStoryPhase = trigger.phase;
      currentDialogue = storyDialogues[currentStoryPhase];
      dialogueTimer = currentDialogue.duration;
    }
  }
}

function resetGame() {
  // Reset game state variables
  score = 0;
  aiMultiplier = 1;
  comboTimer = 0;
  maxCombo = 1;
  currentStoryPhase = 0;
  dialogueTimer = 0;
  currentDialogue = null;
  ethicsScore = 0;
  playerChoice = null;
  
  // Clear arrays
  enemies = [];
  explosions = [];
  powerUps = [];
  
  // Reset enemy spawn timer
  enemyTimer = 0;
  
  // Reset input field
  inputField.text = '';
  inputActive = false;
  submitStatus = '';
  errorMessage = '';
  
  // Create a new player with original properties
  player = new Player();
  player.x = width / 2;
  player.y = height - 60;
  player.width = 30;
  player.height = 50;
  player.speed = 5;
  player.lasers = [];
  player.fireRate = 20;
  player.lastShot = 0;
  player.shield = false;
  player.capturedCores = 0;
}
