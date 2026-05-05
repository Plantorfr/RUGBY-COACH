export interface Competence {
  id: string
  name: string
  category: 'Attaque' | 'Défense' | 'Jeu groupé' | 'Physique' | 'Mental'
  icon: string
  description: string
  erreurs: string[]
  exercices: { titre: string; description: string; duree?: string }[]
  conseil_coach: string
  imageUrl: string
}

export const COMPETENCES: Competence[] = [
  {
    id: 'porteur_balle',
    name: 'Porteur de balle',
    category: 'Attaque',
    icon: 'ri-football-line',
    description: "Le porteur de balle est le moteur offensif de l'équipe. Sa capacité à franchir les lignes défensives, à fixer les défenseurs et à créer des décalages détermine directement la capacité offensive de l'équipe. Un bon porteur sait lire la défense en une fraction de seconde pour choisir entre contact, crochet ou passe.",
    erreurs: [
      "Courir la tête baissée sans lire la défense devant soi",
      "Entrer dans le contact trop haut, exposant le ballon",
      "Ne pas utiliser ses appuis pour déséquilibrer le défenseur",
      "Porter seul au lieu de jouer l'option collective lorsqu'elle est disponible"
    ],
    exercices: [
      { titre: "Exercice de course avec haies basses", description: "Le joueur court en dribblant avec des haies basses pour développer sa vision haute et ses appuis.", duree: "15 min" },
      { titre: "1 contre 1 en couloir étroit", description: "Couloir de 3m de large, le porteur doit franchir le défenseur avec crochet, passage en force ou en vitesse.", duree: "20 min" },
      { titre: "Grid contact dirigé", description: "En carré de 10m, le porteur identifie la zone de débordement et doit franchir avec appuis bas, ballon protégé.", duree: "15 min" },
      { titre: "Décision porte/passe", description: "Exercice de choix : 2 défenseurs se déplacent, le porteur doit décider en temps réel entre franchissement et passe.", duree: "20 min" },
      { titre: "Course avec résistance", description: "Le porteur court avec un élastique de résistance, renforçant la puissance des appuis et la stabilité en contact.", duree: "10 min" }
    ],
    conseil_coach: "Insistez sur la posture avant le contact : hanche basse, épaule vers l'avant, ballon contre la hanche opposée au défenseur. Cette seule correction améliore immédiatement le franchissement.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'passes',
    name: 'Passes',
    category: 'Attaque',
    icon: 'ri-send-plane-line',
    description: "La qualité des passes est le fondement du jeu collectif en rugby. Une bonne passe doit être précise, rapide et délivrée au bon moment pour mettre le receveur en position de course. La maîtrise de la passe longue, courte, rasante et de la passe au pied permet d'exploiter tous les espaces défensifs.",
    erreurs: [
      "Passer en retard, une fois le défenseur déjà sur le receveur",
      "Passe trop lente ou lobée qui permet à la défense de récupérer",
      "Ne pas regarder la cible avant de passer (passe aveugle)",
      "Mauvaise orientation des épaules qui télégraphie la passe"
    ],
    exercices: [
      { titre: "Passes en triangle à 3 joueurs", description: "3 joueurs forment un triangle, passes rapides en mouvement. Objectif : 0 faute sur 50 passes.", duree: "10 min" },
      { titre: "Passes longues en mouvement", description: "En ligne de 4, passes longues cote à cote à 8m d'écart, en avançant le long du terrain.", duree: "15 min" },
      { titre: "Passe rasante à genou", description: "En travaillant à partir du genou, le joueur développe la rotation des hanches et la vitesse de bras.", duree: "10 min" },
      { titre: "Passes sous pression défensive", description: "Passeur doit délivrer une passe précise avec un défenseur qui rush sur lui, obligeant la décision rapide.", duree: "20 min" },
      { titre: "Pop pass et passe de service", description: "Enchaînement pop pass en ruck suivi d'une passe longue : les deux joueurs répètent la séquence.", duree: "15 min" }
    ],
    conseil_coach: "La passe parfaite commence bien avant le contact avec le ballon. Exigez que vos joueurs regardent systématiquement le receveur AVANT de recevoir le ballon — cela double la vitesse de passe perçue par la défense.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'soutien',
    name: 'Soutien',
    category: 'Attaque',
    icon: 'ri-team-line',
    description: "Le soutien au porteur de balle est une discipline collective qui demande une lecture permanente du jeu et une capacité à se repositionner en courbe de course optimale. Un joueur de soutien efficace arrive en appui à la bonne profondeur, à la bonne vitesse, pour offrir une option de continuité ou de décharge immédiate après contact.",
    erreurs: [
      "Arriver dans le dos du porteur au lieu de le doubler sur les côtés",
      "Soutien trop éloigné qui oblige le porteur à attendre et perdre de l'élan",
      "Rester passif après avoir donné la balle — ne pas continuer la course",
      "Soutien plat qui amène le joueur dans la ligne défensive"
    ],
    exercices: [
      { titre: "2 contre 1 en progression", description: "Deux attaquants contre un défenseur : obligation de jouer la continuité après premier contact.", duree: "15 min" },
      { titre: "Exercice de courbe de course", description: "Plots disposés en arc : le joueur de soutien doit arriver dans le bon couloir, en profondeur.", duree: "10 min" },
      { titre: "Ruck et soutien immédiat", description: "Sur contact volontaire, le soutien doit être là avant que le défenseur ne récupère sa position.", duree: "20 min" },
      { titre: "3 contre 2 décision collective", description: "Obligation de jouer 2 passes avant de marquer, pour que le soutien soit une habitude systématique.", duree: "20 min" }
    ],
    conseil_coach: "Apprenez à vos joueurs la règle des 'coureurs fantômes' : même si le porteur ne passe pas, le soutien doit courir comme si la passe allait venir. C'est ce mouvement qui ouvre les espaces.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'jeu_au_pied',
    name: 'Jeu au pied',
    category: 'Attaque',
    icon: 'ri-arrow-up-circle-line',
    description: "Le jeu au pied est une arme tactique majeure permettant de changer le point d'impact, de mettre la défense sous pression et de regagner du terrain. La variété du jeu au pied (coup de pied rasant, chandelle, coup de pied en profondeur, chip kick) confère à une équipe une dimension tactique supplémentaire qui oblige l'adversaire à adapter constamment sa défense.",
    erreurs: [
      "Frapper trop tard, sous la pression défensive qui rend le coup de pied imprécis",
      "Utiliser toujours le même type de coup de pied, devenu prévisible",
      "Négliger le replacement après le coup de pied (pas de chasing)",
      "Mauvais choix de zone : frapper vers les points forts adverses"
    ],
    exercices: [
      { titre: "Frappes de précision sur cibles", description: "Zones marquées au sol ou panneaux : le joueur doit atteindre chaque zone cible avec différents types de coups de pied.", duree: "15 min" },
      { titre: "Chandelle et chasing", description: "Par deux : un joue la chandelle, l'autre lâche le ballon au bon moment pour simuler la course adverse.", duree: "15 min" },
      { titre: "Chip & chase en couloir", description: "Le joueur chip-kick par-dessus un défenseur et doit récupérer son propre ballon.", duree: "20 min" },
      { titre: "Jeu au pied de dégagement sous pression", description: "Le demi de mêlée simule une situation de pression, l'ouvreur doit dégager proprement.", duree: "15 min" },
      { titre: "Garryowen collectif", description: "L'équipe travaille le coup de pied haut + montée collective pour contester au sol.", duree: "20 min" }
    ],
    conseil_coach: "Le meilleur coup de pied est celui dont la défense ne sait pas s'il va venir. Variez systématiquement : après 3 phases de jeu main en main, une option pied doit toujours être dans la tête du porteur.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'prise_espace',
    name: "Prise d'espace",
    category: 'Attaque',
    icon: 'ri-route-line',
    description: "La prise d'espace est la capacité d'un joueur à identifier et exploiter les espaces libres dans la défense adverse avant et pendant l'action. Elle repose sur une lecture permanente des lignes défensives, une course intelligente et une coordination avec ses partenaires pour créer et exploiter les surnombres.",
    erreurs: [
      "Courir dans les espaces occupés par les défenseurs au lieu des zones libres",
      "Ligne de course trop prévisible et rectiligne sans fixer de défenseur",
      "Ignorer le décalage créé par les partenaires sur l'autre côté",
      "Prendre l'espace trop tôt avant que le timing collectif soit bon"
    ],
    exercices: [
      { titre: "Jeu d'espace 3 contre 3 sur demi-terrain", description: "Les attaquants doivent marquer uniquement dans les couloirs identifiés comme libres avant l'action.", duree: "20 min" },
      { titre: "Shadow running", description: "Sans ballon, les attaquants suivent les déplacements d'un leader et s'espacent collectivement.", duree: "10 min" },
      { titre: "Blind side exploitation", description: "Exercice spécifique sur l'exploitation du côté fermé après ruck proche de la touche.", duree: "15 min" },
      { titre: "Simulation de ligne défensive", description: "5 défenseurs passifs qui se déplacent : les attaquants doivent identifier et exploiter les trous.", duree: "20 min" }
    ],
    conseil_coach: "La prise d'espace se travaille autant sur tableau blanc que sur le terrain. Analysez en vidéo les séquences où votre équipe rate des espaces évidents : la compréhension cognitive précède toujours l'automatisme physique.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'plaquage',
    name: 'Plaquage',
    category: 'Défense',
    icon: 'ri-shield-cross-line',
    description: "Le plaquage est la compétence défensive fondamentale du rugby. Un plaquage technique, bas et sûr stoppe l'avancée adverse, préserve le plaqueur et permet à l'équipe de récupérer rapidement sa ligne défensive. La maîtrise du plaquage frontal, latéral et en couverture est indispensable à tous les postes.",
    erreurs: [
      "Plaquer haut, au niveau du torse ou des bras, permettant au porteur de continuer",
      "Ne pas accélérer les derniers mètres avant le contact, perdant en puissance",
      "Fermer les yeux au moment du contact — réflexe d'évitement qui coûte cher",
      "Lâcher le plaquage trop tôt, permettant au porteur de se libérer"
    ],
    exercices: [
      { titre: "Plaquage sur mannequin technique", description: "Travail de la technique pure : approche, flexion, épaule dans les hanches, rotation pour coucher le mannequin.", duree: "15 min" },
      { titre: "Plaquage en couloir étroit", description: "Le plaqueur n'a pas d'échappatoire — il doit s'engager pleinement dans le contact.", duree: "15 min" },
      { titre: "1 contre 1 défensif en mouvement", description: "Le défenseur sort d'un cône et plaque un attaquant qui arrive en diagonale.", duree: "20 min" },
      { titre: "Plaquage double (tandem)", description: "Deux défenseurs coordonnent leur plaquage pour stopper un porteur puissant.", duree: "15 min" },
      { titre: "Récupération après plaquage", description: "Après le plaquage, le joueur doit se relever rapidement et rejoindre la ligne défensive.", duree: "15 min" }
    ],
    conseil_coach: "La règle d'or du plaquage : 'Joue avec tes yeux ouverts sur la ceinture du porteur.' Le regard sur la hanche force naturellement la posture basse et évite les plaquages hauts.",
    imageUrl: "https://images.unsplash.com/photo-1544931170-dbc9d1b4add5?w=800"
  },
  {
    id: 'ligne_defensive',
    name: 'Ligne défensive',
    category: 'Défense',
    icon: 'ri-shield-line',
    description: "La ligne défensive est l'organisation collective qui permet à l'équipe de défendre en unité, en avançant ensemble pour réduire le temps de décision adverse. Une ligne défensive bien organisée avance au sifflet, monte flat et communique en permanence pour fermer les espaces entre les défenseurs.",
    erreurs: [
      "Ligne défensive en escalier, laissant des espaces exploitables entre les joueurs",
      "Certains défenseurs montent trop vite et se retrouvent hors de la ligne",
      "Manque de communication — les joueurs ne savent pas qui prend qui",
      "Ligne qui recule au lieu d'avancer, perdant l'initiative"
    ],
    exercices: [
      { titre: "Montée défensive au sifflet", description: "Sur signal, toute la ligne défensive avance simultanément jusqu'à une ligne de cône.", duree: "10 min" },
      { titre: "Défense en chiffres égaux", description: "5 contre 5, les défenseurs doivent maintenir l'alignement en avançant et en plaquant.", duree: "25 min" },
      { titre: "Drift défensif", description: "La ligne dérifte latéralement en suivant le porteur du ballon tout en maintenant l'alignement.", duree: "15 min" },
      { titre: "Communication défensive", description: "Chaque défenseur annonce à voix haute son attaquant avant la passe adverse.", duree: "15 min" }
    ],
    conseil_coach: "Une ligne défensive efficace se joue à la communication. Imposez une règle simple : chaque joueur doit dire le prénom ou le numéro de son attaquant avant chaque action défensive. En 3 semaines, le niveau collectif change radicalement.",
    imageUrl: "https://images.unsplash.com/photo-1544931170-dbc9d1b4add5?w=800"
  },
  {
    id: 'couverture',
    name: 'Couverture',
    category: 'Défense',
    icon: 'ri-radar-line',
    description: "La couverture défensive est la capacité d'un joueur à se positionner en sécurité derrière la ligne défensive principale pour contenir les percées adverses, couvrir les espaces profonds et servir de dernier rempart avant la ligne d'essai. Elle demande une excellente lecture du jeu et une positionnement anticipatif constant.",
    erreurs: [
      "Monter trop tôt pour plaquer, abandonnant son rôle de couverture arrière",
      "Mauvais angle de couverture qui ne protège pas la bonne zone",
      "Communiquer insuffisamment avec la ligne avancée sur ce qu'il voit",
      "Se laisser fixer par un attaquant et rater la vraie menace"
    ],
    exercices: [
      { titre: "Positionnement de l'arrière", description: "L'arrière apprend à se positionner à la bonne profondeur selon la zone du jeu.", duree: "15 min" },
      { titre: "Couverture latérale en grille", description: "Deux défenseurs : l'un avance pour plaquer, l'autre couvre en diagonale vers l'intérieur.", duree: "20 min" },
      { titre: "Simulation de percée", description: "Un attaquant rapide perfore la première ligne : le couvreur doit plaquer dans les 10m.", duree: "15 min" },
      { titre: "Jeu à la chandelle", description: "Travail de la position sous chandelle : couverture de zone et main sûre.", duree: "10 min" }
    ],
    conseil_coach: "Le meilleur couvreur est celui qui n'a jamais à plaquer parce que sa position dissuade l'attaquant. Apprenez à vos arrières à être menaçants par leur simple positionnement.",
    imageUrl: "https://images.unsplash.com/photo-1544931170-dbc9d1b4add5?w=800"
  },
  {
    id: 'impact_contact',
    name: 'Impact au contact',
    category: 'Défense',
    icon: 'ri-boxing-line',
    description: "L'impact au contact est la capacité d'un joueur défenseur à imposer sa puissance physique lors du choc avec l'attaquant, pour stopper l'élan adverse, récupérer le ballon ou repousser le porteur derrière la ligne de gain. C'est une compétence qui combine technique de plaquage, puissance et agressivité contrôlée.",
    erreurs: [
      "Contact trop passif, laissant le porteur continuer son élan après l'impact",
      "Mauvaise posture avant le contact : trop droit, perdant en levier",
      "Lâcher la poussée trop tôt au lieu de continuer à pousser jusqu'au sol",
      "S'engager dans le contact sans awareness de la position du ballon"
    ],
    exercices: [
      { titre: "Plaquage avec poussée sur mannequin lourd", description: "Exercice de puissance : plaquer le mannequin et le pousser sur 3m.", duree: "15 min" },
      { titre: "Corps à corps en cercle", description: "Par paires, chaque joueur essaie de déséquilibrer l'autre avec les épaules seulement.", duree: "10 min" },
      { titre: "Choc défensif sur porteur puissant", description: "Progression technique : approche basse, impact épaule, extension des jambes.", duree: "20 min" },
      { titre: "Turnovers drill", description: "Après l'impact au sol, travail pour se retourner sur le ballon et récupérer.", duree: "15 min" }
    ],
    conseil_coach: "La puissance d'impact se construit dans la salle de musculation mais s'exprime dans la technique. Un joueur de 80kg bien positionné peut stopper un porteur de 110kg. La clé est dans les appuis au moment du choc.",
    imageUrl: "https://images.unsplash.com/photo-1544931170-dbc9d1b4add5?w=800"
  },
  {
    id: 'melee',
    name: 'Mêlée',
    category: 'Jeu groupé',
    icon: 'ri-group-2-line',
    description: "La mêlée est l'une des phases techniques les plus complexes du rugby, engageant les 8 avants de chaque équipe dans un combat collectif de puissance et de technique. Une mêlée dominante permet de récupérer le ballon proprement, de gagner des pénalités et d'user physiquement l'équipe adverse tout en valorisant les qualités individuelles de chaque avant.",
    erreurs: [
      "Lier sans enfoncer les hanches, perdant immédiatement en puissance collective",
      "Pilier qui bascule vers l'intérieur, cassant le binding du pack",
      "Manque de timing dans la poussée collective : ne pas pousser au même moment",
      "Demi de mêlée qui n'utilise pas la pression mêlée pour varier le jeu"
    ],
    exercices: [
      { titre: "Mêlée par blocs", description: "Travail d'abord 3 contre 3 (première ligne) puis progressivement 8 contre 8.", duree: "20 min" },
      { titre: "Binding technique", description: "Chaque pilier travaille son binding spécifique avec l'éducateur corrigeant la position.", duree: "15 min" },
      { titre: "Push sur sled (traîneau)", description: "Travail de puissance collective sur traîneau de mêlée : poussée de 10m × 5 séries.", duree: "15 min" },
      { titre: "Timing de poussée", description: "Sur signal du talonneur, toute la mêlée pousse simultanément : travail du timing collectif.", duree: "10 min" },
      { titre: "Mêlée en situation de match", description: "Mêlées sur 5m de la ligne d'essai adverse et défensive : pression maximale.", duree: "20 min" }
    ],
    conseil_coach: "Une mêlée solide commence par les piliers. Si les piliers sont bien positionnés, les deuxième ligne peuvent pousser dans l'axe. Passez 30% du temps de mêlée sur le travail individuel des piliers.",
    imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800"
  },
  {
    id: 'touche',
    name: 'Touche',
    category: 'Jeu groupé',
    icon: 'ri-arrow-up-line',
    description: "La touche est une phase de possession précieuse qui, bien maîtrisée, offre un ballon propre et une plateforme d'attaque organisée. La qualité du saut, du lancer et du soutien détermine le taux de possession sur cette phase. Une équipe dominant ses touches gagne en moyenne 10 à 15% de possession supplémentaire.",
    erreurs: [
      "Annonce de la ligne trop tard, laissant la défense anticiper",
      "Sauteur qui n'exploite pas la fenêtre de saut optimale",
      "Lancer imprécis, trop court, trop long ou mal orienté",
      "Pas de décision d'après-touche préparée : les joueurs attendent au lieu d'agir"
    ],
    exercices: [
      { titre: "Lancers sur cibles suspendues", description: "L'ailier talonneur vise des cibles à différentes hauteurs pour améliorer la précision.", duree: "15 min" },
      { titre: "Touche à 2 (sauteur + soutiens)", description: "Travail des soutiens sur le timing du lancer et la réception haute.", duree: "20 min" },
      { titre: "Variation des lignes de touche", description: "Enchaînement de 3 lignes différentes sur signal du capitaine.", duree: "15 min" },
      { titre: "Touche défensive", description: "Travail sur le blocage du saut adverse et la récupération de touche mal ajustée.", duree: "15 min" },
      { titre: "Enchaînement touche-ruck-jeu", description: "De la touche gagnée, les avants créent le mouvement immédiat pendant que les 3/4 se placent.", duree: "20 min" }
    ],
    conseil_coach: "Préparez au minimum 4 lignes codées avec différents points de saut. La surprise est votre meilleure alliée : même une ligne simple surprend si elle est bien codée et lancée à la perfection.",
    imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800"
  },
  {
    id: 'ruck_maul',
    name: 'Ruck / Maul',
    category: 'Jeu groupé',
    icon: 'ri-stack-line',
    description: "Le ruck et le maul sont les phases de continuité fondamentales du rugby moderne. La maîtrise du ruck — nettoyer rapidement, sécuriser le ballon — détermine la vitesse de recyclage et donc la pression sur la défense. Le maul, quant à lui, est un outil de progression territorial puissant proche des lignes de but.",
    erreurs: [
      "Entrer dans le ruck sans lier, ce qui est une faute et ne sécurise pas le ballon",
      "Se mettre à genoux dans le ruck, bloquant la vue du demi et le dégagement",
      "Maul qui s'arrête parce que les joueurs ne poussent pas dans l'axe",
      "Trop de joueurs au ruck, laissant l'équipe à court d'effectif en défense"
    ],
    exercices: [
      { titre: "Gate drill", description: "Le premier soutien doit entrer dans le ruck dans l'axe exact (la porte), puis le second.", duree: "15 min" },
      { titre: "Nettoyage de ruck 2v2", description: "Deux défenseurs sur le porteur au sol, deux attaquants doivent nettoyer proprement.", duree: "20 min" },
      { titre: "Maul de progression", description: "De la touche, le maul doit progresser sur 10m avec une poussée coordonnée.", duree: "15 min" },
      { titre: "Vitesse de recyclage", description: "Mesure du temps entre contact au sol et passe du demi de mêlée : objectif < 3 secondes.", duree: "15 min" },
      { titre: "Décision maul ou ruck", description: "Selon la position du porteur au contact, les avants décident maul ou ruck en temps réel.", duree: "20 min" }
    ],
    conseil_coach: "La règle des 2 avants : les 2 premiers arrivés au ruck suffisent dans 80% des cas. Entraînez vos joueurs à évaluer si le ballon est sécurisé AVANT d'entrer, et à rester debout s'il l'est déjà.",
    imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800"
  },
  {
    id: 'coup_envoi',
    name: "Coup d'envoi",
    category: 'Jeu groupé',
    icon: 'ri-arrow-up-fill',
    description: "Le coup d'envoi est un moment stratégique souvent sous-estimé qui peut instantanément donner l'initiative à l'équipe qui l'exécute. Un coup d'envoi bien préparé — précis dans sa zone de chute, coordonné avec la montée des coéquipiers — crée une pression immédiate et peut générer la récupération du ballon dès les premières secondes.",
    erreurs: [
      "Coup d'envoi trop court qui tombe dans les 10m (faute de coup de pied)",
      "Montée des joueurs pas synchronisée avec la hauteur du coup de pied",
      "Toujours frapper au même endroit, permettant à l'adversaire de s'organiser",
      "Manque de compétiteurs au sol après la chute du ballon"
    ],
    exercices: [
      { titre: "Coups d'envoi de précision", description: "Le frappeur travaille différentes zones cibles : coin gauche, coin droit, centre profond.", duree: "15 min" },
      { titre: "Montée coordonnée", description: "6 joueurs pratiquent la montée en ligne synchronisée, en simulant la hauteur du coup de pied.", duree: "10 min" },
      { titre: "Récupération sous coup d'envoi", description: "L'équipe qui reçoit travaille la sécurisation du ballon sous pression physique.", duree: "15 min" },
      { titre: "Coup d'envoi contesté", description: "Situation de match : coup d'envoi + montée + contestation au sol ou dans les airs.", duree: "20 min" }
    ],
    conseil_coach: "Un coup d'envoi réussi, c'est 6 joueurs en course avant que le ballon ne retombe. Filmez vos coups d'envoi et mesurez le nombre de joueurs dans les 5m du ballon à l'atterrissage. Ce chiffre doit être supérieur à 4.",
    imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800"
  },
  {
    id: 'vitesse',
    name: 'Vitesse',
    category: 'Physique',
    icon: 'ri-flashlight-line',
    description: "La vitesse en rugby recouvre la vitesse de réaction, la vitesse de course pure et la vitesse de décision. Si la vitesse pure est en grande partie génétique, la vitesse de départ, la technique de sprint et la vitesse d'accélération sont largement améliorables par l'entraînement spécifique. Un joueur rapide crée des problèmes insolubles pour n'importe quelle défense.",
    erreurs: [
      "Phase de départ trop haute, perdant les premiers mètres décisifs",
      "Bras qui croisent la ligne médiane du corps, perturbant la mécanique de course",
      "Foulée trop grande (overstriding) qui ralentit la course et cause des blessures",
      "Manque de travail sur l'accélération sur les 10 premiers mètres, les plus importants"
    ],
    exercices: [
      { titre: "Départs explosifs depuis position basse", description: "Départs depuis position de plaquage, 4 points, debout : variez la position de départ.", duree: "15 min" },
      { titre: "Sprints résistés + libérés", description: "5m avec élastique puis libération : l'accélération post-résistance développe l'explosivité.", duree: "15 min" },
      { titre: "Navettes sur 5-10-15m", description: "Mesure et amélioration de la vitesse sur les distances spécifiques du rugby.", duree: "15 min" },
      { titre: "Montées de genoux technique", description: "Travail de la technique de course : montées de genoux, griffé, course technique.", duree: "10 min" },
      { titre: "Sprints avec changement de direction", description: "Sprint 10m, changement de direction au plot, sprint retour : explosivité + agilité.", duree: "15 min" }
    ],
    conseil_coach: "En rugby, 95% des sprints font moins de 20m. Concentrez vos séances vitesse sur les 0-15m : départ explosif et première accélération. C'est là que se joue la différence sur le terrain.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
  },
  {
    id: 'endurance',
    name: 'Endurance',
    category: 'Physique',
    icon: 'ri-heart-pulse-line',
    description: "L'endurance en rugby est une endurance spécifique — intermittente et de haute intensité — qui diffère fondamentalement du jogging en continu. Un rugbyman doit être capable de répéter des efforts explosifs tout au long d'un match de 80 minutes, avec une récupération incomplète entre les actions. La capacité à maintenir les qualités techniques en fin de match est l'indicateur ultime de l'endurance spécifique.",
    erreurs: [
      "Trop d'entraînement en endurance continue au détriment de l'intermittent spécifique",
      "Négliger la récupération active après les séances d'intensité",
      "Ne pas simuler la fatigue de fin de match dans les exercices techniques",
      "Sous-estimer l'importance de l'hydratation et de la nutrition sur la performance"
    ],
    exercices: [
      { titre: "Yo-Yo Test niveau 1", description: "Test d'évaluation intermittent : permet de mesurer et suivre la progression.", duree: "20 min" },
      { titre: "Répétition de sprints", description: "8 × 30m avec 30s de récupération : travaille la capacité à répéter les efforts.", duree: "20 min" },
      { titre: "Circuit rugby conditioning", description: "5 stations (contact, sprint, ruck, passe, sprint retour) enchaînées sur 4 minutes.", duree: "25 min" },
      { titre: "Jeu à effectif réduit (small-sided games)", description: "4 contre 4 sur terrain réduit avec 5 minutes de jeu intense : endurance + technique.", duree: "25 min" },
      { titre: "Gestion d'allure sur match entier", description: "Simulation de match complet avec mesure de la dégradation de la performance.", duree: "80 min" }
    ],
    conseil_coach: "Un joueur qui maintient 90% de sa vitesse de plaquage en 70e minute vaut plus qu'un joueur explosif qui s'effondre après 50 minutes. Intégrez toujours des exercices techniques EN FATIGUE à la fin des séances.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"
  },
  {
    id: 'puissance',
    name: 'Puissance',
    category: 'Physique',
    icon: 'ri-sword-line',
    description: "La puissance est la combinaison de la force et de la vitesse : c'est l'énergie explosive qui permet d'imposer sa domination au contact, de propulser dans les mêlées et de repousser les adversaires. En rugby, la puissance fonctionnelle — applicable dans les positions de jeu réelles — prime sur la force brute mesurée en salle.",
    erreurs: [
      "Développer la force pure sans la convertir en puissance explosive sur le terrain",
      "Négliger le travail des jambes au profit des muscles du haut du corps",
      "Pas assez de transfert entre salle de musculation et gestes spécifiques rugby",
      "Sur-entraînement qui mène à la fatigue chronique et à la régression"
    ],
    exercices: [
      { titre: "Squat jump avec charge légère", description: "Squat avec barre légère (40-50% du max) puis saut explosif : développe la puissance de jambes.", duree: "15 min" },
      { titre: "Medicine ball slam & throw", description: "Lancer de medicine ball au mur et au sol : développe la chaîne postérieure et le gainage.", duree: "10 min" },
      { titre: "Box jumps + sprint", description: "Saut sur boîte + descente + sprint 5m : enchaînement puissance et vitesse.", duree: "15 min" },
      { titre: "Contact power drill", description: "Poussée contre défenseur sur 3m : bonne posture, puissance jambes, drive continu.", duree: "20 min" },
      { titre: "Pliométrie rugby", description: "Bonds horizontaux + départ explosif simulant une course de ligne arrière.", duree: "15 min" }
    ],
    conseil_coach: "La puissance se perd en 3 semaines sans entretien spécifique. Intégrez 2 séances de puissance par semaine, même courtes (20 minutes), pour maintenir les acquis tout au long de la saison.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"
  },
  {
    id: 'agilite',
    name: 'Agilité',
    category: 'Physique',
    icon: 'ri-run-line',
    description: "L'agilité est la capacité à changer rapidement de direction avec précision et sans perte de vitesse significative. En rugby, elle s'exprime dans le crochet du porteur, l'esquive face au plaqueur, le repositionnement défensif et la capacité à répondre aux mouvements adverses. L'agilité perceptive — réagir à un stimulus — est aussi importante que l'agilité pure.",
    erreurs: [
      "Travailler uniquement l'agilité en ligne droite sans stimulus externe",
      "Cambrer le dos lors des changements de direction, réduisant la puissance",
      "Planter le pied trop loin devant le centre de gravité lors des virages",
      "Négliger le travail de chevilles qui est souvent le facteur limitant"
    ],
    exercices: [
      { titre: "Échelle de vitesse (ladder)", description: "Patterns de ladder en avant, côté, croisé : vitesse des pieds et coordination.", duree: "15 min" },
      { titre: "T-Test", description: "Test d'agilité standard (cônes en T) : mesure et suivi de la progression.", duree: "10 min" },
      { titre: "Agilité réactive avec signal", description: "Partenaire pointe direction au dernier moment : le joueur doit réagir et changer.", duree: "15 min" },
      { titre: "Cone drill 5-10-5", description: "Sprint 5m, changement direction, sprint 10m, changement, sprint 5m retour.", duree: "15 min" },
      { titre: "Crochet sur plaqueur", description: "Le plaqueur se déplace, le porteur doit le feinter avec crochet intérieur ou extérieur.", duree: "20 min" }
    ],
    conseil_coach: "L'agilité perceptive (réagir à ce que fait le défenseur) est 2x plus importante que l'agilité sur parcours fixe. Entraînez toujours l'agilité avec un stimulus humain ou visuel, pas seulement sur des parcours de cônes programmés.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
  },
  {
    id: 'leadership',
    name: 'Leadership',
    category: 'Mental',
    icon: 'ri-user-star-line',
    description: "Le leadership en rugby est la capacité à influencer positivement ses coéquipiers, à prendre des décisions tactiques sous pression et à maintenir la cohésion de groupe dans les moments difficiles. Les équipes championnes ont généralement plusieurs leaders à différents postes — pas seulement le capitaine — qui partagent cette responsabilité collective.",
    erreurs: [
      "Confondre leadership avec autorité — imposer au lieu d'entraîner",
      "Rester silencieux lors des moments charnières en attendant que les autres réagissent",
      "Ne pas assumer la responsabilité de ses erreurs devant le groupe",
      "Décourager au lieu de soutenir quand un coéquipier est en difficulté"
    ],
    exercices: [
      { titre: "Débriefs collectifs dirigés par les joueurs", description: "Un joueur différent dirige le débrief après chaque match, ce qui développe la prise de parole.", duree: "30 min" },
      { titre: "Capitanat tournant à l'entraînement", description: "Chaque semaine, un joueur différent est capitaine de séance avec pouvoir de décision.", duree: "90 min" },
      { titre: "Exercice de prise de décision sous pression", description: "Situation de jeu bloquée : le leader désigné doit prendre une décision tactique en 10 secondes.", duree: "15 min" },
      { titre: "Feedback positif systématique", description: "Exercice où les joueurs donnent uniquement des retours positifs à leurs coéquipiers pendant 15 min.", duree: "15 min" }
    ],
    conseil_coach: "Le meilleur indicateur du leadership est le comportement du joueur quand l'équipe est menée de 10 points à la 70e minute. Observez qui reste debout, qui parle, qui encourage. Ce sont vos vrais leaders.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'discipline',
    name: 'Discipline',
    category: 'Mental',
    icon: 'ri-scales-3-line',
    description: "La discipline est le facteur tactique le plus sous-estimé du rugby. Chaque pénalité concédée donne 3 points potentiels à l'adversaire et remet son équipe sous pression. Une équipe qui concède en moyenne 2 pénalités de moins par match que ses adversaires peut renverser l'équilibre d'une saison entière. La discipline physique et vocale (ne pas répondre à l'arbitre) sont des compétences entraînables.",
    erreurs: [
      "Répondre verbalement à l'arbitre après une décision défavorable",
      "Continuer dans le ruck après que le ballon est sorti (hors-jeu)",
      "Saisir un joueur hors-jeu sous la pression émotionnelle du match",
      "Ne pas se retirer au sol immédiatement après avoir été plaqué"
    ],
    exercices: [
      { titre: "Simulation d'arbitrage avec pression émotionnelle", description: "L'entraîneur siffle des fautes imaginaires : les joueurs doivent ne PAS répondre.", duree: "10 min" },
      { titre: "Exercice de concentration sur les règles", description: "Jeu limité à 3 règles clés : les joueurs doivent mentalement les monitorer en permanence.", duree: "20 min" },
      { titre: "Décompte de pénalités en entraînement", description: "Chaque pénalité = 5 pompes collectives : créer la conscience que la faute coûte au groupe.", duree: "90 min" },
      { titre: "Relaxation et gestion émotionnelle", description: "Séance de 10 minutes de respiration et gestion de la frustration avant une séance technique.", duree: "10 min" }
    ],
    conseil_coach: "Après chaque match, comptabilisez les pénalités concédées par zone et par type. Si plus de 30% viennent du ruck, travaillez spécifiquement la sortie de ruck. La donnée objective est plus efficace que le discours général.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'engagement',
    name: 'Engagement',
    category: 'Mental',
    icon: 'ri-fire-line',
    description: "L'engagement est l'intensité mentale et physique qu'un joueur apporte à chaque action, chaque entraînement, chaque match. C'est la différence entre un joueur présent physiquement et un joueur présent à 100%. L'engagement se voit dans les ruck, dans la course de soutien après une phase épuisante, dans le plaquage défensif en fin de match.",
    erreurs: [
      "Réserver son énergie en espérant en avoir besoin plus tard — l'intensité se crée, ne se conserve pas",
      "S'auto-exclure des phases de jeu 'hors position' plutôt que d'aider",
      "Laisser l'équipe avant de rejoindre le groupe — baisse de régime individuelle visible",
      "Ne pas s'engager dans les duels aériens par crainte de la douleur"
    ],
    exercices: [
      { titre: "Entraînement en conditions difficiles (boue, pluie)", description: "Simuler les conditions adverses pour tester et renforcer l'engagement inconditionnnel.", duree: "90 min" },
      { titre: "Séquences d'effort maximal chronométrées", description: "Sprints, contacts, rucks enchaînés : noter l'engagement sur les dernières répétitions.", duree: "20 min" },
      { titre: "Jeu à effectif réduit haute intensité", description: "3 contre 3 sur 20m : l'intensité est maximale, chaque joueur compte double.", duree: "15 min" },
      { titre: "Défi collectif chronométré", description: "L'équipe doit compléter un circuit en moins d'un temps cible — cohésion et engagement.", duree: "20 min" }
    ],
    conseil_coach: "L'engagement se reconnaît à la qualité des ruck après 60 minutes de jeu. Un joueur engagé donne encore 100% dans sa course de soutien à la 75e minute. C'est votre étalon de mesure.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"
  },
  {
    id: 'resilience',
    name: 'Résilience',
    category: 'Mental',
    icon: 'ri-mental-health-line',
    description: "La résilience est la capacité à rebondir après une erreur, un essai encaissé ou une mauvaise passe, et à maintenir une performance de haut niveau malgré les coups du sort. En rugby, les erreurs sont inévitables — la question est : combien de secondes après une erreur le joueur est-il de nouveau à 100% mentalement ?",
    erreurs: [
      "Rester fixé sur l'erreur précédente pendant que le jeu continue",
      "Se mettre en colère contre soi-même, dépensant de l'énergie mentale inutilement",
      "Éviter les situations similaires à l'erreur commise par peur de récidiver",
      "Ne pas communiquer avec l'équipe après une erreur personnelle, s'isolant"
    ],
    exercices: [
      { titre: "Exercice d'erreur volontaire et récupération", description: "On force le joueur à faire une erreur (passe cassée), puis il doit être à 100% sur l'action suivante.", duree: "15 min" },
      { titre: "Simulation de scénario défavorable", description: "Entraînement avec mise en situation: équipe menée de 7 à la 70e min — trouver les ressources.", duree: "30 min" },
      { titre: "Rutine de récupération mentale", description: "Chaque joueur crée sa routine post-erreur : respiration, mot-clé, geste physique.", duree: "15 min" },
      { titre: "Challenges progressifs croissants", description: "Augmenter progressivement la difficulté jusqu'à l'échec, puis repartir : musculer la résilience.", duree: "20 min" }
    ],
    conseil_coach: "Apprenez à vos joueurs la règle des '3 secondes' : après une erreur, 3 secondes maximum pour l'analyser, puis on repart. Ce n'est pas de la négation — c'est de la gestion de la performance.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  },
  {
    id: 'lecture_jeu',
    name: 'Lecture du jeu',
    category: 'Mental',
    icon: 'ri-eye-line',
    description: "La lecture du jeu est la compétence cognitive qui différencie les grands joueurs des bons joueurs. Elle permet d'anticiper les actions adverses, de reconnaître les patterns offensifs et défensifs, et de prendre la bonne décision avant même que la situation ne se réalise. Elle se développe par la vidéo, la pratique et l'expérience de match.",
    erreurs: [
      "Regarder uniquement le ballon au lieu de l'ensemble du tableau de jeu",
      "Ne pas analyser les patterns adverses pour anticiper leur prochain mouvement",
      "Prendre des décisions sur la base de ce qui est devant soi, pas sur la lecture globale",
      "Négliger la communication visuelle avec les partenaires pendant le jeu"
    ],
    exercices: [
      { titre: "Analyse vidéo collective hebdomadaire", description: "30 minutes de vidéo en groupe, le joueur doit prédire la prochaine action avant de voir la suite.", duree: "30 min" },
      { titre: "Jeu de reconnaissance de pattern", description: "Le coach annonce un pattern (ex: 'pick and go 3 fois puis pied') : les joueurs doivent l'identifier.", duree: "15 min" },
      { titre: "Vision périphérique et awareness", description: "Exercices avec plusieurs stimuli visuels simultanés : ballon + coéquipier + défenseur.", duree: "15 min" },
      { titre: "Debriefing tactique post-match", description: "Le joueur explique à voix haute ses décisions du match : verbaliser structure la pensée.", duree: "20 min" },
      { titre: "Simulateur de décision", description: "Situations figées sur terrain : le joueur a 5 secondes pour désigner la meilleure option.", duree: "20 min" }
    ],
    conseil_coach: "Les meilleurs lecteurs du jeu ne regardent pas le ballon — ils regardent autour du ballon. Apprenez à vos joueurs à élargir leur champ de vision : l'information est dans les espaces, pas dans le cuir.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
  }
]

export const CATEGORIES = ['Attaque', 'Défense', 'Jeu groupé', 'Physique', 'Mental'] as const

export const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#ffd83a',
  C: '#f97316',
  D: '#ef4343'
}

export const GRADE_VALUES: Record<string, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1
}
