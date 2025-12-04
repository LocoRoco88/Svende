import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { GameState, Grade } from '../types';
import { leanQuestions } from '../questions';

export const UI = () => {
  const gameState = useStore(state => state.gameState);
  const grade = useStore(state => state.grade);
  const items = useStore(state => state.itemsProduced);
  const holding = useStore(state => state.holdingItem);
  const isInvincible = useStore(state => state.isInvincible);
  const emergencyStart = useStore(state => state.emergencyStartTime);
  const isSlipping = useStore(state => state.isSlipping);
  
  const startGame = useStore(state => state.startGame);
  const answerQuiz = useStore(state => state.answerQuiz);
  const resetGame = useStore(state => state.resetGame);

  const [emergencyTimeLeft, setEmergencyTimeLeft] = useState(60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Randomize question on quiz open
  useEffect(() => {
    if (gameState === GameState.QUIZ) {
      setCurrentQuestionIdx(Math.floor(Math.random() * leanQuestions.length));
    }
  }, [gameState]);

  // Update loop for timer display
  useEffect(() => {
    let interval: any;
    if (emergencyStart) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - emergencyStart) / 1000;
        setEmergencyTimeLeft(Math.max(0, 60 - Math.floor(elapsed)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emergencyStart]);

  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50">
        <h1 className="text-5xl font-black mb-4 text-yellow-400 uppercase tracking-widest">Svendeprøven</h1>
        <h2 className="text-2xl mb-8 text-gray-400">Industrioperatør</h2>
        <div className="bg-slate-800 p-6 rounded-lg max-w-md text-left space-y-4 mb-8 border border-slate-600">
          <p>🎯 <span className="font-bold text-yellow-300">Mål:</span> Producer 100 emner for at bestå.</p>
          <p>⚠️ <span className="font-bold text-red-300">Nyt:</span> Hold 'E' for at reparere ødelagte maskiner og fjerne oliespild!</p>
          <p>🕹 <span className="font-bold text-yellow-300">Styring:</span></p>
          <ul className="list-disc list-inside text-gray-300 pl-4 space-y-1">
            <li>WASD / Piletaster: Gå</li>
            <li>Q/E eller Piletaster: Rotér kamera</li>
            <li>SHIFT: Løb</li>
            <li>'E': Interager / Reparer</li>
          </ul>
          <button 
            onClick={startGame}
            className="w-full mt-4 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded shadow-lg transform transition hover:scale-105"
          >
            START EKSAMEN
          </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.VICTORY) {
     return (
      <div className="absolute inset-0 bg-green-900 flex flex-col items-center justify-center text-white z-50">
        <h1 className="text-6xl font-bold mb-4">BESTÅET! 🎓</h1>
        <p className="text-2xl mb-4">Du har produceret {items} emner.</p>
        <p className="text-4xl mb-8 text-yellow-400">Endelig Karakter: {grade}</p>
        <button onClick={resetGame} className="px-6 py-3 bg-white text-green-900 font-bold rounded">Prøv Igen</button>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
     return (
      <div className="absolute inset-0 bg-red-900 flex flex-col items-center justify-center text-white z-50">
        <h1 className="text-6xl font-bold mb-4">DUMPET ☠️</h1>
        <p className="text-2xl mb-8">Karakter: -3</p>
        <button onClick={resetGame} className="px-6 py-3 bg-white text-red-900 font-bold rounded">Prøv Igen</button>
      </div>
    );
  }

  // HUD
  return (
    <>
      <div className="absolute top-4 left-4 p-4 bg-slate-800/80 rounded border-2 border-slate-600 text-white select-none z-10 pointer-events-none">
        <div className="text-sm text-gray-400 uppercase tracking-widest">Produktion</div>
        <div className="text-4xl font-mono font-bold text-yellow-400">{items} / 100</div>
        
        <div className="mt-4 text-sm text-gray-400 uppercase tracking-widest">Karakter</div>
        <div className={`text-5xl font-black ${grade <= 2 ? 'text-red-500' : 'text-green-400'}`}>
          {grade === 0 ? '00' : grade === 2 ? '02' : grade}
        </div>

        <div className="mt-4">
           {holding ? (
             <span className="px-2 py-1 bg-purple-600 text-xs font-bold rounded">HAR RÅVARE</span>
           ) : (
             <span className="px-2 py-1 bg-gray-600 text-xs font-bold rounded text-gray-300">TOMME HÆNDER</span>
           )}
        </div>
      </div>

      {/* Emergency Overlay */}
      {emergencyStart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 p-4 rounded text-white animate-pulse z-10 pointer-events-none">
           <h2 className="text-2xl font-black uppercase">⚠️ Nødplan Igangsat ⚠️</h2>
           <p className="text-center font-mono text-3xl">{emergencyTimeLeft}s</p>
           <p className="text-sm">Producer hurtigt for at redde karakteren!</p>
        </div>
      )}
      
      {/* Hazard Warning */}
      {isSlipping && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black text-6xl opacity-80 rotate-12 animate-bounce pointer-events-none z-20">
              OLIESPILD!
          </div>
      )}
      
      {/* Invincible Indicator */}
      {isInvincible && gameState === GameState.PLAYING && (
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-xl drop-shadow-md z-10 animate-bounce pointer-events-none">
            🛡️ HELLE (3s)
         </div>
      )}

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-50" />

      {/* Quiz Modal */}
      {gameState === GameState.QUIZ && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white text-slate-900 p-8 rounded-lg max-w-2xl w-full shadow-2xl border-4 border-blue-500">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Læreren spørger:</h2>
            <p className="text-xl mb-8 font-medium">{leanQuestions[currentQuestionIdx].question}</p>
            
            <div className="grid grid-cols-1 gap-4">
              {leanQuestions[currentQuestionIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answerQuiz(idx === leanQuestions[currentQuestionIdx].correctIndex)}
                  className="p-4 bg-slate-100 hover:bg-blue-100 border border-slate-300 rounded text-left font-medium transition duration-150 flex items-center group"
                >
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-600">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500 text-center">Svar forkert og din karakter falder!</p>
          </div>
        </div>
      )}
    </>
  );
};
