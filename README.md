https://youtu.be/DnlBlqIkm9M

# 🐦 Flappy Bird - Modern Web Game

A beautifully redesigned Flappy Bird game with pixelated UI elements and modern minimalist aesthetics, inspired by complex SaaS design patterns.

## 🎮 Features

- **Modern Minimalist Design**: Clean, professional UI with glassmorphism effects
- **Pixelated Game Buttons**: Retro-style buttons with smooth animations
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Sound System**: Background music and sound effects with mute toggle
- **🗄️ Database-Powered High Scores**: IndexedDB for persistent score storage
- **🏆 Interactive Leaderboard**: View top 10 high scores with player names and timestamps
- **📊 Game Statistics**: Track total games, average score, and player statistics
- **⚡ Advanced Score Management**: All scores saved, not just high scores
- **Pause Functionality**: ESC key or button to pause/resume
- **Particle Effects**: Explosion effects on collision
- **Smooth Animations**: Bird wing animation and floating effects

## 📁 Project Structure

```
flappy-bird/
├── index.html              # Main HTML file
├── README.md               # Project documentation
├── css/
│   └── style.css           # Stylesheets with leaderboard styles
├── js/
│   ├── database.js         # IndexedDB database manager
│   └── game.js             # Game logic and JavaScript
└── assets/
    ├── images/             # Game images
    │   ├── flappybird0.png
    │   ├── flappybird1.png
    │   ├── flappybird2.png
    │   ├── flappybird3.png
    │   ├── flappybirdbg.png
    │   ├── toppipe.png
    │   └── bottompipe.png
    └── sounds/             # Audio files
        ├── bgm_mario.mp3
        ├── sfx_wing.wav
        ├── sfx_hit.wav
        ├── sfx_die.wav
        ├── sfx_point.wav
        └── sfx_swooshing.wav
```


## 🎮 Game Controls

- **🖱️ Click** or press **SPACE** - Make the bird jump/flap wings
- **⏸️ ESC** - Pause or resume the game
- **🔊 Sound Button** - Toggle background music and sound effects on/off
- **🏠 Home Button** - Return to main menu (from pause/game over screens)
- **🔄 Play Again** - Restart the game (from game over screen)
- **🏆 Leaderboard Button** - View high scores and statistics

### Mobile Controls
- **Touch** anywhere on the game canvas to make the bird jump
- **Touch buttons** for navigation and menu interactions

## 🛠️ Technology Stack

### Frontend Technologies
- **HTML5** - Semantic markup with accessibility features (ARIA labels, roles)
- **CSS3** - Modern styling with CSS variables, glassmorphism effects, and responsive design
- **Vanilla JavaScript (ES6+)** - Pure JavaScript game logic without external frameworks
- **Canvas API** - HTML5 Canvas for game rendering and animations

### Styling & Design
- **CSS Variables** - Custom properties for consistent theming and easy customization
- **Flexbox & Grid** - Modern layout systems for responsive design
- **Google Fonts (Poppins)** - Professional typography for UI elements
- **Glassmorphism Design** - Modern UI with backdrop filters and transparency effects
- **CSS Animations** - Smooth transitions and micro-interactions

### Data Storage
- **IndexedDB** - Browser database for persistent high score storage
- **localStorage** - Fallback storage for settings and preferences
- **No Backend Required** - Completely client-side application

### Game Assets
#### Images
- **Bird Sprites** - 4-frame animated bird (flappybird0-3.png)
- **Background** - Scrolling background image (flappybirdbg.png)
- **Pipe Graphics** - Top and bottom pipe sprites (toppipe.png, bottompipe.png)
- **PNG Format** - Optimized for web with transparency support

#### Audio Files
- **Background Music** - Mario theme (bgm_mario.mp3)
- **Sound Effects**:
  - Wing flap (sfx_wing.wav)
  - Collision hit (sfx_hit.wav)
  - Game over (sfx_die.wav)
  - Point scored (sfx_point.wav)
  - Swoosh transition (sfx_swooshing.wav)

### Game Engine Features
- **Physics System** - Gravity, velocity, and collision detection
- **Particle System** - Explosion effects and visual feedback
- **Animation Loop** - RequestAnimationFrame for smooth 60fps gameplay
- **Progressive Difficulty** - Speed increases every 5 points
- **State Management** - Game states (menu, playing, paused, game over)

### Browser Compatibility
- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **Mobile Responsive** - Touch controls and adaptive layouts
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

## Database Features

### IndexedDB Integration
- **Persistent Storage**: All scores saved locally in browser database
- **No Server Required**: Works completely offline
- **High Performance**: Fast queries and indexing
- **Cross-Session**: Scores persist between browser sessions

### Score Management
- **All Scores Saved**: Every game score is stored, not just high scores
- **Player Names**: Tracks scores by player (default: Anonymous)
- **Timestamps**: Records when each score was achieved
- **Statistics**: Total games, average score, and player metrics

### Leaderboard System
- **Top 10 Display**: Shows highest scores with gold/silver/bronze medals
- **Real-time Updates**: Immediately reflects new high scores
- **Responsive Design**: Works on all screen sizes
- **Interactive Modal**: Clean, accessible interface

### Settings Storage
- **Sound Preferences**: Mute/unmute settings saved to database
- **Player Names**: Customizable player identification
- **Fallback Support**: Graceful degradation to localStorage if needed

