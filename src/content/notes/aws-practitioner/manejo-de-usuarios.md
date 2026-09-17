---
id: manejo-de-usuarios
title: Gestión de Usuarios y Accesos en AWS (IAM)
description: >-
  Como manejar la seguridad de la cuenta de AWS, por medio de IAM y doble
  seguridad con MFA
tags:
  - aws
  - seguridad
  - iam
  - mfa
  - root
  - usuario
category: aws-practitioner
topic: fundamentos-cloud
durationMinutes: 5
position: 4
format: written
body: >




  La gestión de identidades y accesos (IAM) en Amazon Web Services (AWS) es el
  pilar fundamental para proteger los recursos y datos en la nube. AWS IAM
  permite controlar quién está autenticado y tiene autorización para utilizar
  los servicios, asegurando que cada componente del equipo o sistema tenga
  exactamente el nivel de acceso que necesita.


  ### Conceptos Clave de AWS IAM


  Para estructurar un entorno seguro, es necesario dominar los cuatro elementos
  principales del servicio:


  * **Usuarios (Users):** Representan a una persona o una aplicación que
  interactúa con AWS. Cada usuario tiene sus propias credenciales (contraseña
  para la consola o claves de acceso para la CLI/API).

  * **Grupos (Groups):** Son colecciones de usuarios. Permiten aplicar políticas
  de permisos a múltiples usuarios simultáneamente, facilitando la
  administración de equipos (por ejemplo, crear un grupo de *Desarrolladores*
  con acceso a entornos de prueba).

  * **Roles:** A diferencia de los usuarios, los roles no tienen credenciales
  permanentes. Son asumidos temporalmente por usuarios, aplicaciones o servicios
  de AWS (como instancias EC2 o funciones Lambda) para ejecutar tareas
  específicas de forma segura.

  * **Políticas (Policies):** Documentos en formato JSON que definen los
  permisos exactos. Se adjuntan a usuarios, grupos o roles para determinar qué
  acciones pueden realizar sobre qué recursos.


  ### Mejores Prácticas de Seguridad en AWS


  Implementar IAM correctamente requiere seguir principios de seguridad
  estrictos para evitar vulnerabilidades críticas en la infraestructura.


  * **Principio de Menor Privilegio:** Otorga únicamente los permisos
  estrictamente necesarios para que un usuario o servicio realice su tarea.
  Evita asignar políticas genéricas como `AdministratorAccess` a menos que sea
  absolutamente imprescindible.

  * **Habilitar Autenticación Multifactor (MFA):** Exige MFA para todos los
  usuarios con acceso a la consola de administración, especialmente para
  aquellos con permisos elevados y, obligatoriamente, para la cuenta raíz (Root
  Account).

  * **Priorizar Roles sobre Claves de Acceso:** Para aplicaciones que se
  ejecutan dentro de AWS, utiliza roles de IAM en lugar de almacenar *Access
  Keys* estáticas en el entorno de desarrollo. Esto permite una rotación de
  credenciales automática y segura.

  * **Rotación de Credenciales y Auditoría:** Configura políticas que exijan el
  cambio regular de contraseñas y claves de acceso. Utiliza AWS CloudTrail y IAM
  Access Analyzer para monitorear continuamente quién accede a qué recursos.


  ### Ejemplo Práctico: Política de Acceso de Solo Lectura a S3


  Las políticas definen las reglas del juego. A continuación, se muestra una
  política JSON estándar que permite a un usuario listar y leer objetos
  únicamente en un bucket de S3 específico, restringiendo cualquier intento de
  modificación o borrado.


  ```json

  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "s3:GetObject",
                  "s3:ListBucket"
              ],
              "Resource": [
                  "arn:aws:s3:::nombre-de-tu-bucket",
                  "arn:aws:s3:::nombre-de-tu-bucket/*"
              ]
          }
      ]
  }

  ```



  ### Referencias


  - **Amazon Web Services:** (s.f.). *AWS Identity and Access Management (IAM)*.
  Sitio web oficial. https://aws.amazon.com/es/iam/

  - **AWS Documentation:** (s.f.). *Prácticas recomendadas de seguridad en IAM*.
  Guía del usuario de IAM.
  https://docs.aws.amazon.com/es_es/IAM/latest/UserGuide/best-practices.html

  - **AWS Whitepapers & Guides:** (s.f.). *Pilar de seguridad: AWS
  Well-Architected Framework*.
  https://docs.aws.amazon.com/es_es/wellarchitected/latest/security-pillar/welcome.html

  - **AWS Documentation:** (s.f.). *Políticas basadas en identidad y políticas
  basadas en recursos*. Guía del usuario de IAM.
  https://docs.aws.amazon.com/es_es/IAM/latest/UserGuide/access_policies_identity-vs-resource.html
uploadTokens: []
revision: 7a437dc94347d3f13bf15a60daca07cf501ddaba92b31b810f9b98d4be37a366
---





La gestión de identidades y accesos (IAM) en Amazon Web Services (AWS) es el pilar fundamental para proteger los recursos y datos en la nube. AWS IAM permite controlar quién está autenticado y tiene autorización para utilizar los servicios, asegurando que cada componente del equipo o sistema tenga exactamente el nivel de acceso que necesita.

### Conceptos Clave de AWS IAM

Para estructurar un entorno seguro, es necesario dominar los cuatro elementos principales del servicio:

* **Usuarios (Users):** Representan a una persona o una aplicación que interactúa con AWS. Cada usuario tiene sus propias credenciales (contraseña para la consola o claves de acceso para la CLI/API).
* **Grupos (Groups):** Son colecciones de usuarios. Permiten aplicar políticas de permisos a múltiples usuarios simultáneamente, facilitando la administración de equipos (por ejemplo, crear un grupo de *Desarrolladores* con acceso a entornos de prueba).
* **Roles:** A diferencia de los usuarios, los roles no tienen credenciales permanentes. Son asumidos temporalmente por usuarios, aplicaciones o servicios de AWS (como instancias EC2 o funciones Lambda) para ejecutar tareas específicas de forma segura.
* **Políticas (Policies):** Documentos en formato JSON que definen los permisos exactos. Se adjuntan a usuarios, grupos o roles para determinar qué acciones pueden realizar sobre qué recursos.

### Mejores Prácticas de Seguridad en AWS

Implementar IAM correctamente requiere seguir principios de seguridad estrictos para evitar vulnerabilidades críticas en la infraestructura.

* **Principio de Menor Privilegio:** Otorga únicamente los permisos estrictamente necesarios para que un usuario o servicio realice su tarea. Evita asignar políticas genéricas como `AdministratorAccess` a menos que sea absolutamente imprescindible.
* **Habilitar Autenticación Multifactor (MFA):** Exige MFA para todos los usuarios con acceso a la consola de administración, especialmente para aquellos con permisos elevados y, obligatoriamente, para la cuenta raíz (Root Account).
* **Priorizar Roles sobre Claves de Acceso:** Para aplicaciones que se ejecutan dentro de AWS, utiliza roles de IAM en lugar de almacenar *Access Keys* estáticas en el entorno de desarrollo. Esto permite una rotación de credenciales automática y segura.
* **Rotación de Credenciales y Auditoría:** Configura políticas que exijan el cambio regular de contraseñas y claves de acceso. Utiliza AWS CloudTrail y IAM Access Analyzer para monitorear continuamente quién accede a qué recursos.

### Ejemplo Práctico: Política de Acceso de Solo Lectura a S3

Las políticas definen las reglas del juego. A continuación, se muestra una política JSON estándar que permite a un usuario listar y leer objetos únicamente en un bucket de S3 específico, restringiendo cualquier intento de modificación o borrado.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::nombre-de-tu-bucket",
                "arn:aws:s3:::nombre-de-tu-bucket/*"
            ]
        }
    ]
}
```


### Referencias

- **Amazon Web Services:** (s.f.). *AWS Identity and Access Management (IAM)*. Sitio web oficial. https://aws.amazon.com/es/iam/
- **AWS Documentation:** (s.f.). *Prácticas recomendadas de seguridad en IAM*. Guía del usuario de IAM. https://docs.aws.amazon.com/es_es/IAM/latest/UserGuide/best-practices.html
- **AWS Whitepapers & Guides:** (s.f.). *Pilar de seguridad: AWS Well-Architected Framework*. https://docs.aws.amazon.com/es_es/wellarchitected/latest/security-pillar/welcome.html
- **AWS Documentation:** (s.f.). *Políticas basadas en identidad y políticas basadas en recursos*. Guía del usuario de IAM. https://docs.aws.amazon.com/es_es/IAM/latest/UserGuide/access_policies_identity-vs-resource.html
