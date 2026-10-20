# RoamApp / TriviaApp — Roadmap de fonctionnalités

> **Règle de suivi :** ne cocher une tâche qu'après inspection du code, test pertinent et validation. Le fait qu'un écran ou un type existe ne prouve pas que la fonctionnalité est complète.
>
> **Légende :** `[ ]` à faire / auditer · `[x]` terminé et vérifié · `[~]` en cours · `[!]` bloqué.
>
> **Approche :** une sous-tâche à la fois, préserver les modifications existantes, exécuter les tests disponibles après chaque lot, noter les fichiers touchés et les résultats. Ne pas créer de deuxième écran/route si une route équivalente existe déjà.

## État actuel

- [x] Créer et conserver cette checklist versionnée (commit de suivi sur la branche de travail).
- [ ] Examiner l'état Git local et les fichiers de sauvegarde sans les supprimer.
- [ ] Établir les tests de référence : TypeScript frontend/backend, démarrage Expo, démarrage API, parcours quiz complet.
- [ ] Vérifier les dépendances déjà installées avant d'en ajouter.
- [ ] Vérifier le branchement Frontend ↔ Backend et les variables d'environnement.
- [ ] Après chaque lot, mettre à jour cette checklist avec les fichiers modifiés et les tests.

## Priorité 0 — Fiabilité et parcours principal

### A. Modes de jeu
- [ ] Classic : paramètres, nombre de questions, score et écran de résultats cohérents.
- [ ] 60s Rush : chronomètre global réel de 60 secondes et arrêt fiable.
- [ ] Survie : fin après 3 mauvaises réponses, sans dépasser cette limite.
- [ ] Progressif : difficulté réellement progressive et XP cohérents avec la difficulté servie.
- [ ] Chrono par question : 15 s, 30 s, 45 s et sans limite.
- [ ] Une seule soumission acceptée par question, y compris après timeout/navigation.
- [ ] Résultats calculés depuis les réponses réellement validées par le serveur.
- [ ] État de quiz nettoyé correctement entre deux parties.
- [ ] Gérer les réponses API vides, erreurs réseau, timeouts et abandon/reprise.
- [ ] Tests de régression pour chaque mode.

### B. Animation et feedback transversal
- [ ] Auditer Reanimated et la configuration existante avant d'ajouter des dépendances.
- [~] Animation légère de pression/rebond sur les cartes de réponse (`OptionCard.tsx`); test local à faire.
- [~] Entrée animée du panneau de feedback (`FeedbackSheet.tsx`); vérifier le comportement en jeu et l'accessibilité.
- [~] Barre de progression animée (`ProgressBar.tsx`); vérifier le rendu et les types Reanimated localement.
- [ ] Animation du chrono avec alerte visuelle discrète quand le temps devient faible.
- [ ] Animation de score et compteur d'XP.
- [ ] Transition d'entrée/sortie des écrans et des cartes, sans dupliquer les routes.
- [ ] Célébration de fin de partie, victoire, nouveau record et montée de niveau.
- [ ] Animations de badges, quêtes et série quotidienne.
- [ ] États vides/chargement/erreur illustrés et cohérents.
- [ ] Respecter les préférences de réduction des animations lorsque possible.
- [ ] Garder les animations fluides sur appareils modestes et éviter les boucles coûteuses.
- [ ] Ajouter haptique/sons uniquement si les dépendances et réglages le permettent, avec possibilité de désactiver.

## Priorité 1 — Questions et apprentissage

- [ ] Explication après réponse uniquement lorsqu'une explication fiable existe.
- [ ] Ne jamais inventer une explication si la source n'en fournit pas.
- [ ] Catégories et sous-catégories : données, navigation, filtres et états vides cohérents.
- [ ] Favoris de questions persistants après fermeture de l'application.
- [ ] Historique des questions vues.
- [ ] Liste de questions incorrectes à réviser.
- [ ] Rejouer une session de révision sans fausser les statistiques/XP du classement.
- [ ] Statistiques de précision par catégorie et difficulté.
- [ ] Réduire les répétitions récentes et diversifier les questions.
- [ ] Gestion de quotas, indisponibilité ou erreurs du fournisseur de questions.
- [ ] Stratégie de secours/fallback documentée sans mélanger des questions invalides.
- [ ] Cache des questions et mode hors ligne pour les questions préchargées.
- [ ] Tests du fournisseur, du fallback, des favoris et des révisions.

## Priorité 1 — Progression, fidélisation et récompenses

- [ ] Vérifier la persistance réelle de l'XP et corriger les divergences frontend/backend.
- [ ] Vérifier le calcul du niveau et la progression vers le prochain niveau.
- [ ] Garantir qu'une même partie ne donne pas ses récompenses deux fois.
- [ ] Séries quotidiennes : fuseau/date, jour manqué, retour après minuit et cas limites.
- [ ] Défi quotidien : même défi stable pour une date et règles anti-duplication.
- [ ] Quêtes quotidiennes avec progression et critères explicites.
- [ ] Quêtes hebdomadaires avec progression et expiration explicite.
- [ ] Déblocage de succès/badges sur des critères vérifiables.
- [ ] Titres et badges visibles dans le profil.
- [ ] Bonus de séries de bonnes réponses, plafonnés et validés côté serveur.
- [ ] Historique des parties et meilleurs scores.
- [ ] Avatar/profil et édition du pseudonyme avec validation.
- [ ] Cosmétiques (thèmes, cadres, effets) uniquement après un système de déblocage fiable.
- [ ] Animations XP, montée de niveau, succès et série quotidienne.
- [ ] États de première utilisation et progression vide compréhensibles.

## Priorité 1 — Profil, statistiques et personnalisation

- [ ] Précision globale et nombre de questions répondues.
- [ ] Précision par catégorie et difficulté.
- [ ] Meilleur score et meilleure série de bonnes réponses.
- [ ] Temps moyen de réponse, si la donnée est collectée de façon fiable.
- [ ] Progression sur 7 jours et 30 jours.
- [ ] Catégories favorites et recommandations basées sur les performances réelles.
- [ ] Préférences de thème clair/sombre si prises en charge par le design actuel.
- [ ] Préférences de langue, sons et vibrations.
- [ ] Accessibilité : contrastes, tailles de texte, libellés et zones tactiles.
- [ ] Préférences conservées après redémarrage.
- [ ] États vides, chargement et erreur pour toutes les statistiques.

## Priorité 2 — Classement, amis et multijoueur

- [ ] Classement global : scores vérifiés côté serveur.
- [ ] Classement hebdomadaire avec fenêtre temporelle définie.
- [ ] Classement par catégorie.
- [ ] Remplacer le filtre « amis » basé uniquement sur les noms par de vraies relations.
- [ ] Identité joueur stable et protection contre l'usurpation de pseudonyme.
- [ ] Salons privés avec code, validation et expiration.
- [ ] État des salons persisté dans une base, pas uniquement dans une Map mémoire.
- [ ] Duels en direct et synchronisation fiable des réponses.
- [ ] Fin de partie multijoueur avec classement final cohérent.
- [ ] Revanche.
- [ ] Historique des duels, victoires et défaites.
- [ ] Invitations et notifications, si l'architecture de comptes le permet.
- [ ] Remplacer/améliorer le polling si nécessaire après mesure; ne pas ajouter de temps réel sans besoin confirmé.
- [ ] Gérer déconnexion, reconnexion, joueur absent, salon plein et partie terminée.
- [ ] Tests d'intégration des salons et des classements.

## Priorité 1 — Backend, base de données, comptes et sécurité

- [ ] Auditer le stockage JSON existant, ses limites et les chemins de données.
- [ ] Concevoir un schéma PostgreSQL pour comptes, profils, parties, réponses, XP, séries, quêtes, favoris et classements.
- [ ] Choisir/valider la couche d'accès aux données et les migrations.
- [ ] Ajouter migrations reproductibles et stratégie de sauvegarde/restauration.
- [ ] Ajouter authentification et sessions sécurisées avant la synchronisation multi-appareils.
- [ ] Préserver/migrer les données locales existantes quand un compte est créé.
- [ ] Valider côté serveur les réponses, scores, XP, succès et quêtes.
- [ ] Limiter les requêtes et prévenir les soumissions répétées/abusives.
- [ ] Validation des entrées, erreurs API cohérentes et logs utiles sans secrets.
- [ ] Définir politique de suppression/export des données de compte.
- [ ] Vérifier les variables d'environnement et ne jamais committer de secrets.
- [ ] Tests des routes, services, migrations et autorisations.
- [ ] Outils de diagnostic/admin pour questions invalides et erreurs, protégés par autorisation.

## Priorité 2 — Expérience avancée et contenu

- [ ] Mode entraînement sans chrono.
- [ ] Mode sans fin avec arrêt contrôlé et résultats cohérents.
- [ ] Pouvoir 50/50, avec disponibilité et règles explicites.
- [ ] Seconde chance, limitée et impossible à exploiter pour dupliquer des réponses.
- [ ] Bonus de temps avec règles spécifiques par mode.
- [ ] Favoris et révision accessibles depuis une entrée claire.
- [ ] Personnalisation des sessions et filtres de difficulté/catégorie.
- [ ] Vérifier que les nouveaux modes sont compatibles avec scores, XP, quêtes et classement.

## Priorité 3 — Préparation production

- [ ] Tests automatisés des règles métier essentielles.
- [ ] Vérification TypeScript frontend et backend.
- [ ] Vérification Expo/Metro et navigation typed routes.
- [ ] Tests manuels sur petit écran et appareil Android.
- [ ] Tests réseau lent, API indisponible et réponse malformée.
- [ ] Vérification des performances et des rendus inutiles.
- [ ] Vérification des permissions, données personnelles et sécurité.
- [ ] Vérification de la configuration de build et des variables de production.
- [ ] Liste de régression finale avant publication.

## Ordre d'exécution imposé

1. [ ] Baseline Git, dépendances, compilation et parcours principal.
2. [ ] Modes de jeu et règles serveur.
3. [ ] Animations et feedback du quiz.
4. [ ] Défi quotidien, XP, niveaux, séries et récompenses persistantes.
5. [ ] Favoris, historique, révision et qualité des questions.
6. [ ] PostgreSQL, migrations, comptes et synchronisation des données.
7. [ ] Classements fiables, amis et salons persistants.
8. [ ] Statistiques, préférences, accessibilité et mode hors ligne.
9. [ ] Modes avancés et power-ups.
10. [ ] Tests de régression, performance et préparation production.

## Journal des changements

| Date | Lot | Fichiers modifiés | Tests exécutés | Résultat |
|---|---|---|---|---|
| 2026-10-19 | Création de la roadmap | `ROADMAP_FEATURES.md` | À lancer sur l'environnement local | Checklist créée; aucune fonctionnalité n'est déclarée terminée sans test |
| 2026-10-19 | Premier lot d'animations quiz | `Frontend/src/components/ui/OptionCard.tsx`, `Frontend/src/components/ui/ProgressBar.tsx`, `Frontend/src/components/features/FeedbackSheet.tsx` | Non exécutés : les changements ont été appliqués au dépôt distant et doivent être récupérés puis testés dans l'environnement local | Animations de rebond/entrée, progression et panneau de feedback ajoutées; validation TypeScript/Expo requise |

## Règles de mise à jour

- Cocher une tâche uniquement après preuve dans le code et test adapté.
- Pour chaque lot, noter les fichiers exacts et le résultat des tests.
- Ne pas écraser les changements utilisateur non commités.
- Ne pas ajouter de fichier de sauvegarde dans les dossiers routés par Expo Router.
- Avant une migration de données ou une suppression, prévoir une sauvegarde et expliquer le risque.
