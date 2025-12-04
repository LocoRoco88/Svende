import { create } from 'zustand';
import { GameState, Grade, OilSpill, MachineState } from './types';

interface StoreState {
  gameState: GameState;
  grade: Grade;
  itemsProduced: number;
  holdingItem: boolean;
  
  // Interaction & Cooldowns
  isInvincible: boolean;
  invincibilityEndTime: number;
  
  // Physics / Hazards
  isSlipping: boolean;
  setSlipping: (slipping: boolean) => void;
  oilSpills: OilSpill[];
  
  // Machines
  machines: Record<number, MachineState>;
  
  // Emergency Mode
  emergencyStartTime: number | null;
  emergencyTargetStartCount: number;
  
  // Actions
  startGame: () => void;
  produceItem: () => void;
  grabItem: () => void;
  dropItem: () => void;
  catchPlayer: () => void;
  answerQuiz: (correct: boolean) => void;
  updateLoop: (time: number) => void;
  resetGame: () => void;
  
  // New Actions
  breakMachine: (id: number) => void;
  fixMachine: (id: number) => void;
  createOilSpill: () => void;
  cleanOilSpill: (id: string) => void;
}

const GRADE_ORDER = [Grade.G12, Grade.G10, Grade.G7, Grade.G4, Grade.G02, Grade.G00, Grade.GM3];

export const useStore = create<StoreState>((set, get) => ({
  gameState: GameState.MENU,
  grade: Grade.G12,
  itemsProduced: 0,
  holdingItem: false,
  isInvincible: false,
  invincibilityEndTime: 0,
  emergencyStartTime: null,
  emergencyTargetStartCount: 0,
  
  isSlipping: false,
  oilSpills: [],
  machines: {
    1: { id: 1, broken: false, smokeOffset: 0 },
    2: { id: 2, broken: false, smokeOffset: 2 }
  },

  setSlipping: (slipping) => set({ isSlipping: slipping }),

  startGame: () => set({ 
    gameState: GameState.PLAYING, 
    grade: Grade.G12, 
    itemsProduced: 0, 
    holdingItem: false,
    emergencyStartTime: null,
    isInvincible: true,
    invincibilityEndTime: Date.now() + 2000,
    oilSpills: [],
    machines: {
        1: { id: 1, broken: false, smokeOffset: 0 },
        2: { id: 2, broken: false, smokeOffset: 2 }
    }
  }),

  grabItem: () => set((state) => {
    if (state.holdingItem) return {};
    return { holdingItem: true };
  }),

  dropItem: () => set({ holdingItem: false }),

  produceItem: () => set((state) => {
    const newCount = state.itemsProduced + 1;
    let newGrade = state.grade;
    let newState = state.gameState;
    let emergencyStart = state.emergencyStartTime;

    // Check Win Condition
    if (newCount >= 100 && state.grade > Grade.GM3) {
      newState = GameState.VICTORY;
    }

    // Check Emergency Success
    if (state.grade === Grade.G00 && emergencyStart !== null) {
      if (newCount >= state.emergencyTargetStartCount + 10) {
        newGrade = Grade.G02;
        emergencyStart = null;
      }
    }

    return { 
      itemsProduced: newCount, 
      grade: newGrade,
      gameState: newState,
      emergencyStartTime: emergencyStart,
      holdingItem: false 
    };
  }),

  breakMachine: (id) => set((state) => ({
    machines: {
        ...state.machines,
        [id]: { ...state.machines[id], broken: true }
    }
  })),

  fixMachine: (id) => set((state) => ({
    machines: {
        ...state.machines,
        [id]: { ...state.machines[id], broken: false }
    }
  })),

  createOilSpill: () => set((state) => {
      if (state.oilSpills.length > 5) return {};
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      // Don't spawn on top of conveyers (roughly)
      if (Math.abs(z) < 2) return {}; 
      
      return {
          oilSpills: [...state.oilSpills, { id: Math.random().toString(), position: [x, 0.03, z] }]
      };
  }),

  cleanOilSpill: (id) => set((state) => ({
      oilSpills: state.oilSpills.filter(s => s.id !== id)
  })),

  catchPlayer: () => {
    const { gameState, isInvincible } = get();
    if (gameState !== GameState.PLAYING || isInvincible) return;
    set({ gameState: GameState.QUIZ });
  },

  answerQuiz: (correct) => {
    const { grade } = get();
    let newGrade = grade;
    
    if (!correct) {
      const currentIndex = GRADE_ORDER.indexOf(grade);
      if (currentIndex < GRADE_ORDER.length - 1) {
        newGrade = GRADE_ORDER[currentIndex + 1];
      }
    }

    let emergencyStart = get().emergencyStartTime;
    let emergencyTarget = get().emergencyTargetStartCount;

    if (newGrade === Grade.G00 && grade !== Grade.G00) {
       emergencyStart = Date.now();
       emergencyTarget = get().itemsProduced;
    } else if (newGrade === Grade.GM3) {
      set({ gameState: GameState.GAME_OVER, grade: newGrade });
      return;
    }

    set({
      grade: newGrade,
      gameState: GameState.PLAYING,
      isInvincible: true,
      invincibilityEndTime: Date.now() + 3000,
      emergencyStartTime: emergencyStart,
      emergencyTargetStartCount: emergencyTarget
    });
  },

  updateLoop: (time) => {
    const state = get();
    
    // Invincibility
    if (state.isInvincible && time > state.invincibilityEndTime) {
      set({ isInvincible: false });
    }

    // Emergency Timer
    if (state.gameState === GameState.PLAYING && state.grade === Grade.G00 && state.emergencyStartTime) {
      const elapsed = time - state.emergencyStartTime;
      if (elapsed > 60000) {
         set({ grade: Grade.GM3, gameState: GameState.GAME_OVER });
      }
    }

    // Random Events (Only during play)
    if (state.gameState === GameState.PLAYING) {
        // Chance to break machine (1 in 1000 per frame roughly 60fps -> every 16 sec approx)
        if (Math.random() < 0.001) {
            const machineIds = Object.keys(state.machines).map(Number);
            const randomId = machineIds[Math.floor(Math.random() * machineIds.length)];
            if (!state.machines[randomId].broken) {
                state.breakMachine(randomId);
            }
        }

        // Chance to spawn oil (1 in 800)
        if (Math.random() < 0.0015) {
            state.createOilSpill();
        }
    }
  },

  resetGame: () => set({
    gameState: GameState.MENU,
    grade: Grade.G12,
    itemsProduced: 0,
    holdingItem: false,
    emergencyStartTime: null,
    machines: {
        1: { id: 1, broken: false, smokeOffset: 0 },
        2: { id: 2, broken: false, smokeOffset: 2 }
    },
    oilSpills: []
  })
}));
