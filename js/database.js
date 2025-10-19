// Flappy Bird Database Manager
// Using IndexedDB for persistent high score storage

class FlappyBirdDatabase {
    constructor() {
        this.dbName = 'FlappyBirdDB';
        this.dbVersion = 1;
        this.db = null;
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create high scores object store
                if (!db.objectStoreNames.contains('highScores')) {
                    const objectStore = db.createObjectStore('highScores', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes for better querying
                    objectStore.createIndex('score', 'score', { unique: false });
                    objectStore.createIndex('playerName', 'playerName', { unique: false });
                    objectStore.createIndex('date', 'date', { unique: false });
                }

                // Create settings object store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Add a new high score
    async addHighScore(score, playerName = 'Anonymous') {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readwrite');
            const objectStore = transaction.objectStore('highScores');
            
            const highScore = {
                score: score,
                playerName: playerName,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            const request = objectStore.add(highScore);

            request.onsuccess = () => {
                console.log('High score added successfully');
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Failed to add high score');
                reject(request.error);
            };
        });
    }

    // Get top high scores
    async getTopHighScores(limit = 10) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readonly');
            const objectStore = transaction.objectStore('highScores');
            
            // Open a cursor to get all scores, then sort and limit
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                const scores = request.result;
                // Sort by score (highest first) and limit
                const topScores = scores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);
                resolve(topScores);
            };

            request.onerror = () => {
                console.error('Failed to get high scores');
                reject(request.error);
            };
        });
    }

    // Get the highest score
    async getHighestScore() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readonly');
            const objectStore = transaction.objectStore('highScores');
            
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                const scores = request.result;
                if (scores.length === 0) {
                    resolve(0);
                } else {
                    const highestScore = Math.max(...scores.map(s => s.score));
                    resolve(highestScore);
                }
            };

            request.onerror = () => {
                console.error('Failed to get highest score');
                reject(request.error);
            };
        });
    }

    // Get high scores for a specific player
    async getPlayerHighScores(playerName, limit = 10) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readonly');
            const objectStore = transaction.objectStore('highScores');
            const index = objectStore.index('playerName');
            
            const request = index.getAll(playerName);
            
            request.onsuccess = () => {
                const scores = request.result;
                // Sort by score (highest first) and limit
                const playerScores = scores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);
                resolve(playerScores);
            };

            request.onerror = () => {
                console.error('Failed to get player high scores');
                reject(request.error);
            };
        });
    }

    // Clear all high scores
    async clearHighScores() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readwrite');
            const objectStore = transaction.objectStore('highScores');
            
            const request = objectStore.clear();

            request.onsuccess = () => {
                console.log('High scores cleared successfully');
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to clear high scores');
                reject(request.error);
            };
        });
    }

    // Save settings
    async saveSetting(key, value) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const objectStore = transaction.objectStore('settings');
            
            const setting = { key: key, value: value };
            const request = objectStore.put(setting);

            request.onsuccess = () => {
                console.log(`Setting ${key} saved successfully`);
                resolve();
            };

            request.onerror = () => {
                console.error(`Failed to save setting ${key}`);
                reject(request.error);
            };
        });
    }

    // Get settings
    async getSetting(key, defaultValue = null) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const objectStore = transaction.objectStore('settings');
            
            const request = objectStore.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };

            request.onerror = () => {
                console.error(`Failed to get setting ${key}`);
                reject(request.error);
            };
        });
    }

    // Get database statistics
    async getStats() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['highScores'], 'readonly');
            const objectStore = transaction.objectStore('highScores');
            
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                const scores = request.result;
                const stats = {
                    totalGames: scores.length,
                    highestScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0,
                    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0,
                    totalPlayers: new Set(scores.map(s => s.playerName)).size
                };
                resolve(stats);
            };

            request.onerror = () => {
                console.error('Failed to get stats');
                reject(request.error);
            };
        });
    }
}

// Export for use in other files
window.FlappyBirdDatabase = FlappyBirdDatabase;
