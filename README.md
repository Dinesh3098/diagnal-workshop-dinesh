# AWS Serverless Application for Managing Animal Data (diagnal-workshop-dinesh)

Tools and Technologies Used
* AWS Services:
  - S3 (Simple Storage Service)
  - DynamoDB
  - Lambda
  - AppSync
* Node.js
* Serverless Framework
* GraphQL

NPM Packages Used
* aws-sdk: AWS SDK for JavaScript
* csv-parser: The csv-parse package is a parser converting CSV text input into arrays or objects.

# Overview
- This project sets up an AWS-based service to manage animal data using serverless architecture. The service involves fetching data from an S3 bucket, saving it to a DynamoDB table, and providing a GraphQL API to retrieve and upload data.

Key Components
1. S3 Bucket: Stores animal data files with public access for read operations.
2. DynamoDB: Stores processed animal data.
3. Lambda Functions:
- ProcessAnimalCSVAndUpload: Fetches data from S3 and saves it to DynamoDB upon file upload.
- GetAnimalDataUsingGraphql: Retrieves saved data from DynamoDB.
- Returns3PresignedURLtoUploadFile: Generates an S3 presigned URL for file uploads.
4. AWS AppSync: Provides a GraphQL API for interacting with the data.

Setup Instructions
Step 1: Setting Up S3 with Public Access
1. Create an S3 Bucket:
- Go to the S3 service in the AWS Management Console.
- Click "Create bucket" and configure the settings:
  * Enter a unique bucket name.
  * Choose the desired region.
  * Uncheck "Block all public access".
  * Acknowledge the public access and create the bucket.
 
2. Configure Bucket Policy:

- Go to the bucket properties.
- Under the "Permissions" tab, click "Bucket Policy".
- Add the following policy to allow public read access:
  ```
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::AWSAccountID:root"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
  }
  ```

- Replace your-bucket-name with your S3 bucket name and save the policy.
- Replace AWSAccountID with your AWS account ID.

Step 2: Creating the DynamoDB Table
1. Create a DynamoDB Table:
-  Go to the DynamoDB service in the AWS Management Console.
-  Click "Create table" and configure the settings:
    * Enter a table name (e.g., AnimalData).
    * Set the primary key as animal_name  (String).
    * Create the table.

Step 3: Writing Lambda Functions
Lambda Function 1: Fetch Data from S3 and Save to DynamoDB (ProcessAnimalCSVAndUpload)
1. Create the Lambda Function:
* In the Lambda console, click "Create function".
* Choose "Author from scratch", enter the function name ProcessAnimalCSVAndUpload, and select Node.js 16.x as the runtime.
* Create a new role with basic Lambda permissions.

2. Add S3 Trigger:
* In the function configuration, add an S3 trigger:
* Select the S3 bucket.
* Set the event type to "ObjectCreated".

3. Deploy the Function:
* Save and deploy the Lambda function.

Lambda Function 2: Retrieve Data from DynamoDB (GetAnimalDataUsingGraphql)
1. Create the Lambda Function:
* Follow similar steps as above to create a new function named GetAnimalDataUsingGraphql.

Lambda Function 3: Generate S3 Presigned URL (Returns3PresignedURLtoUploadFile)
1. Create the Lambda Function:
* Follow similar steps to create a new function named Returns3PresignedURLtoUploadFile.

Step 4: Setting Up AWS AppSync with GraphQL
1. Create an API in AWS AppSync:
- Go to the AppSync service in the AWS Management Console.
- Click "Create API" and choose "Create from scratch".
- Enter an API name (e.g., AnimalAPI).
2. Define the GraphQL Schema:
  - Refer to src/graphqlSchema in repon
 
3. Attach Resolvers:
- In the AppSync console, go to the "Schema" section.
- Click "Attach Resolver" for the getAnimalData query and attach it to the GetAnimalDataUsingGraphql Lambda function.
- Click "Attach Resolver" for the generateUploadURL query and attach it to the Returns3PresignedURLtoUploadFile Lambda function.

# API with result and example

1. getAnimalByTrail API
```
Input: getAnimalByTrail

query MyQuery {
    getAnimalByTrail(filter: {class_number: 1, trail: "Domestic"}) {
      items {
        animal_name
        class_type
      }
    }
  }

Output:

  {
  "data": {
    "getAnimalByTrail": {
      "items": [
        {
          "animal_name": "calf",
          "class_type": "Mammal"
        },
        {
          "animal_name": "cavy",
          "class_type": "Mammal"
        }
      ]
    }
  }
}
```
- With all filter
```
Input: With all filter

query MyQuery {
  getAnimalByTrail(filter: {class_number: 4}) {
    items {
      animal_name
      class_type
    }
  }
}

Output:

{
  "data": {
    "getAnimalByTrail": {
      "items": [
        {
          "animal_name": "dogfish",
          "class_type": "Fish"
        },
        {
          "animal_name": "carp",
          "class_type": "Fish"
        },
        {
          "animal_name": "chub",
          "class_type": "Fish"
        },
        {
          "animal_name": "catfish",
          "class_type": "Fish"
        },
        {
          "animal_name": "bass",
          "class_type": "Fish"
        }
      ]
    }
  }
}
```
2. getAnimalClassSummary

```
Input: Example 1

query MyQuery {
  getAnimalClassSummary {
    items {
      class_number
      class_type
      number_of_animals
    }
  }
}

Output: 

{
  "data": {
    "getAnimalClassSummary": {
      "items": [
        {
          "class_number": 2,
          "class_type": "Bird",
          "number_of_animals": 2
        },
        {
          "class_number": 4,
          "class_type": "Fish",
          "number_of_animals": 5
        },
        {
          "class_number": 1,
          "class_type": "Mammal",
          "number_of_animals": 9
        },
        {
          "class_number": 7,
          "class_type": "Invertebrate",
          "number_of_animals": 3
        }
      ]
    }
  }
}
```
```
Input:  Example 2

query MyQuery {
  getAnimalClassSummary {
    items {
      class_number
      number_of_animals
    }
  }
}

Output: 
{
  "data": {
    "getAnimalClassSummary": {
      "items": [
        {
          "class_number": 2,
          "number_of_animals": 2
        },
        {
          "class_number": 4,
          "number_of_animals": 5
        },
        {
          "class_number": 1,
          "number_of_animals": 9
        },
        {
          "class_number": 7,
          "number_of_animals": 3
        }
      ]
    }
  }
}
```
3. gets3PresignedURLtoUploadFile

```
Input:  
query MyQuery {
  gets3PresignedURLtoUploadFile(path: "animals.csv") {
    path
    uploadURL
  }
}

Output:

{
  "data": {
    "gets3PresignedURLtoUploadFile": {
      "path": "animals.csv",
      "uploadURL": "https://diagnal-data.s3.ap-south-1.amazonaws.com/animals.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA6GBMFFL4KCUP5DVI%2F20240526%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240526T173500Z&X-Amz-Expires=60&X-Amz-Signature=4fabbddd4695cdacda7f685955943c3741bedaa0acd5eaf2b3ab8cd475a56d8a&X-Amz-SignedHeaders=host"
    }
  }
}
```

# Conclusion
- This setup provides a comprehensive solution to manage animal data using AWS services. The system allows data to be fetched from an S3 bucket, saved to DynamoDB, and accessed or uploaded via a GraphQL API. Follow the instructions carefully to ensure each component is configured correctly for seamless operation.
