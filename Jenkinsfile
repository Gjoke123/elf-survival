pipeline {
    agent any

    environment {
        IMAGE = 'gjoke/elf-survivor'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE}:${BUILD_NUMBER} \
                      -t ${IMAGE}:latest \
                      .
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | \
                          docker login \
                          -u "$DOCKERHUB_USERNAME" \
                          --password-stdin

                        docker push ${IMAGE}:${BUILD_NUMBER}
                        docker push ${IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }
    }
}