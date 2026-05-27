// import 'character.css' ; // File CSS thuần chỉ chứa logic Spritesheet

// const CharacterSprite = ({ mood = 'happy' }) => {
  
//   // Xác định Class CSS thuần tương ứng
//   const spriteClass = mood === 'tired' ? 'sprite-typing-tired' : 'sprite-typing-happy';

//   return (
//     // 1. Container cha: Hoàn toàn dùng TAILWIND
//     // - Quản lý vị trí, kích thước, hiệu ứng Glow, Z-index.
//     // - CỰC KỲ DỄ RESPONSIVE CHO LỚP HỌC (Ví dụ: thu nhỏ trên màn hình nhỏ).
//     <div className="absolute bottom-0 right-[10%] w-[300px] h-[200px] z-10 overflow-hidden 
//                     shadow-[0_0_30px_rgba(16,185,129,0.2)] lg:right-[15%] lg:w-[350px] lg:h-[233px]">
      
//       {/* 2. Container con (Spritesheet thực): Trộn lẫn CLASS RIÊNG và TAILWIND */}
//       {/* - Tailwind: 'w-full h-full' để lấy hết cha. */}
//       {/* - Class riêng: spriteClass (sprite-typing-happy/tired) để chạy logic Spritesheet. */}
//       <div
//         className={`w-full h-full ${spriteClass}`}
//         // Mẹo: Vẫn neo ảnh qua inline-style để dễ thay đổi spritesheet sau này qua JSON
//         style={{ backgroundImage: `url(/assets/coder-spritesheet.png)` }}
//       />
      
//     </div>
//   );
// };

// export default CharacterSprite;