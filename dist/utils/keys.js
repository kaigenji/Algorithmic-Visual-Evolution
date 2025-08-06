/**
 * Algorithmic Visual Evolution - Keyboard Controls
 *
 * Implements keyboard input handling for user interaction:
 * - Maps keyboard keys to specific simulation parameters and actions
 * - Handles keyboard events and updates configuration values
 * - Provides shortcuts for adjusting simulation parameters
 * - Supports modifier keys for fine/coarse adjustments
 * - Displays on-screen feedback for keyboard interactions
 */
export function setupKeyControls(config, onConfigChange, onHotkeyLog) {
    const parameters = [
        {
            name: 'minCellSize',
            display: 'Grid Resolution (cellSize)',
            min: config.minCellSize,
            max: config.maxCellSize
        },
        {
            name: 'minTickRate',
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
    parameters.forEach(param => {
        document.addEventListener('keydown', (event) => {
            if (event.key === param.name) {
                if (typeof config[param.name] === 'number') {
                    const currentValue = config[param.name];
                    let newValue = currentValue;
                    if (event.shiftKey) {
                        newValue += 0.1; // Increase step by 0.1 if Shift is pressed
                    }
                    else {
                        newValue += 0.05;
                    }
                    // Clamp the value within the defined min/max range if they exist
                    if (param.min !== undefined && param.max !== undefined) {
                        newValue = Math.max(param.min, Math.min(param.max, newValue));
                    }
                    config[param.name] = newValue;
                    onHotkeyLog(`${param.display} updated: ${currentValue} -> ${newValue}`);
                    onConfigChange();
                }
            }
            else if (event.key === 'Tab') {
                event.preventDefault();
                activeParamIndex = (activeParamIndex + 1) % parameters.length;
                currentMacro = null;
                onHotkeyLog(`Active param: ${parameters[activeParamIndex].display}`);
            }
            else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                if (currentMacro) {
                    if (event.key === 'ArrowUp') {
                        currentMacro.setBaseline(currentMacro.getBaseline() + 0.1);
                    }
                    else if (event.key === 'ArrowDown') {
                        currentMacro.setBaseline(currentMacro.getBaseline() - 0.1);
                    }
                }
            }
        });
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
//# sourceMappingURL=keys.js.map