// File: utils/tickManager.js
import { EventBus } from './eventBus.js';
import { config } from '../config.js';

export class TickManager {
  constructor() {
    this.eventBus = new EventBus();
    this.intervalId = null;
    this.cycleCount = 0;
  }

  start() {
    // Always use the current tickRate from config
    const msPerTick = 1000 / config.tickRate;
    this.intervalId = setInterval(() => {
      this.cycleCount++;
      this.eventBus.emit('tick', { cycle: this.cycleCount });
    }, msPerTick);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
