/**
 * colorTheory.ts
 *
 * This module defines an extensive mapping of color schemes.
 * Each key represents a scheme name, and its value is a function
 * that returns an array of derived color objects based on the provided
 * base HSB values.
 */
const colorSchemes = {
    // Standard Schemes
    analogous: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 30) % 360, s: baseS, b: baseB },
        { h: (baseH - 30 + 360) % 360, s: baseS, b: baseB }
    ],
    complementary: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 180) % 360, s: baseS, b: baseB }
    ],
    triadic: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 120) % 360, s: baseS, b: baseB },
        { h: (baseH + 240) % 360, s: baseS, b: baseB }
    ],
    tetradic: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 90) % 360, s: baseS, b: baseB },
        { h: (baseH + 180) % 360, s: baseS, b: baseB },
        { h: (baseH + 270) % 360, s: baseS, b: baseB }
    ],
    monochromatic: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: baseH, s: baseS, b: Math.min(baseB + 20, 100) },
        { h: baseH, s: baseS, b: Math.max(baseB - 20, 0) }
    ],
    pastel: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 40, 0), b: Math.min(baseB + 30, 100) },
        { h: (baseH + 30) % 360, s: Math.max(baseS - 40, 0), b: Math.min(baseB + 30, 100) },
        { h: (baseH - 30 + 360) % 360, s: Math.max(baseS - 40, 0), b: Math.min(baseB + 30, 100) }
    ],
    neon: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.min(baseS + 40, 100), b: baseB },
        { h: (baseH + 120) % 360, s: Math.min(baseS + 40, 100), b: baseB },
        { h: (baseH + 240) % 360, s: Math.min(baseS + 40, 100), b: baseB }
    ],
    dark: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: Math.max(baseB - 30, 0) },
        { h: (baseH + 60) % 360, s: baseS, b: Math.max(baseB - 30, 0) },
        { h: (baseH + 300) % 360, s: baseS, b: Math.max(baseB - 30, 0) }
    ],
    vibrant: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.min(baseS + 20, 100), b: Math.min(baseB + 10, 100) },
        { h: (baseH + 40) % 360, s: Math.min(baseS + 20, 100), b: Math.min(baseB + 10, 100) },
        { h: (baseH - 40 + 360) % 360, s: Math.min(baseS + 20, 100), b: Math.min(baseB + 10, 100) }
    ],
    muted: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 50, 0), b: baseB }
    ],
    clash: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 160) % 360, s: baseS, b: baseB }
    ],
    metallic: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 30, 0), b: Math.max(baseB - 10, 0) },
        { h: baseH, s: Math.max(baseS - 50, 0), b: baseB }
    ],
    earthy: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 60, 0), b: baseB }
    ],
    gradient: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: baseH, s: baseS, b: Math.min(baseB + 20, 100) },
        { h: baseH, s: baseS, b: Math.min(baseB + 40, 100) }
    ],
    // Extended Schemes
    pentatonic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
            arr.push({ h: (baseH + i * 72) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    hexatonic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 6; i++) {
            arr.push({ h: (baseH + i * 60) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    heptatonic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 7; i++) {
            arr.push({ h: (baseH + i * (360 / 7)) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    octatonic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 8; i++) {
            arr.push({ h: (baseH + i * 45) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    nonatonic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 9; i++) {
            arr.push({ h: (baseH + i * 40) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    spectrum: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 10; i++) {
            arr.push({ h: (baseH + i * 36) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    "analogous-complementary": (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 30) % 360, s: baseS, b: baseB },
        { h: (baseH + 180) % 360, s: baseS, b: baseB },
        { h: (baseH + 150) % 360, s: baseS, b: baseB }
    ],
    "double-split-complementary": (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 150) % 360, s: baseS, b: baseB },
        { h: (baseH + 210) % 360, s: baseS, b: baseB },
        { h: (baseH + 330) % 360, s: baseS, b: baseB },
        { h: (baseH + 30) % 360, s: baseS, b: baseB }
    ],
    "complementary-triadic": (baseH, baseS, baseB) => {
        const comp = (baseH + 180) % 360;
        return [
            { h: baseH, s: baseS, b: baseB },
            { h: comp, s: baseS, b: baseB },
            { h: (baseH + 120) % 360, s: baseS, b: baseB },
            { h: (baseH + 240) % 360, s: baseS, b: baseB }
        ];
    },
    duotone: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: baseH, s: Math.max(baseS - 20, 0), b: Math.min(baseB + 20, 100) }
    ],
    tritone: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: baseH, s: Math.min(baseS + 20, 100), b: baseB },
        { h: baseH, s: Math.max(baseS - 20, 0), b: baseB }
    ],
    "double analogous": (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: (baseH + 20) % 360, s: baseS, b: baseB },
        { h: (baseH - 20 + 360) % 360, s: baseS, b: baseB },
        { h: (baseH + 40) % 360, s: baseS, b: baseB },
        { h: (baseH - 40 + 360) % 360, s: baseS, b: baseB }
    ],
    sequential: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
            const newB = Math.min(baseB + i * ((100 - baseB) / 4), 100);
            arr.push({ h: baseH, s: baseS, b: newB });
        }
        return arr;
    },
    diverging: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = -2; i <= 2; i++) {
            const newB = Math.max(0, Math.min(baseB + i * 20, 100));
            arr.push({ h: baseH, s: baseS, b: newB });
        }
        return arr;
    },
    cyclic: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 12; i++) {
            arr.push({ h: (baseH + i * 30) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    achromatic: (baseH, baseS, baseB) => {
        return [10, 30, 50, 70, 90].map(b => ({ h: 0, s: 0, b }));
    },
    accent: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: 0, s: 0, b: 90 },
        { h: 0, s: 0, b: 10 },
        { h: (baseH + 180) % 360, s: baseS, b: baseB }
    ],
    subtle: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 30, 0), b: baseB },
        { h: (baseH + 10) % 360, s: Math.max(baseS - 30, 0), b: Math.min(baseB + 10, 100) },
        { h: (baseH - 10 + 360) % 360, s: Math.max(baseS - 30, 0), b: Math.max(baseB - 10, 0) }
    ],
    "high-contrast": (baseH, baseS, baseB) => [
        { h: baseH, s: 100, b: baseB },
        { h: baseH, s: 100, b: Math.min(baseB + 20, 100) },
        { h: baseH, s: 100, b: Math.max(baseB - 20, 0) }
    ],
    vintage: (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 40, 0), b: 50 },
        { h: baseH, s: Math.max(baseS - 40, 0), b: 40 },
        { h: baseH, s: Math.max(baseS - 40, 0), b: 60 }
    ],
    retro: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 4; i++) {
            arr.push({ h: (baseH + i * 40) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    minimalist: (baseH, baseS, baseB) => [
        { h: baseH, s: baseS, b: baseB },
        { h: 0, s: 0, b: 100 },
        { h: 0, s: 0, b: 0 }
    ],
    "double-triadic": (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 3; i++) {
            arr.push({ h: (baseH + i * 120) % 360, s: baseS, b: baseB });
            arr.push({ h: (baseH + 60 + i * 120) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    "quadruple-split": (baseH, baseS, baseB) => {
        return [
            { h: baseH, s: baseS, b: baseB },
            { h: (baseH + 135) % 360, s: baseS, b: baseB },
            { h: (baseH + 180) % 360, s: baseS, b: baseB },
            { h: (baseH + 225) % 360, s: baseS, b: baseB },
            { h: (baseH + 315) % 360, s: baseS, b: baseB }
        ];
    },
    "jewel-tone": (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 4; i++) {
            arr.push({ h: (baseH + i * 90) % 360, s: Math.min(baseS + 20, 100), b: 50 });
        }
        return arr;
    },
    "pastel-gradient": (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
            arr.push({
                h: baseH,
                s: Math.max(baseS - 40, 0),
                b: Math.min(baseB + i * (((100 - baseB) / 4) + 10), 100)
            });
        }
        return arr;
    },
    colorful: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 7; i++) {
            arr.push({ h: (baseH + i * (360 / 7)) % 360, s: baseS, b: baseB });
        }
        return arr;
    },
    "complementary-monochrome": (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = -1; i <= 1; i++) {
            arr.push({ h: baseH, s: baseS, b: Math.max(0, Math.min(baseB + i * 15, 100)) });
            arr.push({ h: (baseH + 180) % 360, s: baseS, b: Math.max(0, Math.min(baseB + i * 15, 100)) });
        }
        return arr;
    },
    "analogous-gradient": (baseH, baseS, baseB) => {
        return [
            { h: (baseH - 30 + 360) % 360, s: baseS, b: baseB },
            { h: (baseH - 15 + 360) % 360, s: baseS, b: baseB },
            { h: baseH, s: baseS, b: baseB },
            { h: (baseH + 15) % 360, s: baseS, b: baseB },
            { h: (baseH + 30) % 360, s: baseS, b: baseB }
        ];
    },
    "earthy-vintage": (baseH, baseS, baseB) => [
        { h: baseH, s: Math.max(baseS - 40, 0), b: Math.max(baseB - 10, 0) },
        { h: baseH, s: Math.max(baseS - 40, 0), b: baseB },
        { h: baseH, s: Math.max(baseS - 40, 0), b: Math.min(baseB + 10, 100) }
    ],
    "neon-gradient": (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = 0; i < 3; i++) {
            arr.push({
                h: baseH,
                s: Math.min(baseS + 40, 100),
                b: Math.max(0, Math.min(baseB + i * 10, 100))
            });
        }
        return arr;
    },
    saturated: (baseH, baseS, baseB) => {
        const arr = [];
        for (let i = -1; i <= 1; i++) {
            arr.push({ h: (baseH + i * 20 + 360) % 360, s: 100, b: baseB });
        }
        return arr;
    },
    // Special themed schemes:
    "cyberpunk-themed": (baseH, baseS, baseB) => [
        { h: 320, s: 90, b: 50 },
        { h: 210, s: 90, b: 50 },
        { h: 140, s: 90, b: 50 },
        { h: 190, s: 90, b: 50 },
        { h: 280, s: 90, b: 50 }
    ],
    "burning-man-themed": (baseH, baseS, baseB) => [
        { h: 5, s: 85, b: 50 },
        { h: 25, s: 80, b: 50 },
        { h: 15, s: 70, b: 40 },
        { h: 40, s: 40, b: 70 },
        { h: 45, s: 70, b: 55 }
    ]
};
export function getDerivedColors(baseH, baseS, baseB, scheme = "analogous") {
    const fn = colorSchemes[scheme.toLowerCase()] || colorSchemes.analogous;
    return fn(baseH, baseS, baseB);
}
export const availableSchemes = Object.keys(colorSchemes);
//# sourceMappingURL=colorTheory.js.map