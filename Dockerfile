# Utilisation de l'image officielle Nginx
FROM nginx:latest

# Copie des fichiers du projet dans le dossier Nginx
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY script.js /usr/share/nginx/html/script.js

# Exposer le port 80 pour le serveur web
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
