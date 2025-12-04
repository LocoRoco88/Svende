import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

// Simple Audio Manager using Web Audio API to generate sounds without assets
export const AudioManager = () => {
  const ctx = useRef<AudioContext | null>(null);
  const gameState = useStore(state => state.gameState);
  const itemsProduced = useStore(state => state.itemsProduced);
  const holdingItem = useStore(state => state.holdingItem);
  const isSlipping = useStore(state => state.isSlipping);
  const emergencyStart = useStore(state => state.emergencyStartTime);
  
  // Previous states to detect changes
  const prevItems = useRef(itemsProduced);
  const prevHolding = useRef(holdingItem);
  const nextStepTime = useRef(0);

  useEffect(() => {
    // Initialize Audio Context on user interaction (handled by useEffect on start)
    if (!ctx.current && (window.AudioContext || (window as any).webkitAudioContext)) {
      ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!ctx.current) return;
    const osc = ctx.current.createOscillator();
    const gain = ctx.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.current.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.current.destination);
    osc.start();
    osc.stop(ctx.current.currentTime + duration);
  };

  const playNoise = (duration: number) => {
      if (!ctx.current) return;
      const bufferSize = ctx.current.sampleRate * duration;
      const buffer = ctx.current.createBuffer(1, bufferSize, ctx.current.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.current.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.current.createGain();
      gain.gain.value = 0.05;
      noise.connect(gain);
      gain.connect(ctx.current.destination);
      noise.start();
  };

  // --- Reactive Sounds ---

  // Pickup / Drop
  useEffect(() => {
      if (holdingItem && !prevHolding.current) {
          playTone(400, 'sine', 0.1); // Pickup
          playTone(600, 'sine', 0.1); 
      } else if (!holdingItem && prevHolding.current) {
          playTone(300, 'square', 0.1); // Drop
      }
      prevHolding.current = holdingItem;
  }, [holdingItem]);

  // Production Success
  useEffect(() => {
      if (itemsProduced > prevItems.current) {
          playTone(800, 'triangle', 0.2); // Ding!
          playTone(1200, 'sine', 0.4); 
      }
      prevItems.current = itemsProduced;
  }, [itemsProduced]);

  // Alarm Loop (Emergency)
  useEffect(() => {
      let interval: any;
      if (emergencyStart && gameState === GameState.PLAYING) {
          interval = setInterval(() => {
              playTone(800, 'sawtooth', 0.4, 0.1);
              setTimeout(() => playTone(600, 'sawtooth', 0.4, 0.1), 400);
          }, 800);
      }
      return () => clearInterval(interval);
  }, [emergencyStart, gameState]);

  // Slipping Sound
  useEffect(() => {
      if (isSlipping) {
          playNoise(0.5);
      }
  }, [isSlipping]);

  // Expose global playFootstep
  useEffect(() => {
      (window as any).playFootstep = () => {
          if (!ctx.current) return;
          const now = Date.now();
          if (now > nextStepTime.current) {
             playNoise(0.05); // Short white noise for step
             nextStepTime.current = now + 400; // Step rate
          }
      };
  }, []);

  return null;
};
