pipeline {
    agent any
    
    environment {
        ACR_NAME = 'kikihe'
        ACR_LOGIN_SERVER = 'kikihe.azurecr.io'
        IMAGE_NAME_FRONTEND = 'opendevops-nyctaxiweb-frontend'
        IMAGE_NAME_BACKEND = 'opendevops-nyctaxiweb-backend'
        AZURE_CLIENT_ID = credentials('clientId') // Jenkins credentials ID
        AZURE_CLIENT_SECRET = credentials('clientSecret')
        AZURE_TENANT_ID = credentials('tenantId')
    }

    stages {
        stage('Run Azure CLI in Docker') {
            steps {
                sh '/root/.local/bin/az --version'
            }
        }

                
        stage('Login to Azure') {
            steps {
                sh '''
                /root/.local/bin/az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
                /root/.local/bin/az acr login --name $ACR_NAME
                '''
            }
        }

        stage('Build Frontend & Backend') {
            steps {
                dir('front_end') {
                    sh 'docker build -t $IMAGE_NAME_FRONTEND .'
                    sh 'docker tag $IMAGE_NAME_FRONTEND $ACR_LOGIN_SERVER/$IMAGE_NAME_FRONTEND'
                }
                dir('back_end') {
                    sh 'docker build -t $IMAGE_NAME_BACKEND .'
                    sh 'docker tag $IMAGE_NAME_BACKEND $ACR_LOGIN_SERVER/$IMAGE_NAME_BACKEND'
                }
            }
        }

        stage('Push Images to ACR') {
            steps {
                sh 'docker push $ACR_LOGIN_SERVER/$IMAGE_NAME_FRONTEND'
                sh 'docker push $ACR_LOGIN_SERVER/$IMAGE_NAME_BACKEND'
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker pull $ACR_LOGIN_SERVER/$IMAGE_NAME_FRONTEND'
                sh 'docker pull $ACR_LOGIN_SERVER/$IMAGE_NAME_BACKEND'
                sh 'docker rm -f frontend || true'
                sh 'docker rm -f backend || true'
                sh 'docker run -d --name frontend -p 8080:80 $ACR_LOGIN_SERVER/$IMAGE_NAME_FRONTEND'
                sh 'docker run -d --name backend -p 3000:3000 $ACR_LOGIN_SERVER/$IMAGE_NAME_BACKEND'
            }
        }
    }
}
