import React from 'react';

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  QUIZ = 'QUIZ',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum Grade {
  G12 = 12,
  G10 = 10,
  G7 = 7,
  G4 = 4,
  G02 = 2,
  G00 = 0,
  GM3 = -3
}

export interface LeanQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface OilSpill {
  id: string;
  position: [number, number, number];
}

export interface MachineState {
  id: number;
  broken: boolean;
  smokeOffset: number; // For animation variety
}

export interface PlayerState {
  holdingItem: boolean;
  itemsProduced: number;
  grade: Grade;
  emergencyTimer: number | null; // Null if not in emergency
  emergencyTarget: number; // Target score to escape emergency
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshToonMaterial: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      sphereGeometry: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      circleGeometry: any;
      fog: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshToonMaterial: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      sphereGeometry: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      circleGeometry: any;
      fog: any;
    }
  }
}
