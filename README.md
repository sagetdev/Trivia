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

Le backend écoute sur le port 4000 par défaut. L'état est sauvegardé dans `Backend/data/quiz-store.json` (ou dans `QUIZ_DATA_FILE`).

### Android
1. Dans `Frontend/`, exécuter `npm install`.
2. Sur l'émulateur Android, l'URL par défaut `http://10.0.2.2:4000/api` pointe vers le port 4000 de la machine hôte.
3. Pour un téléphone Android physique, définir `EXPO_PUBLIC_API_URL` dans `.env` vers l'adresse LAN de l'ordinateur, par exemple `http://192.168.1.20:4000/api`.
4. Exécuter `npx expo start --android`.

## Fournisseur de questions
- `QUESTION_PROVIDER=opentdb` (par défaut)
- `QUESTION_PROVIDER=triviaapi`

Le point de terminaison `GET /api/config` indique le fournisseur actif et les types de questions pris en charge.

## Points importants
- Les réponses correctes ne sont jamais envoyées avec la question en cours; la correction n'est disponible qu'après la soumission.
- Le serveur vérifie les choix soumis et l'index de la question pour bloquer les réponses hors choix et les anciennes/doubles soumissions.
- Les sessions et le classement sont enregistrés dans un fichier JSON pour les déploiements mono-instance disposant d'un stockage persistant. Pour plusieurs instances ou un déploiement sans disque persistant, migrer vers PostgreSQL avant la production.
- Configure `QUIZ_DATA_FILE` vers un volume persistant sur l'hébergeur; sans volume, les données locales peuvent être perdues lors d'un redéploiement.
- L'application est configurée pour Android uniquement; aucun build web ou iOS n'est configuré.
