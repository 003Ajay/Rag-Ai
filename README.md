# RAG-Tutorials

cd Rag-Ai
git pull

# 1. Stop and delete the old container
docker stop rag-api
docker rm rag-api

# 2. Build the new version (this includes your latest code changes)
docker build -t rag-backend .

# 3. Start the container again
docker run -d -p 8000:8000 --env-file .env --name rag-api rag-backend
