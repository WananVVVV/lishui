FROM nginx:1.26.2

RUN mkdir /empower

COPY dist/city-safety-admin-front /empower/city-safety-admin-front
COPY devops/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
