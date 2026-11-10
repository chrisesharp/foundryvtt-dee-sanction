import fs from 'fs-extra';
import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { rollup } from 'rollup';
import rollupConfig from './rollup.config.js';
import { compilePack } from '@foundryvtt/foundryvtt-cli';

/********************/
/*  CONFIGURATION   */
/********************/

const name = 'dee';
const sourceDirectory = './src';
const distDirectory = './dist';
const stylesDirectory = `${sourceDirectory}/scss`;
const stylesExtension = 'scss';
const sourceFileExtension = 'mjs';
const staticFiles = ['assets', 'lang', 'templates', 'ui', 'system.json'];
const packsDirectory = `${sourceDirectory}/packs`;

/********************/
/*      BUILD       */
/********************/

let cache;
/**
 * Build the distributable JavaScript code
 */
async function buildCode() {
  const bundle = await rollup({ ...rollupConfig, cache });
  cache = bundle.cache;
  await bundle.write(rollupConfig.output);
  await bundle.close();
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${stylesDirectory}/${name}.${stylesExtension}`)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(`${distDirectory}/css`));
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
    }
  }
}

/**
 * Build packs
 */
async function buildPacks() {
  const dirs = fs
    .readdirSync(packsDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  if (dirs.length) {
    await Promise.all(
      dirs.map(async (dir) => await compilePack(`${packsDirectory}/${dir}`, `${distDirectory}/packs/${dir}`)),
    );
  }
}

/**
 * Watch for changes for each build step
 */
function watch() {
  gulp.watch(`${sourceDirectory}/**/*.${sourceFileExtension}`, { ignoreInitial: false }, buildCode, copyFiles);
  gulp.watch(`${stylesDirectory}/**/*.${stylesExtension}`, { ignoreInitial: false }, buildStyles, copyFiles);
  gulp.watch(
    staticFiles.map((file) => `${sourceDirectory}/${file}`),
    { ignoreInitial: false },
    copyFiles,
  );
}

const build = gulp.series(clean, gulp.parallel(buildCode, buildStyles, buildPacks, copyFiles));

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
async function clean() {
  const files = [...staticFiles, 'module', 'packs', 'css'];

  if (fs.existsSync(`${stylesDirectory}/${name}.${stylesExtension}`)) {
    files.push('styles');
  }

  console.log(' ', 'Files to clean:');
  console.log('   ', files.join('\n    '));

  for (const filePath of files) {
    await fs.remove(`${distDirectory}/${filePath}`);
  }
}

/********************/
/*       LINK       */
/********************/

/**
 * Get the data path of Foundry VTT based on what is configured in `foundryconfig.json`
 */
function getDataPath() {
  const config = fs.readJSONSync('foundryconfig.json');

  if (config?.dataPath) {
    if (!fs.existsSync(path.resolve(config.dataPath))) {
      throw new Error('User Data path invalid, no Data directory found');
    }

    return path.resolve(config.dataPath);
  } else {
    throw new Error('No User Data path defined in foundryconfig.json');
  }
}

/**
 * Link build to User Data folder
 */
async function link() {
  let destinationDirectory;
  if (fs.existsSync(path.resolve(sourceDirectory, 'system.json'))) {
    destinationDirectory = 'systems';
  } else {
    throw new Error('Could not find system.json');
  }

  const linkDirectory = path.resolve(getDataPath(), 'Data', destinationDirectory, name);

  const argv = yargs(hideBin(process.argv)).option('clean', {
    alias: 'c',
    type: 'boolean',
    default: false,
  }).argv;
  const clean = argv.c;

  if (clean) {
    console.log(`Removing build in ${linkDirectory}.`);

    await fs.remove(linkDirectory);
  } else if (!fs.existsSync(linkDirectory)) {
    console.log(`Linking dist to ${linkDirectory}.`);
    await fs.ensureDir(path.resolve(linkDirectory, '..'));
    await fs.symlink(path.resolve(distDirectory), linkDirectory);
  }
}

export { watch, build, clean, link };
