FROM nginx:alpine-slim

COPY index.html obfu.js /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]
