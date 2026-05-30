/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useEffect } from 'react';
import type { GameState, GameStats, StoryOption } from '../types/game';
import storyData from '../data/story.json';

const INITIAL_STATS: GameStats = {
  money: 50,
  health: 80,
  freedom: 50,
  traffic: 40,
  identity: 100,
};

const initialState: GameState = {
  stats: INITIAL_STATS,
  currentNodeId: 'start_node',
  history: [],
};

type GameAction = 
  | { type: 'MAKE_CHOICE'; option: StoryOption }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_CHOICE': {
      const { effects, next_node_id } = action.option;
      
      // Tính toán chỉ số mới và giới hạn trong khoảng [0, 100]
      const newStats = { ...state.stats };
      (Object.keys(effects) as Array<keyof GameStats>).forEach((key) => {
        if (effects[key] !== undefined) {
          newStats[key] = Math.max(0, Math.min(100, newStats[key] + (effects[key] || 0)));
        }
      });

      // Kiểm tra điều kiện Kích hoạt Kịch bản Khẩn cấp trước khi chuyển node thông thường
      let finalNextNodeId = next_node_id;
      const isNextNodeEnding = next_node_id.startsWith('ending_');

      if (!isNextNodeEnding) {
        if (newStats.health <= 0) finalNextNodeId = 'ending_burnout';
        else if (newStats.identity <= 0) finalNextNodeId = 'ending_alienation';
        else if (newStats.money <= 0) finalNextNodeId = 'ending_bankruptcy';
        else if (newStats.traffic >= 90 && newStats.identity <= 15) finalNextNodeId = 'ending_platform_partner';
        else if (newStats.freedom >= 90 && newStats.money <= 15) finalNextNodeId = 'ending_off_grid';
      }

      return {
        stats: newStats,
        currentNodeId: finalNextNodeId,
        history: [...state.history, state.currentNodeId],
      };
    }
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = 'alienation_save';

function initGameState(initial: GameState): GameState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse save game:', e);
    }
  }
  return initial;
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState, initGameState);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentNode = (storyData.nodes as Record<string, any>)[state.currentNodeId];

  const makeChoice = (option: StoryOption) => {
    dispatch({ type: 'MAKE_CHOICE', option });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return {
    state,
    currentNode,
    makeChoice,
    resetGame,
  };
}