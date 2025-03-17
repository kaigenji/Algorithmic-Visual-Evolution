// File: utils/keys.js

export function setupKeyControls(config, onConfigChange, onHotkeyLog) {
  const parameters = [
    {
      name: 'cellSize',
      display: 'Grid Resolution (cellSize)',
      min: config.minCellSize,
      max: config.maxCellSize
    },
    {
      name: 'tickRate',
      display: 'Tick Rate',
      min: config.minTickRate,
      max: config.maxTickRate
    },
    {
      name: 'activeCellDensity',
      display: 'Active Cell Density',
      min: 0.1,
      max: 1.0
    }
  ];

  let activeParamIndex = 0;
  let currentMacro = null; // last touched macro instance

  onHotkeyLog(`Parameter: ${parameters[activeParamIndex].display}. Use Tab to cycle; ArrowUp/Down to adjust.`);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      activeParamIndex = (activeParamIndex + 1) % parameters.length;
      currentMacro = null;
      onHotkeyLog(`Active param: ${parameters[activeParamIndex].display}`);
      return;
    }

    if (currentMacro) {
      const step = 0.05;
      if (e.key === 'ArrowUp') {
        currentMacro.setBaseline(currentMacro.currentBaseline + step);
        onHotkeyLog(`Macro baseline increased to ${currentMacro.currentBaseline.toFixed(2)}`);
      } else if (e.key === 'ArrowDown') {
        currentMacro.setBaseline(currentMacro.currentBaseline - step);
        onHotkeyLog(`Macro baseline decreased to ${currentMacro.currentBaseline.toFixed(2)}`);
      }
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const param = parameters[activeParamIndex];
      const currentValue = config[param.name];
      const range = param.max - param.min;
      const step = range * 0.05;
      let newValue;
      if (e.key === 'ArrowUp') {
        newValue = currentValue + step;
        if (newValue > param.max) newValue = param.max;
      } else {
        newValue = currentValue - step;
        if (newValue < param.min) newValue = param.min;
      }
      newValue = (param.name === 'tickRate' || param.name === 'cellSize')
        ? Math.round(newValue)
        : Math.round(newValue * 100) / 100;
      onHotkeyLog(`${param.display} updated: ${currentValue} -> ${newValue}`);
      config[param.name] = newValue;
      onConfigChange();
    }
  });

  return {
    setCurrentMacro: (macro) => {
      currentMacro = macro;
      onHotkeyLog(`Macro control activated.`);
    },
    clearCurrentMacro: () => {
      currentMacro = null;
      onHotkeyLog(`Macro control cleared.`);
    }
  };
}
