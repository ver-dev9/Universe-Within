import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git';

async function setupGitRepo() {
  const dir = process.cwd();
  console.log('Initializing git repository in:', dir);

  // 1. Initialize .git repository
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('Git repo initialized with default branch: main');

  // 2. Add remote origin
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/ver-dev9/Universe-Within.git',
      force: true,
    });
    console.log('Remote origin set to: https://github.com/ver-dev9/Universe-Within.git');
  } catch (e) {
    console.log('Remote already configured or updated:', e.message);
  }

  // 3. Scan and stage files recursively, respecting .gitignore patterns
  const ignorePatterns = [
    'node_modules',
    'dist',
    '.git',
    '_aerolearn_backup',
    '.DS_Store',
    'Thumbs.db',
  ];

  function getFiles(currentDir, relativeBase = '') {
    let results = [];
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignorePatterns.includes(entry.name)) continue;
      const relPath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        results = results.concat(getFiles(fullPath, relPath));
      } else if (entry.isFile()) {
        results.push(relPath);
      }
    }
    return results;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Staging ${filesToAdd.length} files...`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }
  console.log('All files staged successfully.');

  // 4. Create initial commit
  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: launch UNIVERSE WITHIN — A Journey Beyond the Visible 3D website',
    author: {
      name: 'ver-dev9',
      email: 'ver-dev9@users.noreply.github.com',
    },
  });

  console.log('Commit successfully created! Commit SHA:', sha);
}

setupGitRepo().catch(console.error);
