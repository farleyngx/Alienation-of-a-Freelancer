export interface GameStats {
  money: number;
  health: number;
  freedom: number;
  traffic: number;
  identity: number; // Đã thêm chỉ số Bản sắc (Chống tha hóa)
}

export interface StoryOption {
  text: string;
  next_node_id: string;
  effects: Partial<GameStats>;
}

export interface StoryNode {
  id: string;
  speaker: 'PLAYER' | 'ALGORITHM' | 'SYSTEM' | 'NARRATOR' | 'CLIENT' | 'UNION';
  text: string;
  options: StoryOption[];
  is_ending?: boolean;
}

export interface GameState {
  stats: GameStats;
  currentNodeId: string;
  history: string[];
}