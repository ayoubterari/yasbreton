import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL || "https://your-convex-url.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Structure des domaines et sous-domaines
const domainsData = [
  {
    name: "Compétences de base de l'apprenant",
    description: "Compétences fondamentales de communication et d'interaction",
    order: 1,
    subdomains: [
      { name: "Coopération et efficacité des agents renforçateurs", order: 1 },
      { name: "Performances visuelles", order: 2 },
      { name: "Appairage réceptif", order: 3 },
      { name: "Imitation", order: 4 },
      { name: "Langage vocale", order: 5 },
      { name: "Demandes", order: 6 },
      { name: "Dénomination", order: 7 },
      { name: "Intraverbal", order: 8 },
      { name: "Vocalisations spontanées", order: 9 },
      { name: "Syntaxe et grammaire", order: 10 },
      { name: "Jeu et comportements de jeu", order: 11 },
      { name: "Interactions sociales", order: 12 },
      { name: "Instruction en groupe", order: 13 },
      { name: "Suivre les routines de classe", order: 14 },
      { name: "Généralisation des réponses", order: 15 }
    ]
  },
  {
    name: "Compétences scolaires",
    description: "Compétences académiques et d'apprentissage",
    order: 2,
    subdomains: [
      { name: "Habiletés de lecture", order: 1 },
      { name: "Compétences mathématiques", order: 2 },
      { name: "Compétences d'écriture", order: 3 },
      { name: "Épeler", order: 4 }
    ]
  },
  {
    name: "Autonomie",
    description: "Compétences d'autonomie et de vie quotidienne",
    order: 3,
    subdomains: [
      { name: "Habillage", order: 1 },
      { name: "Alimentation", order: 2 },
      { name: "Toilette", order: 3 },
      { name: "Propreté", order: 4 }
    ]
  },
  {
    name: "Motricité",
    description: "Compétences motrices globales et fines",
    order: 4,
    subdomains: [
      { name: "Motricité globale", order: 1 },
      { name: "Motricité fine", order: 2 }
    ]
  }
];

async function insertDomainsAndSubdomains() {
  console.log("🚀 Début de l'insertion des domaines et sous-domaines...\n");

  try {
    for (const domainData of domainsData) {
      console.log(`📁 Création du domaine: ${domainData.name}`);
      
      // Créer le domaine
      const domain = await client.mutation("domains:create" as any, {
        name: domainData.name,
        description: domainData.description,
        order: domainData.order
      });

      console.log(`   ✅ Domaine créé avec l'ID: ${domain._id}`);
      console.log(`   📂 Création de ${domainData.subdomains.length} sous-domaines...\n`);

      // Créer les sous-domaines
      for (const subdomainData of domainData.subdomains) {
        const subdomain = await client.mutation("domains:createSubdomain" as any, {
          name: subdomainData.name,
          domainId: domain._id,
          order: subdomainData.order
        });

        console.log(`      ✓ ${subdomainData.name}`);
      }

      console.log(`   ✅ ${domainData.subdomains.length} sous-domaines créés\n`);
      console.log("─".repeat(80) + "\n");
    }

    console.log("✨ Tous les domaines et sous-domaines ont été créés avec succès!");
    console.log("\n📊 Résumé:");
    console.log(`   - ${domainsData.length} domaines créés`);
    console.log(`   - ${domainsData.reduce((acc, d) => acc + d.subdomains.length, 0)} sous-domaines créés`);

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
    throw error;
  }
}

// Exécuter le script
insertDomainsAndSubdomains()
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Le script a échoué:", error);
    process.exit(1);
  });
