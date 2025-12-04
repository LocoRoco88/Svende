
import { LeanQuestion } from './types';

export const leanQuestions: LeanQuestion[] = [
  // --- 5S ---
  {
    id: 1,
    question: "Hvad står det første 'S' for i 5S-modellen?",
    options: ["Systematisere", "Sortere", "Standardisere", "Selvdisciplin"],
    correctIndex: 1
  },
  {
    id: 2,
    question: "Hvad er formålet med 2. S (Systematisere/Sæt i orden)?",
    options: ["At gøre rent", "En plads til alt, og alt på sin plads", "At smide ting ud", "At lave en audit"],
    correctIndex: 1
  },
  {
    id: 3,
    question: "Hvad er det 5. S, som anses for det sværeste?",
    options: ["Selvdisciplin (Fastholdelse)", "Sortering", "Standardisering", "Systematik"],
    correctIndex: 0
  },
  {
    id: 4,
    question: "Hvad bruger man ofte til 4. S (Standardisering)?",
    options: ["Mundtlige aftaler", "Visuelle hjælpemidler, opmærkning og skyggetavler", "En notesbog", "Gætterier"],
    correctIndex: 1
  },
  
  // --- SPILD (TIM WOODS) ---
  {
    id: 5,
    question: "Hvad står akronymet 'TIM WOODS' for?",
    options: ["En berømt Lean-guru", "De 8 spildtyper", "En type træsort", "Navnet på fabrikken"],
    correctIndex: 1
  },
  {
    id: 6,
    question: "Hvilken spildtype er 'Transport'?",
    options: ["At flytte varer unødvendigt rundt", "At køre hjem fra arbejde", "At sende en email", "At varen transporteres til kunden"],
    correctIndex: 0
  },
  {
    id: 7,
    question: "Hvad er spildtypen 'Inventory' (Lager)?",
    options: ["At have tomme hylder", "At have flere varer/råvarer end nødvendigt", "At tælle varelageret", "At organisere lageret"],
    correctIndex: 1
  },
  {
    id: 8,
    question: "Hvad er spildtypen 'Motion' (Bevægelse)?",
    options: ["At trucken kører", "Unødvendige menneskelige bevægelser (bukke, strække, lede)", "At maskinen bevæger sig", "At dyrke motion i pausen"],
    correctIndex: 1
  },
  {
    id: 9,
    question: "Hvad er spildtypen 'Waiting' (Ventetid)?",
    options: ["At vente på materialer eller information", "At vente på bussen", "At holde pause", "At vente på fyraften"],
    correctIndex: 0
  },
  {
    id: 10,
    question: "Hvad er spildtypen 'Overproduction'?",
    options: ["At producere i høj kvalitet", "At producere mere eller før kunden har bestilt", "At producere om natten", "At producere nye opfindelser"],
    correctIndex: 1
  },
  {
    id: 11,
    question: "Hvad er spildtypen 'Over-processing' (Overforædling)?",
    options: ["At lave produktet for hurtigt", "At gøre mere ved produktet end kunden betaler for", "At pakke produktet ind", "At teste produktet"],
    correctIndex: 1
  },
  {
    id: 12,
    question: "Hvad er spildtypen 'Defects' (Fejl)?",
    options: ["At maskinen mangler olie", "Produkter der skal kasseres eller omarbejdes", "At medarbejderen kommer for sent", "At lyset blinker"],
    correctIndex: 1
  },
  {
    id: 13,
    question: "Hvad er den 8. spildtype (S'et i WOODS)?",
    options: ["Skills (Uudnyttet viden/talent)", "Sikkerhed", "Systemfejl", "Snavs"],
    correctIndex: 0
  },

  // --- SMED ---
  {
    id: 14,
    question: "Hvad står SMED for?",
    options: ["Single Minute Exchange of Die", "Standard Machine Engineering Design", "Safe Mode Emergency Drill", "Super Machine Efficiency Data"],
    correctIndex: 0
  },
  {
    id: 15,
    question: "Hvad er målet med SMED?",
    options: ["At køre maskinen langsommere", "At reducere omstillingstiden (helst under 10 min)", "At ansætte flere folk", "At købe nye maskiner"],
    correctIndex: 1
  },
  {
    id: 16,
    question: "Hvad er 'Ydre tid' i SMED?",
    options: ["Tid brugt udenfor fabrikken", "Opgaver der kan gøres mens maskinen kører", "Tid brugt på pauser", "Tid brugt på rengøring"],
    correctIndex: 1
  },
  {
    id: 17,
    question: "Hvad er 'Indre tid' i SMED?",
    options: ["Opgaver der KUN kan gøres når maskinen står stille", "Tid brugt på at tænke", "Tid inde i maskinen", "Tid brugt på møder"],
    correctIndex: 0
  },

  // --- KAIZEN & PDCA ---
  {
    id: 18,
    question: "Hvad betyder det japanske ord 'Kaizen'?",
    options: ["Stor chef", "Løbende forbedringer (Change for good)", "Hurtig produktion", "Japansk mad"],
    correctIndex: 1
  },
  {
    id: 19,
    question: "Hvad står PDCA for?",
    options: ["Please Do Check All", "Plan, Do, Check, Act", "Product Design Cost Analysis", "Process Data Control Audit"],
    correctIndex: 1
  },
  {
    id: 20,
    question: "I PDCA-hjulet, hvad sker der i 'Act' fasen?",
    options: ["Man spiller skuespil", "Man fastholder/standardiserer løsningen", "Man planlægger", "Man udfører testen"],
    correctIndex: 1
  },

  // --- OEE & Nøgletal ---
  {
    id: 21,
    question: "Hvad måler OEE (Overall Equipment Efficiency)?",
    options: ["Hvor meget strøm maskinen bruger", "Maskinens effektivitet (Tilgængelighed x Præstation x Kvalitet)", "Hvor mange medarbejdere der er på job", "Hvor gammel maskinen er"],
    correctIndex: 1
  },
  {
    id: 22,
    question: "Hvad er en KPI?",
    options: ["Key Performance Indicator (Nøgletal)", "Kanban Process Instruction", "Kaizen Point Index", "Key Person Involved"],
    correctIndex: 0
  },

  // --- Generel Lean ---
  {
    id: 23,
    question: "Hvad er 'Just-in-Time' (JIT)?",
    options: ["At komme for sent", "At producere og levere præcis det nødvendige, når det er nødvendigt", "At producere til lager", "At arbejde hurtigt"],
    correctIndex: 1
  },
  {
    id: 24,
    question: "Hvad betyder 'Poka-Yoke'?",
    options: ["Japansk dans", "Fejlsikring (Mistake-proofing)", "En type fisk", "Hurtigt skift"],
    correctIndex: 1
  },
  {
    id: 25,
    question: "Hvad er 'Gemba'?",
    options: ["Køkkenet", "Det sted hvor værdien skabes (Gerningsstedet)", "Chefens kontor", "Mødelokalet"],
    correctIndex: 1
  },
  {
    id: 26,
    question: "Hvad er 'Andon'?",
    options: ["En lampe/signal der viser status eller fejl", "En formand", "En type værktøj", "En pause"],
    correctIndex: 0
  },
  {
    id: 27,
    question: "Hvad er 'Heijunka'?",
    options: ["Produktionsudjævning", "En japansk hilsen", "Hurtig omstilling", "Fejlsøgning"],
    correctIndex: 0
  },
  {
    id: 28,
    question: "Hvad er 'Mura'?",
    options: ["Spild", "Ujævnhed / Variation i processen", "Overbelastning", "Rengøring"],
    correctIndex: 1
  },
  {
    id: 29,
    question: "Hvad er 'Muri'?",
    options: ["Spild", "Ujævnhed", "Overbelastning (af mennesker eller maskiner)", "Sortering"],
    correctIndex: 2
  },
  {
    id: 30,
    question: "Hvad er 'Takt-tid'?",
    options: ["Musikkens hastighed", "Den hastighed kunden efterspørger varer med", "Hvor hurtigt vi kan løbe", "Tiden mellem pauser"],
    correctIndex: 1
  },
  {
    id: 31,
    question: "Hvad er en VSM (Value Stream Mapping)?",
    options: ["En tegning af fabrikken", "Kortlægning af værdistrømmen (Materiale- og informationsflow)", "Vurdering af Sommerevents", "Video Stream Media"],
    correctIndex: 1
  },
  {
    id: 32,
    question: "Hvad er 'Den skjulte fabrik'?",
    options: ["En hemmelig bygning", "Det arbejde der bruges på at rette fejl og omarbejde", "Natholdet", "Kælderen"],
    correctIndex: 1
  },
  {
    id: 33,
    question: "Hvad er et Spaghettidiagram?",
    options: ["En ret i kantinen", "En tegning af bevægelsesmønstre for at synliggøre transport", "Et diagram over kabler", "En fejlrapport"],
    correctIndex: 1
  },
  {
    id: 34,
    question: "Hvad er Pareto-analysen også kendt som?",
    options: ["50/50 reglen", "80/20 reglen (20% af årsagerne skaber 80% af problemerne)", "10/90 reglen", "33% reglen"],
    correctIndex: 1
  }
];
