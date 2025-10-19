import { api } from '../lib/convex-client';

// Structure des domaines ABLLS-R avec leurs sous-domaines
const ABLLS_STRUCTURE = {
  "Compétences de base de l'apprenant": {
    order: 1,
    description: "Évalue les aptitudes fondamentales d'apprentissage et de communication",
    subdomains: [
      { prefix: 'A', name: 'Coopération et efficacité des agents renforçateurs', taskCount: 19 },
      { prefix: 'B', name: 'Performances visuelles', taskCount: 27 },
      { prefix: 'C', name: 'Langage réceptif', taskCount: 30 },
      { prefix: 'D', name: 'Imitation', taskCount: 25 },
      { prefix: 'E', name: 'Imitation vocale', taskCount: 13 },
      { prefix: 'F', name: 'Demandes', taskCount: 15 },
      { prefix: 'G', name: 'Dénomination', taskCount: 24 },
      { prefix: 'H', name: 'Intraverbal', taskCount: 23 },
      { prefix: 'I', name: 'Vocalisations spontanées', taskCount: 5 },
      { prefix: 'J', name: 'Syntaxe et grammaire', taskCount: 15 },
      { prefix: 'K', name: 'Jeu et compétences de jeu', taskCount: 14 },
      { prefix: 'L', name: 'Interactions sociales', taskCount: 18 },
      { prefix: 'M', name: 'Instruction en groupe', taskCount: 10 },
      { prefix: 'N', name: 'Suivre les routines de classe', taskCount: 7 },
      { prefix: 'O', name: 'Généralisation des réponses', taskCount: 5 }
    ]
  },
  "Compétences scolaires": {
    order: 2,
    description: "Mesure les habiletés académiques : lecture, écriture et mathématiques",
    subdomains: [
      { prefix: 'P', name: 'Habiletés de lecture', taskCount: 6 },
      { prefix: 'Q', name: 'Compétences mathématiques', taskCount: 12 },
      { prefix: 'R', name: "Compétences d'écriture", taskCount: 8 },
      { prefix: 'S', name: 'Épeler', taskCount: 5 }
    ]
  },
  "Autonomie": {
    order: 3,
    description: "Évalue la capacité à accomplir seul les activités de la vie quotidienne",
    subdomains: [
      { prefix: 'T', name: 'Habillage', taskCount: 7 },
      { prefix: 'U', name: 'Alimentation', taskCount: 5 },
      { prefix: 'V', name: 'Toilette', taskCount: 5 },
      { prefix: 'W', name: 'Propreté', taskCount: 3 }
    ]
  },
  "Motricité": {
    order: 4,
    description: "Explore la motricité globale et fine de l'enfant",
    subdomains: [
      { prefix: 'X', name: 'Motricité globale', taskCount: 6 },
      { prefix: 'Y', name: 'Motricité fine', taskCount: 5 }
    ]
  }
};

export async function insertABLLSTasks(userId: string) {
  console.log('🚀 Début de l\'insertion des tâches ABLLS-R...');
  
  if (!userId) {
    throw new Error('userId est requis pour créer des tâches');
  }
  
  try {
    // Récupérer tous les domaines et sous-domaines existants
    const domains = await api.domains.getAllDomains();
    const subdomains = await api.domains.getAllSubdomains();
    
    console.log('📊 Domaines trouvés dans la base:', domains.map((d: any) => d.name));
    console.log('📊 Sous-domaines trouvés dans la base:', subdomains.map((sd: any) => sd.name));
    console.log('👤 Utilisateur:', userId);
    
    let totalTasksCreated = 0;
    
    // Pour chaque domaine dans la structure ABLLS
    for (const [domainName, domainData] of Object.entries(ABLLS_STRUCTURE)) {
      console.log(`\n📁 Traitement du domaine: ${domainName}`);
      
      // Trouver le domaine correspondant dans la base
      const domain = domains.find((d: any) => d.name === domainName);
      
      if (!domain) {
        console.warn(`⚠️ Domaine "${domainName}" non trouvé dans la base`);
        console.warn(`   Domaines disponibles:`, domains.map((d: any) => d.name));
        continue;
      }
      
      console.log(`✓ Domaine trouvé: ${domain.name} (ID: ${domain._id})`)
      
      // Pour chaque sous-domaine
      for (const subdomainData of domainData.subdomains) {
        const { prefix, name, taskCount } = subdomainData;
        
        console.log(`  📂 Sous-domaine: ${prefix} - ${name} (${taskCount} tâches)`);
        
        // Trouver le sous-domaine correspondant
        const subdomain = subdomains.find(
          (sd: any) => sd.domainId === domain._id && sd.name === name
        );
        
        if (!subdomain) {
          console.warn(`    ⚠️ Sous-domaine "${name}" non trouvé`);
          console.warn(`    Sous-domaines du domaine ${domain.name}:`, 
            subdomains.filter((sd: any) => sd.domainId === domain._id).map((sd: any) => sd.name)
          );
          continue;
        }
        
        console.log(`    ✓ Sous-domaine trouvé: ${subdomain.name} (ID: ${subdomain._id})`)
        
        // Créer les tâches pour ce sous-domaine
        for (let i = 1; i <= taskCount; i++) {
          const taskCode = `${prefix}${i}`;
          const taskTitle = `Tâche ${taskCode}`;
          
          try {
            // Utiliser la structure correcte pour createTask
            await api.tasks.createTask({
              title: taskTitle,
              videoUrl: '',
              description: `Tâche ${taskCode} du sous-domaine ${name}`,
              baseline: '',
              technicalDetails: '',
              subdomainId: subdomain._id,
              userId: userId
            });
            
            totalTasksCreated++;
            
            // Afficher la progression tous les 10 tâches
            if (i % 10 === 0) {
              console.log(`    ✓ ${i}/${taskCount} tâches créées`);
            }
          } catch (err) {
            console.error(`    ❌ Erreur lors de la création de ${taskCode}:`, err);
          }
        }
        
        console.log(`    ✅ ${taskCount} tâches créées pour ${prefix} - ${name}`);
      }
    }
    
    console.log(`\n🎉 Insertion terminée avec succès !`);
    console.log(`📊 Total: ${totalTasksCreated} tâches créées`);
    
    return {
      success: true,
      tasksCreated: totalTasksCreated
    };
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'insertion des tâches:', err);
    throw err;
  }
}
