import './character.css';

interface CharacterSpriteProps {
  mood?: 'happy' | 'tired';
  className?: string;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ mood = 'happy', className = '' }) => {
  const spriteClass = mood === 'tired' ? 'sprite-typing-tired' : 'sprite-typing-happy';

  return (
    <div className={`relative w-[400px] h-[300px] shrink-0 z-10 overflow-hidden mx-auto
                    border-4 border-slate-700 bg-slate-900 shadow-[8px_8px_0_rgba(0,0,0,0.5)]
                    ${className}`}>
      <div
        className={`w-full h-full ${spriteClass}`}
        style={{ 
          backgroundImage: `url(/assets/happy-coding.png)`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default CharacterSprite;