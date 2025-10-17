#!/usr/bin/env node

/**
 * Script de vérification avant déploiement
 * Vérifie que tous les prérequis sont remplis
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let hasErrors = false;

console.log('🔍 Vérification pré-déploiement...\n');

// 1. Vérifier que package.json existe
console.log('📦 Vérification de package.json...');
const packageJsonPath = join(rootDir, 'package.json');
if (!existsSync(packageJsonPath)) {
  console.error('❌ package.json introuvable');
  hasErrors = true;
} else {
  console.log('✅ package.json trouvé');
  
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  // Vérifier les scripts nécessaires
  if (!packageJson.scripts?.build) {
    console.error('❌ Script "build" manquant dans package.json');
    hasErrors = true;
  } else {
    console.log('✅ Script "build" présent');
  }
}

// 2. Vérifier que vercel.json existe
console.log('\n⚙️  Vérification de vercel.json...');
const vercelJsonPath = join(rootDir, 'vercel.json');
if (!existsSync(vercelJsonPath)) {
  console.error('❌ vercel.json introuvable');
  hasErrors = true;
} else {
  console.log('✅ vercel.json trouvé');
}

// 3. Vérifier que .env.example existe
console.log('\n🔐 Vérification de .env.example...');
const envExamplePath = join(rootDir, '.env.example');
if (!existsSync(envExamplePath)) {
  console.warn('⚠️  .env.example introuvable (recommandé pour la documentation)');
} else {
  console.log('✅ .env.example trouvé');
}

// 4. Vérifier que .gitignore existe et contient les bonnes entrées
console.log('\n🚫 Vérification de .gitignore...');
const gitignorePath = join(rootDir, '.gitignore');
if (!existsSync(gitignorePath)) {
  console.error('❌ .gitignore introuvable');
  hasErrors = true;
} else {
  const gitignore = readFileSync(gitignorePath, 'utf-8');
  const requiredEntries = ['node_modules', 'dist', '*.local'];
  const missingEntries = requiredEntries.filter(entry => !gitignore.includes(entry));
  
  if (missingEntries.length > 0) {
    console.warn(`⚠️  Entrées manquantes dans .gitignore: ${missingEntries.join(', ')}`);
  } else {
    console.log('✅ .gitignore correctement configuré');
  }
}

// 5. Vérifier que index.html existe
console.log('\n📄 Vérification de index.html...');
const indexHtmlPath = join(rootDir, 'index.html');
if (!existsSync(indexHtmlPath)) {
  console.error('❌ index.html introuvable');
  hasErrors = true;
} else {
  console.log('✅ index.html trouvé');
}

// 6. Vérifier que le dossier src existe
console.log('\n📁 Vérification du dossier src...');
const srcPath = join(rootDir, 'src');
if (!existsSync(srcPath)) {
  console.error('❌ Dossier src introuvable');
  hasErrors = true;
} else {
  console.log('✅ Dossier src trouvé');
  
  // Vérifier les fichiers principaux
  const mainFiles = ['main.tsx', 'App.tsx'];
  for (const file of mainFiles) {
    if (!existsSync(join(srcPath, file))) {
      console.error(`❌ ${file} introuvable dans src/`);
      hasErrors = true;
    } else {
      console.log(`✅ ${file} trouvé`);
    }
  }
}

// 7. Vérifier que vite.config.ts existe
console.log('\n⚡ Vérification de vite.config.ts...');
const viteConfigPath = join(rootDir, 'vite.config.ts');
if (!existsSync(viteConfigPath)) {
  console.error('❌ vite.config.ts introuvable');
  hasErrors = true;
} else {
  console.log('✅ vite.config.ts trouvé');
}

// Résumé
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ Des erreurs ont été détectées. Veuillez les corriger avant de déployer.\n');
  process.exit(1);
} else {
  console.log('\n✅ Toutes les vérifications sont passées !');
  console.log('🚀 Vous pouvez déployer en toute sécurité.\n');
  console.log('Prochaines étapes :');
  console.log('  1. Testez le build : npm run build');
  console.log('  2. Testez le preview : npm run preview');
  console.log('  3. Déployez sur Vercel : vercel --prod\n');
  process.exit(0);
}
