#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

/**
 * A generic wrapper around the `https.get` method
 * @param {string} url The URL to fetch
 * @param {string} user A GitHub user name
 * @param {string} token A GitHub Personal Access Token to get access to the `wizeline/infra-lab` repo
 * @returns A string representing the response body.
 */
function getRequest(url, user, token) {
  // Remove the `http://` or `https://` part from the url
  const sanitizedURL = url.replace(/https?:\/\//, '');
  const firstSlashIdx = sanitizedURL.indexOf('/');
  const host = sanitizedURL.slice(0, firstSlashIdx);
  const path = sanitizedURL.slice(firstSlashIdx);

  return new Promise((resolve, reject) => {
    https.get(
      {
        host,
        path,
        auth: `${user}:${token}`,
        headers: { 'User-Agent': 'infra-lab' },
      },
      (response) => {
        let output = '';

        response.on('data', (chunk) => {
          output += chunk;
        });

        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            output,
          });
        });

        response.on('error', (err) => {
          reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            error: err,
          });
        });
      }
    );
  });
}

/**
 * Recursivelly traverses and locally recreates the directory structure of an specified template from the `infra-lab` repo.
 *
 * This method makes use of the `Get Repository Content` endpoint from the GitHub API, which you can read more about here:
 * https://docs.github.com/en/rest/reference/repos#get-repository-content
 * @param {string} url The URL to fetch
 * @param {string} user A GitHub user name
 * @param {string} token A GitHub Personal Access Token to get access to the `wizeline/infra-lab` repo
 */
async function traverseTemplateStructure(url, user, token) {
  const response = await getRequest(url, user, token);
  const jsonResponse = JSON.parse(response.output);

  if (response.statusCode != 200) {
    throw new Error(
      `
The contents of ${url} could not be accessed.

This was the error message returned by the GitHub API:
${jsonResponse.message}

Some steps that may help you solve this problem are:
1. Verify that you're using the correct template (e.g. blitzjs instead of blitz)
2. Verify that your username is spelt correctly and that it has access to the https://github.com/wizeline/infra-lab repo
3. Verify that you are entering your Personal Access Token correctly
4. If you're using a specific ref, verify that it exists in the remote`
    );
  }

  for (const item of jsonResponse) {
    // Remove the parent directory from the directory path
    const sanitizedPath = item.path.replace(/^\w+\//, '');

    if (item.type === 'dir') {
      const directoryExists = fs.existsSync(sanitizedPath);
      if (!directoryExists) {
        fs.mkdirSync(sanitizedPath, { recursive: true });
      }

      await traverseTemplateStructure(item.url, user, token);
    } else if (item.type === 'file') {
      const fileResponse = await getRequest(item.download_url, user, token);
      fs.writeFileSync(sanitizedPath, fileResponse.output);
    }
  }
}

async function main() {
  const [, , template, username, PAT, ref] = process.argv;

  try {
    if (ref) {
      await traverseTemplateStructure(
        `https://api.github.com/repos/wizeline/infra-lab/contents/${template}?ref=${ref}`,
        username,
        PAT
      );
    } else {
      await traverseTemplateStructure(
        `https://api.github.com/repos/wizeline/infra-lab/contents/${template}`,
        username,
        PAT
      );
    }
  } catch (error) {
    console.error(error.message);
  }
}

main();
