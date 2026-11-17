import fs from 'fs';
import http from 'isomorphic-git/http/node/index.cjs';
import git from 'isomorphic-git';

async function pushToGithub() {
  const dir = process.cwd();
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  console.log('Attempting git push to remote origin...');
  if (!token) {
    console.log('No GITHUB_TOKEN or GH_TOKEN detected in environment.');
    console.log('Authentication is required to push to https://github.com/ver-dev9/Universe-Within.git');
    process.exit(2);
  }

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: token }),
  });

  console.log('Push completed successfully:', pushResult);
}

pushToGithub().catch(err => {
  console.error('Git push failed:', err.message);
  process.exit(1);
});
