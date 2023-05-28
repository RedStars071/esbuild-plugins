import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chdir } from 'node:process';
import fs from 'fs-extra';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import templateJSON from './template/template.package.json' assert { type: 'json' };

interface LabelerData {
	color: string;
	name: string;
}

export async function createPackage(packageName: string, packageDescription?: string) {
	const packageDir = join('packages', packageName);

	// Make directory for package
	await mkdir(packageDir);

	// Change to subdirectory
	chdir(packageDir);

	// Create folder structure
	await mkdir(join(packageDir, 'src'));

	const templateDir = join(process.cwd(), 'packages', 'create-package', 'src', 'template');

	// Create files
	await writeFile(join(packageDir, 'src', 'index.ts'), `console.log('Hello, from @Redstars071/esbuild-plugins/${packageName}');`);

	const packageJSON = {
		...templateJSON,
		homepage: templateJSON.homepage.replace('{name}', packageName),
		name: templateJSON.name.replace('{name}', packageName),
		description: packageDescription ?? ''
	};
	// Edit repository directory
	packageJSON.repository.directory = packageJSON.repository.directory.replace('{name}', packageName);

	// Create package.json
	await writeFile(join(packageDir, 'package.json'), JSON.stringify(packageJSON, null, 2));

	// Update cliff.toml
	const cliffTOML = (await readFile(join(templateDir, 'cliff.toml'), 'utf8')).replace('{name}', packageName);

	await writeFile(join(packageDir, 'cliff.toml'), cliffTOML);

	const cliffYAML = await readFile(join(templateDir, '.cliff-jumperrc.yml'), 'utf8');
	// Update .cliff-jumperrc.json
	const newCliffJumperYAML = {
		...parseYAML(cliffYAML),
		name: packageName,
		packagePath: `packages/${packageName}`
	};

	await writeFile(join(packageDir, '.cliff-jumperrc.yml'), JSON.stringify(newCliffJumperYAML, null, 2));

	// Move to github directory
	chdir(join('..', '..', '.github'));

	const labelsYAML = parseYAML(await readFile('.github/labels.yml', 'utf8')) as LabelerData[];
	labelsYAML.push({ name: `packages:${packageName}`, color: 'fbca04' });

	labelsYAML.sort((a, b) => a.name.localeCompare(b.name));

	await writeFile('.github/labels.yml', stringifyYAML(labelsYAML));

	// Move back to root
	chdir('..');

	// fs default files over

	await fsFiles(join(templateDir, 'default'), packageDir);
}

async function fsFiles(sourceDir: string, destinationDir: string) {
	// Crea la directory di destinazione se non esiste
	await fs.ensureDir(destinationDir);

	const files = await fs.readdir(sourceDir);

	for (const file of files) {
		// Escludi il file tsconfig.json
		const sourcePath = join(sourceDir, file);
		const destinationPath = join(file === 'tsconfig.json' ? join(destinationDir, 'src') : destinationDir, file);

		// Copia e sovrascrivi i file
		await fs.copy(sourcePath, destinationPath, { overwrite: true });
	}
}
