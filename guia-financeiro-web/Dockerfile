# Etapa 1: Build do React
FROM node:20-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Cria a versão de produção (build)
RUN npm run build

# Etapa 2: Servindo com Nginx
FROM nginx:stable-alpine

# Copia os arquivos gerados no build para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do Nginx (opcional, mas recomendado para SPAs)
# Se você usa React Router, precisa que o Nginx redirecione as rotas para o index.html
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]