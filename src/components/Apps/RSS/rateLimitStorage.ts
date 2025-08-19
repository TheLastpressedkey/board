/**
 * Utilitaire pour gérer le stockage local des informations de limite de taux RSS
 */

export interface RateLimitData {
  count: number;
  windowStart: number;
  maxRequests: number;
  timeWindow: number;
}

const STORAGE_KEY = 'rss_rate_limit_data';

export class RateLimitStorage {
  private static instance: RateLimitStorage;
  private data: RateLimitData;

  private constructor() {
    this.data = this.loadFromStorage();
  }

  public static getInstance(): RateLimitStorage {
    if (!RateLimitStorage.instance) {
      RateLimitStorage.instance = new RateLimitStorage();
    }
    return RateLimitStorage.instance;
  }

  /**
   * Charge les données depuis le localStorage
   */
  private loadFromStorage(): RateLimitData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Vérifier si les données sont valides et récentes
        if (this.isValidData(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error loading rate limit data from localStorage:', error);
    }

    // Retourner des données par défaut si aucune donnée valide n'est trouvée
    return this.getDefaultData();
  }

  /**
   * Sauvegarde les données dans le localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn('Error saving rate limit data to localStorage:', error);
    }
  }

  /**
   * Vérifie si les données stockées sont valides
   */
  private isValidData(data: any): boolean {
    return (
      data &&
      typeof data.count === 'number' &&
      typeof data.windowStart === 'number' &&
      typeof data.maxRequests === 'number' &&
      typeof data.timeWindow === 'number' &&
      data.count >= 0 &&
      data.windowStart > 0 &&
      data.maxRequests > 0 &&
      data.timeWindow > 0
    );
  }

  /**
   * Retourne les données par défaut
   */
  private getDefaultData(): RateLimitData {
    return {
      count: 0,
      windowStart: Date.now(),
      maxRequests: 10,
      timeWindow: 30 * 60 * 1000 // 30 minutes
    };
  }

  /**
   * Obtient les données actuelles de limite de taux
   */
  public getRateLimitData(): RateLimitData {
    return { ...this.data };
  }

  /**
   * Met à jour le compteur de requêtes
   */
  public incrementRequestCount(): void {
    this.data.count += 1;
    this.saveToStorage();
  }

  /**
   * Vérifie si une requête peut être effectuée
   */
  public canMakeRequest(): boolean {
    const now = Date.now();
    
    // Reset du compteur si la fenêtre de temps est écoulée
    if (now - this.data.windowStart > this.data.timeWindow) {
      this.resetWindow();
      return true;
    }

    return this.data.count < this.data.maxRequests;
  }

  /**
   * Reset la fenêtre de temps et le compteur
   */
  public resetWindow(): void {
    this.data.count = 0;
    this.data.windowStart = Date.now();
    this.saveToStorage();
  }

  /**
   * Force le reset des données (pour les tests ou l'administration)
   */
  public forceReset(): void {
    this.data = this.getDefaultData();
    this.saveToStorage();
  }

  /**
   * Obtient des informations détaillées sur l'état actuel
   */
  public getStatus(): {
    requestsRemaining: number;
    requestsUsed: number;
    maxRequests: number;
    timeUntilReset: number; // en minutes
    isRateLimited: boolean;
    windowStart: Date;
    windowEnd: Date;
  } {
    const now = Date.now();
    const timeUntilReset = Math.max(0, (this.data.windowStart + this.data.timeWindow) - now);
    
    return {
      requestsRemaining: Math.max(0, this.data.maxRequests - this.data.count),
      requestsUsed: this.data.count,
      maxRequests: this.data.maxRequests,
      timeUntilReset: Math.ceil(timeUntilReset / 1000 / 60),
      isRateLimited: this.data.count >= this.data.maxRequests && timeUntilReset > 0,
      windowStart: new Date(this.data.windowStart),
      windowEnd: new Date(this.data.windowStart + this.data.timeWindow)
    };
  }

  /**
   * Configure les paramètres de limite (pour l'administration)
   */
  public configure(maxRequests: number, timeWindowMinutes: number): void {
    if (maxRequests > 0 && timeWindowMinutes > 0) {
      this.data.maxRequests = maxRequests;
      this.data.timeWindow = timeWindowMinutes * 60 * 1000;
      this.saveToStorage();
    }
  }

  /**
   * Nettoie les données expirées (peut être appelé au démarrage de l'app)
   */
  public cleanup(): void {
    const now = Date.now();
    if (now - this.data.windowStart > this.data.timeWindow) {
      this.resetWindow();
    }
  }

  /**
   * Export des données pour le debug
   */
  public exportData(): string {
    return JSON.stringify({
      ...this.data,
      currentTime: Date.now(),
      status: this.getStatus()
    }, null, 2);
  }
}

// Instance singleton pour usage global
export const rateLimitStorage = RateLimitStorage.getInstance();