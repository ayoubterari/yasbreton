import { api } from '../lib/convex-client';

// Structure des domaines et sous-domaines basée sur le VB-MAPP
const domainsData = [
  {
    name: "Compétences de base de l'apprenant",
    description: "Compétences fondamentales de communication et d'interaction",
    order: 1,
    subdomains: [
      "Coopération et efficacité des agents renforçateurs",
      "Performances visuelles",
      "Appairage réceptif",
      "Imitation",
      "Langage vocale",
      "Demandes",
      "Dénomination",
      "Intraverbal",
      "Vocalisations spontanées",
      "Syntaxe et grammaire",
      "Jeu et comportements de jeu",
      "Interactions sociales",
      "Instruction en groupe",
      "Suivre les routines de classe",
      "Généralisation des réponses"
    ]
  },
  {
    name: "Compétences scolaires",
    description: "Compétences académiques et d'apprentissage",
    order: 2,
    subdomains: [
      "Habiletés de lecture",
      "Compétences mathématiques",
      "Compétences d'écriture",
      "Épeler"
    ]
  },
  {
    name: "Autonomie",
    description: "Compétences d'autonomie et de vie quotidienne",
    order: 3,
    subdomains: [
      "Habillage",
      "Alimentation",
      "Toilette",
      "Propreté"
    ]
  },
  {
    name: "Motricité",
    description: "Compétences motrices globales et fines",
    order: 4,
    subdomains: [
      "Motricité globale",
      "Motricité fine"
    ]
  }
];

export async function insertDomainsAndSubdomains() {
  console.log("🚀 Début de l'insertion des domaines et sous-domaines...\n");

  const results = {
    domains: [] as any[],
    subdomains: [] as any[],
    errors: [] as string[]
  };

  try {
    for (const domainData of domainsData) {
      console.log(`📁 Création du domaine: ${domainData.name}`);
      
      try {
        // Créer le domaine
        const domainId = await api.domains.createDomain({
          name: domainData.name,
          description: domainData.description,
          order: domainData.order
        });
        
        const domain = { _id: domainId, ...domainData };

        results.domains.push(domain);
        console.log(`   ✅ Domaine créé avec l'ID: ${domain._id}`);
        console.log(`   📂 Création de ${domainData.subdomains.length} sous-domaines...\n`);

        // Créer les sous-domaines
        for (let i = 0; i < domainData.subdomains.length; i++) {
          const subdomainName = domainData.subdomains[i];
          
          try {
            const subdomainId = await api.domains.createSubdomain({
              name: subdomainName,
              domainId: domain._id,
              order: i + 1
            });
            
            const subdomain = { _id: subdomainId, name: subdomainName, domainId: domain._id, order: i + 1 };

            results.subdomains.push(subdomain);
            console.log(`      ✓ ${subdomainName}`);
          } catch (error: any) {
            const errorMsg = `Erreur lors de la création du sous-domaine "${subdomainName}": ${error.message}`;
            console.error(`      ✗ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }

        console.log(`   ✅ ${domainData.subdomains.length} sous-domaines créés\n`);
        console.log("─".repeat(80) + "\n");
      } catch (error: any) {
        const errorMsg = `Erreur lors de la création du domaine "${domainData.name}": ${error.message}`;
        console.error(`   ✗ ${errorMsg}\n`);
        results.errors.push(errorMsg);
      }
    }

    console.log("✨ Insertion terminée!\n");
    console.log("📊 Résumé:");
    console.log(`   - ${results.domains.length} domaines créés`);
    console.log(`   - ${results.subdomains.length} sous-domaines créés`);
    
    if (results.errors.length > 0) {
      console.log(`   - ${results.errors.length} erreurs rencontrées`);
    }

    return results;

  } catch (error) {
    console.error("❌ Erreur générale lors de l'insertion:", error);
    throw error;
  }
}

// Fonction pour obtenir un résumé des données à insérer
export function getDomainsDataSummary() {
  return {
    totalDomains: domainsData.length,
    totalSubdomains: domainsData.reduce((acc, d) => acc + d.subdomains.length, 0),
    domains: domainsData.map(d => ({
      name: d.name,
      subdomainsCount: d.subdomains.length
    }))
  };
}
