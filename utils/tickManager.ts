/**
 * Algorithmic Visual Evolution - Tick Manager
 * 
 * Manages the timing system for the simulation:
 * - Controls the simulation update cycle frequency
 * - Provides consistent timing for all animation and updates
 * - Emits tick events that drive the animation loop
 * - Tracks cycle count for time-based behaviors
 * - Handles pause/resume and timing adjustments
 */

// File: utils/tickManager.ts
import { EventBus } from './eventBus.js';
import { config } from '../config.js';

export class TickManager {
  private eventBus: EventBus;
  private intervalId: any;
  public cycleCount: number;

  constructor() {
    this.eventBus = new EventBus();
    this.intervalId = null;
    this.cycleCount = 0;
  }

  start(): void {
    // Always use the current tickRate from config
    const msPerTick = 1000 / config.tickRate;
    this.intervalId = setInterval(() => {
      this.cycleCount++;
      this.eventBus.emit('tick', { cycle: this.cycleCount });
    }, msPerTick);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Public method to register event listeners
  onTick(callback: (data: any) => void): void {
    this.eventBus.on('tick', callback);
  }
} 