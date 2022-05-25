# BlitzJS template

This template provides workflows that can be used in a [Blitz](https://blitzjs.com) project.

## Workflows provided

- Deploy app to an Amazon Lightsail instance whenever changes are pushed to the `main` or `master` branch.
- Run unit tests whenever a PR is created or new commits are pushed.

## How to use

To include the template in your Blitz repo, follow these steps:  
**important:** your repository must not contain uppercase characters for this scripts to work. This is because the terraform state includes the repository name and it is saved in S3 which does not support uppercase characters in a bucket name.

1. Open a terminal
2. Navigate to your Blitz project directory
4. Run the following command:

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

4. The `DEV_ENV` contents can start with:

```
DATABASE_URL="file:./db.sqlite"
SESSION_SECRET_KEY=random_key_of_at_least_32_characters
```

## How to check the logs

If you want to see the server logs, log into the lightsail instance using SSH and run:

```
PATH="$PATH:$(yarn global bin)"
export PATH
pm2 logs
```
