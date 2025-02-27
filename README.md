# AI Space Defense

A cyberpunk-themed space shooter that explores the ethical implications of AI through gameplay mechanics and narrative choices.

## 🎮 Game Features

### Core Gameplay
- Classic space shooter mechanics with modern AI-themed twists
- Smooth controls using arrow keys or WASD
- Dynamic difficulty scaling
- Combo system with multiplier effects
- Real-time score tracking

### AI-Themed Elements
- Ethical choice system: Choose between destroying or capturing AI cores
- Dynamic narrative that responds to player choices
- Visual feedback for ethical decisions
- AI consciousness preservation mechanics

### Enemy Types
1. **Standard AI Ships**
   - Hexagonal design with pulsing core
   - AI circuit patterns
   - Moderate speed and predictable patterns

2. **Fast AI Ships**
   - Diamond-shaped with energy trails
   - Concentric ring patterns
   - Higher speed and erratic movement
   - Special visual effects

### Power-Up System
- Shield power-ups for temporary invulnerability
- Rapid-fire upgrades
- Visual indicators for active power-ups
- Power-up duration tracking

### Visual Effects
- Dynamic starfield background
- Particle-based explosions
- Ethical capture effects
- Shield visualizations
- AI circuit patterns
- Trail effects for fast enemies

### Story Elements
- Progressive narrative reveals
- Dialogue system with choice mechanics
- Three distinct story phases:
  1. Initial AI detection
  2. Guardian backstory
  3. Ethical decision point

### Scoring System
- Base score for destroying/capturing ships
- Combo multiplier system
- Ethics-based score modifications
- Captured cores tracking

### Online Features
- Global leaderboard system
- Email-based score submission
- Privacy-conscious display (partial email masking)
- Top 10 rankings

### UI/UX Features
- Cyberpunk-themed interface
- Real-time HUD with:
  - Score display
  - AI multiplier
  - Combo tracker
  - Ethics indicator
  - Captured cores counter
- Dynamic menu transitions
- Interactive buttons and input fields

## 🛠️ Technical Setup

### Prerequisites
- Modern web browser
- Internet connection for leaderboard features

### Installation
1. Clone the repository
2. Set up Supabase:
   ```sql
   create table leaderboard (
     id uuid default uuid_generate_v4() primary key,
     email text not null,
     score integer not null,
     ethics_score integer not null,
     cores_captured integer not null,
     max_combo numeric not null,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```
3. Update `config.js` with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

### Dependencies
- p5.js for game rendering
- Supabase for backend services
- Modern browser with ES6+ support

## 🎯 Gameplay Tips

### Controls
- Arrow Keys / WASD: Move ship
- Spacebar: Shoot
- Mouse: Interface interaction

### Strategy Guide
1. Build combos for higher scores
2. Choose ethical decisions carefully
3. Watch for power-up opportunities
4. Maintain shield status
5. Track combo timer for optimal scoring

### Ethical Choices
- Capturing AI cores:
  - Higher potential score
  - Contributes to positive ethics rating
  - Special visual effects
- Destroying AI ships:
  - Quick elimination
  - Affects story outcome
  - Different visual feedback

## 🏆 Scoring System

### Point Structure
- Base hit: 100 points
- Combo multiplier: Up to 5x
- Ethics bonus: Variable based on choices
- Captured cores: Additional points

### Leaderboard Features
- Global rankings
- Personal best tracking
- Ethics score display
- Cores captured counter
- Max combo achieved

## 🔧 Development

### Built With
- p5.js for game engine
- Supabase for backend
- Custom particle system
- Ethical choice framework

### Future Enhancements
- Additional enemy types
- More power-up varieties
- Extended narrative branches
- Achievement system
- Social sharing features

## 📝 License
This project is open source and available under the MIT License.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 🚀 Play Online

You can play the game online at: `[Your GitHub Pages URL will be here]`

## 📦 Deployment

This game is deployed using GitHub Pages. To deploy your own instance:

1. Fork this repository
2. Go to your fork's Settings > Pages
3. Under "Source", select "main" branch
4. Select "/ (root)" as the folder
5. Click Save
6. Wait a few minutes for GitHub to build and deploy your site
7. Your game will be available at `https://[your-username].github.io/[repository-name]`

### Local Development

To run the game locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/[your-username]/[repository-name].git
   ```

2. Navigate to the project directory:
   ```bash
   cd [repository-name]
   ```

3. Serve the files using a local server. You can use Python's built-in server:
   ```bash
   # Python 3
   python -m http.server 8000
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   Or use any other local server of your choice.

4. Open your browser and visit: `http://localhost:8000` 