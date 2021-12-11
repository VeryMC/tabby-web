pipeline {
  agent any
  environment {
    dockerImage = ''
    packageVersion = ''
  }

  stages {
    stage('Build docker image') {
      steps {
        script {
         packageVersion = sh(returnStdout: true, script: 'git rev-parse HEAD')
         dockerImage = docker.build("tabby-web:latest")
        }
      }
    }
    stage('Push image') {
      steps {
        script {
          docker.withRegistry('https://docker.premsiserv.com', 'nexusjenkinsuser' {
            dockerImage.push(packageVersion)
            dockerImage.push("latest")
          }
        }
      }
    }
  }
}
