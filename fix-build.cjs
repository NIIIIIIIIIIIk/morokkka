const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/components/DuneLanding/DuneLanding.module.css',
  'src/components/LandingPage/LandingPage.module.css',
  'src/components/MainApp/MainApp.module.css',
  'src/components/MainApp/AutoGenerateButton.module.css',
  'src/components/UI/Button.module.css',
  'src/components/UI/EasterEggModal.module.css',
  'src/components/UI/OnboardingTooltip.module.css',
  'src/components/UI/ParticleEffect.module.css',
  'src/components/UI/SuccessModal.module.css',
  'src/components/UI/TelegramLink.module.css',
  'src/components/UI/Toast.module.css',
];

// Создаем пустые CSS файлы
cssFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '/* Styles */\n');
    console.log(`✅ Created: ${file}`);
  }
});

console.log('\n🎬 All CSS files created! Run npm run build again.');