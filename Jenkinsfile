pipeline {
    agent any

    environment {
        AZURE_ACR_NAME = 'labacrdevops'
        IMAGE_NAME_FRONTEND = 'opendevops-nyctaxiweb-frontend:v1.0.0'
        IMAGE_NAME_BACKEND = 'opendevops-nyctaxiweb-backend:v1.0.0'
        ACR_LOGIN_SERVER = "${AZURE_ACR_NAME}.azurecr.io"
        ACR_USER = 'StudentToken'
        ACR_PASS = credentials('token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend & Backend') {
            steps {
                dir('front_end') {
                    sh 'docker build -t ${IMAGE_NAME_FRONTEND} .'
                    sh 'docker tag ${IMAGE_NAME_FRONTEND} ${ACR_LOGIN_SERVER}/${IMAGE_NAME_FRONTEND}'
                }
                dir('back_end') {
                    sh 'docker build -t ${IMAGE_NAME_BACKEND} .'
                    sh 'docker tag ${IMAGE_NAME_BACKEND} ${ACR_LOGIN_SERVER}/${IMAGE_NAME_BACKEND}'
                }
            }
        }

        stage('Push Image') {
            steps {
                script {
                        sh """
                            docker login ${ACR_LOGIN_SERVER} -u ${ACR_USER} -p ${ACR_PASS}
                            docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME_FRONTEND}
                            docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME_BACKEND}
                        """
                    }
                }
            }
        

        stage('Deploy') {
            steps {
                sh 'docker pull ${ACR_LOGIN_SERVER}/${IMAGE_NAME_FRONTEND}'
                sh 'docker pull ${ACR_LOGIN_SERVER}/${IMAGE_NAME_BACKEND}'
                
                // List all containers (including stopped ones) to debug
                sh 'docker ps -a'
                
                // Stop any container using the names we want (one at a time)
                sh 'docker stop frontend || echo "No frontend container running"'
                sh 'docker stop backend || echo "No backend container running"'
                
                // Remove any container with these names (one at a time)
                sh 'docker rm -f frontend || echo "No frontend container to remove"'
                sh 'docker rm -f backend || echo "No backend container to remove"'
                
                // Check what's using our ports
                sh 'netstat -tuln | grep 8080 || echo "Port 8080 is free"'
                sh 'netstat -tuln | grep 3000 || echo "Port 3000 is free"'
                
                // Run with less common ports
                sh 'docker run -d --name frontend -p 8080:80 ${ACR_LOGIN_SERVER}/${IMAGE_NAME_FRONTEND}'
                sh 'docker run -d --name backend -p 3000:3000 ${ACR_LOGIN_SERVER}/${IMAGE_NAME_BACKEND}'
                
                // Verify the containers are running
                sh 'docker ps'
            }
        }
    }
}