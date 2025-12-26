// Pomodoro Bread Calculator - Configuration
// Default values and flour database

const BREAD_CONFIG = {
  // Default recipe parameters
  defaults: {
    totalFlour: 800, // grams
    baseHydration: 70, // percentage
    saltPercentage: 2, // percentage of flour weight
    starterPercentage: 25, // percentage of flour weight
  },

  // Pomodoro timing (1 pomodoro = 25 minutes)
  pomodoro: {
    duration: 25, // minutes
    label: 'pomodoro',
    pluralLabel: 'pomodoros',
  },

  // Flour types database with hydration adjustments
  // Base hydration is adjusted by these values
  flourTypes: {
    'strong-white': {
      name: 'Strong White Flour (Bread Flour)',
      baseHydration: 70,
      adjustment: 0,
      description: 'High-protein white flour, ideal for bread making',
    },
    'all-purpose': {
      name: 'All-Purpose Flour',
      baseHydration: 65,
      adjustment: -5,
      description: 'Medium-protein white flour, versatile',
    },
    'whole-wheat': {
      name: 'Whole Wheat Flour (Wholemeal)',
      baseHydration: 75,
      adjustment: 5,
      description: 'Contains bran and germ, absorbs more water',
    },
    'whole-rye': {
      name: 'Whole Rye Flour',
      baseHydration: 80,
      adjustment: 10,
      description: 'Very absorbent, creates dense crumb',
    },
    'white-rye': {
      name: 'White Rye Flour (Light Rye)',
      baseHydration: 75,
      adjustment: 5,
      description: 'Sifted rye flour, less absorbent than whole rye',
    },
    'spelt-whole': {
      name: 'Whole Spelt Flour',
      baseHydration: 75,
      adjustment: 5,
      description: 'Ancient grain, slightly nutty flavor',
    },
    'spelt-white': {
      name: 'White Spelt Flour',
      baseHydration: 70,
      adjustment: 0,
      description: 'Refined spelt, similar to white bread flour',
    },
    'kamut': {
      name: 'Kamut Flour (Khorasan Wheat)',
      baseHydration: 75,
      adjustment: 5,
      description: 'Ancient wheat variety, buttery flavor',
    },
    'einkorn': {
      name: 'Einkorn Flour',
      baseHydration: 70,
      adjustment: 0,
      description: 'Ancient wheat, delicate gluten structure',
    },
    'semolina': {
      name: 'Semolina Flour (Durum Wheat)',
      baseHydration: 68,
      adjustment: -2,
      description: 'Coarse flour from durum wheat',
    },
    'type-00': {
      name: 'Type 00 Flour (Italian)',
      baseHydration: 65,
      adjustment: -5,
      description: 'Finely milled, ideal for pizza and pasta',
    },
    'type-55': {
      name: 'Type 55 Flour (French)',
      baseHydration: 70,
      adjustment: 0,
      description: 'French bread flour, medium protein',
    },
    'emmer': {
      name: 'Emmer Flour (Farro)',
      baseHydration: 75,
      adjustment: 5,
      description: 'Ancient grain with complex flavor',
    },
    'buckwheat': {
      name: 'Buckwheat Flour',
      baseHydration: 85,
      adjustment: 15,
      description: 'Gluten-free, very absorbent (use max 20%)',
    },
  },

  // Recipe timing schedule (in pomodoros)
  // 1 pomodoro = 25 minutes
  schedule: {
    starterFeed: -38.4, // -24 hours = -960 minutes = -38.4 pomodoros
    autolyse: {
      start: 0,
      duration: 4, // 100 minutes = 4 pomodoros
    },
    mix: {
      start: 4,
      duration: 0.12, // 3 minutes
    },
    stretchAndFold: {
      sets: 4,
      interval: 1, // 25 minutes = 1 pomodoro
      duration: 0.04, // 1 minute per set
      starts: [5, 6, 7, 8], // Pomodoros 5, 6, 7, 8
    },
    bulkFermentation: {
      start: 9,
      durationRange: [12, 29], // 5-12 hours = 12-29 pomodoros
      description: 'Room temp (18-22°C) or cold (3-5°C)',
    },
    shape: {
      duration: 0.12, // 3 minutes
      rest: 0, // No rest in simplified version
    },
    finalProof: {
      durationRange: [5, 38], // 2-16 hours
      description: 'Room temp 2-3h or cold 8-16h',
    },
    bake: {
      preheat: 1, // 25 minutes = 1 pomodoro
      covered: 1, // 25 minutes = 1 pomodoro at 250°C
      uncovered: 2, // 50 minutes = 2 pomodoros at 230°C
    },
  },
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BREAD_CONFIG;
}
