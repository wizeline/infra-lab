# BlitzJS template

This template provides workflows that can be used in a [Blitz](https://blitzjs.com) project.

## Workflows provided

- Deploy app to an Amazon Lightsail instance whenever changes are pushed to the `main` or `master` branch.
- Run unit tests whenever a PR is created or new commits are pushed.

## How to use

To include the template in your Blitz repo, follow these steps:

1. Open a terminal
2. Navigate to your Blitz project directory
3. Run the following command:

   ```sh
   curl https://raw.githubusercontent.com/wizeline/infra-lab/main/install.js | node - blitzjs
   ```

You'll also need to set the following secrets in your GitHub repository:

| Secret name                      | Value                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `DEV_ENV`                        | The contents of the `.env` file for the development stage                          |
| `PIPELINE_AWS_ACCESS_KEY_ID`     | The AWS Access Key ID of a user with full access to Lightsail, DynamoDB and S3     |
| `PIPELINE_AWS_SECRET_ACCESS_KEY` | The AWS Secret Access Key of a user with full access to Lightsail, DynamoDB and S3 |
| `PIPELINE_AWS_REGION`            | The AWS Region where the resources will be created                                 |
| `SSH_PRIVATE_KEY`                | The Amazon Lightsail SSH key private key to connect to the newly created instance  |
