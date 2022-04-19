#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

/**
 * A generic wrapper around the `https.get` method
 * @param {string} url The URL to fetch
 * @returns A string representing the response body.
 */
function getRequest(url) {
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
        headers: { 'User-Agent': 'wizeline-infra-lab' },
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
 * Recursively traverses and locally recreates the directory structure of a specified template from the `infra-lab` repo.
 *
 * This method makes use of the `Get Repository Content` endpoint from the GitHub API, which you can read more about here:
 * https://docs.github.com/en/rest/reference/repos#get-repository-content
 * @param {string} url The URL to fetch
 */
async function traverseTemplateStructure(url) {
  const response = await getRequest(url);
  const jsonResponse = JSON.parse(response.output);

  if (response.statusCode != 200) {
    throw new Error(
      `
The contents of ${url} could not be accessed.

This was the error message returned by the GitHub API:
${jsonResponse.message}

Some steps that may help you solve this problem are:
1. Verify that you're using the correct template (e.g. blitzjs instead of blitz)
2. If you're using a specific ref, verify that it exists in the remote`
    );
  }

  for (const item of jsonResponse) {
    // Remove the parent directory from the directory path
    const sanitizedPath = item.path.replace(/^\w+\//, '');

    if (item.type === 'dir') {
      // If item is a directory, create the directory in the current project if it doesn't exist.
      // Then, recursively traverse the contents of the directory
      const directoryExists = fs.existsSync(sanitizedPath);
      if (!directoryExists) {
        fs.mkdirSync(sanitizedPath, { recursive: true });
      }

      await traverseTemplateStructure(item.url);
    } else if (item.type === 'file') {
      // If item is a file, get the contents of the file and write it to the directory it belongs
      const fileResponse = await getRequest(item.download_url);
      fs.writeFileSync(sanitizedPath, fileResponse.output);
    }
  }
}

async function main() {
  const [, , template, ref] = process.argv;

  try {
    if (ref) {
      await traverseTemplateStructure(
        `https://api.github.com/repos/wizeline/infra-lab/contents/${template}?ref=${ref}`
      );
    } else {
      await traverseTemplateStructure(
        `https://api.github.com/repos/wizeline/infra-lab/contents/${template}`
      );
    }
  } catch (error) {
    console.error(error.message);
  }
}

main();
