FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY obfu.js /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]
