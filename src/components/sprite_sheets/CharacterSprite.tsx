import './character.css';

export interface CharacterSpriteProps {
  mood?: 'happy' | 'tired' | 'quit';
  className?: string;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ mood = 'happy', className = '' }) => {
  let spriteClass = 'sprite-typing-happy';
  let bgImage = '/assets/happy-coding.png';
  let widthClass = 'w-[400px] h-[300px]';

  if (mood === 'tired') {
    spriteClass = 'sprite-typing-tired';
  } else if (mood === 'quit') {
    spriteClass = 'sprite-quit-job';
    bgImage = '/assets/quit-job.png';
    widthClass = 'w-[400px] h-[386px]'; // Tính toán chuẩn aspect ratio cho quit-job.png
  }

  return (
    <div className={`relative ${widthClass} shrink-0 z-10 overflow-hidden mx-auto
                    border-4 border-slate-700 bg-slate-900 shadow-[8px_8px_0_rgba(0,0,0,0.5)]
                    ${className}`}>
      <div
        className={`w-full h-full ${spriteClass}`}
        style={{ 
          backgroundImage: `url(${bgImage})`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default CharacterSprite;