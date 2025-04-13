// File: utils/tickManager.ts
import { EventBus } from './eventBus';
import { config } from '../config';

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