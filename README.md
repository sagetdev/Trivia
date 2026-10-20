# Trivia — Android

Application de quiz construite avec Expo / React Native (Android) et une API Express / TypeScript.

## Structure
- `Frontend/`: application mobile Expo Router.
- `Backend/`: API Express et intégration des fournisseurs de questions.

## Démarrage local

### Backend
1. Installer Node.js 22 ou plus récent.
2. Dans `Backend/`, exécuter `npm install`.
3. Copier `.env.example` vers `.env` si nécessaire.
4. Exécuter `npm run dev`.

Le backend écoute sur le port 4000 par défaut. L'état des quiz terminés est sauvegardé dans `Backend/data/quiz-store.json` (ou dans `QUIZ_DATA_FILE`).

### Android
1. Dans `Frontend/`, exécuter `npm install`.
2. Sur l'émulateur Android, l'URL par défaut `http://10.0.2.2:4000/api` pointe vers le port 4000 de la machine hôte.
3. Pour un téléphone Android physique, définir `EXPO_PUBLIC_API_URL` dans `.env` vers l'adresse LAN de l'ordinateur, par exemple `http://192.168.1.20:4000/api`.
4. Exécuter `npx expo start --android`.

## Fonctionnalités
- Quiz classique, rush de 60 secondes, survie (3 erreurs) et difficulté progressive.
- Correction après le quiz avec réponse sélectionnée, bonne réponse et explication optionnelle si la source en fournit une.
- Statistiques serveur basées sur les parties enregistrées : précision, durée moyenne et précision par catégorie.
- Classements global, des 7 derniers jours, par catégorie et par liste de pseudos.
- Défi quotidien daté en UTC, dix questions, une seule validation terminée par pseudo et par jour.
- Salles multijoueurs avec code, jusqu'à huit joueurs, lobby, progression partagée, soumission d'une réponse et classement final.
- Cache local des catégories et statistiques locales du profil.

## API multijoueur
- `POST /api/rooms`: créer une salle.
- `POST /api/rooms/:code/join`: rejoindre une salle.
- `POST /api/rooms/:code/start`: démarrer (hôte uniquement, minimum deux joueurs).
- `GET /api/rooms/:code?playerId=...`: synchroniser l'état de la salle.
- `POST /api/rooms/:code/answers`: soumettre une réponse.
- `GET /api/rooms/:code/results`: résultats de la partie terminée.

Le frontend synchronise actuellement les salles par polling HTTP. Les salles sont en mémoire : elles disparaissent au redémarrage et ne sont pas partagées entre plusieurs instances du backend. Avant une vraie sortie publique, il faut remplacer ce stockage par une base partagée et passer à WebSockets pour une synchronisation temps réel plus robuste. Les salles utilisent des identifiants de joueur temporaires, pas des comptes authentifiés.

## Fournisseur de questions
- `QUESTION_PROVIDER=opentdb` (par défaut)
- `QUESTION_PROVIDER=triviaapi`

Le point de terminaison `GET /api/config` indique le fournisseur actif et les types de questions pris en charge. Les fournisseurs configurés ne renvoient pas d'explications détaillées pour chaque réponse; l'interface affiche une indication lorsqu'aucune explication n'est disponible.

## Déploiement et sécurité
- Les réponses correctes ne sont jamais envoyées avec la question en cours; la correction n'est disponible qu'après la soumission.
- Le serveur vérifie les choix soumis et l'index de la question pour bloquer les réponses hors choix et les anciennes/doubles soumissions.
- Les sessions et le classement sont enregistrés dans un fichier JSON pour les déploiements mono-instance disposant d'un stockage persistant. Pour plusieurs instances ou un déploiement sans disque persistant, migrer vers PostgreSQL avant la production.
- Configure `QUIZ_DATA_FILE` vers un volume persistant sur l'hébergeur; sans volume, les données locales peuvent être perdues lors d'un redéploiement.
- Les statistiques du profil local et les statistiques serveur sont distinctes. Le pseudo n'est pas une identité sécurisée : l'authentification reste nécessaire pour un classement public résistant à l'usurpation.
- Le défi quotidien est basé sur la date UTC; le jeu de questions est partagé entre les joueurs sur une même instance pendant que le processus tourne, mais n'est pas encore stocké durablement.
- L'application est configurée pour Android uniquement; aucun build web ou iOS n'est configuré.
