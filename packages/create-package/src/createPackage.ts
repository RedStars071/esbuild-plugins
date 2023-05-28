import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chdir } from 'node:process';
import { copy } from 'fs-extra';
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

	console.log(join(packageDir, 'src'));

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

	// Copy default files over

	await copy(join(templateDir, 'default', 'tsconfig.json'), join(packageDir, 'src'));
	await copy(join(templateDir, 'default', 'tsup.config.ts'), packageDir);
	await copy(join(templateDir, 'default', 'tsconfig.eslint.json'), packageDir);
}
