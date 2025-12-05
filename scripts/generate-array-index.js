// SPDX-License-Identifier: AGPL-3.0-only
import { readdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const arrayDir = join(__dirname, '../src/namespaces/array');
const gettersDir = join(arrayDir, 'getters');
const methodsDir = join(arrayDir, 'methods');
const indexFile = join(arrayDir, 'array.index.ts');
const objectFile = join(arrayDir, 'PineArrayObject.ts');

async function generateIndex() {
    try {
        // Read getters directory (if it exists)
        let getters = [];
        try {
            const getterFiles = await readdir(gettersDir);
            getters = getterFiles.filter((f) => f.endsWith('.ts') && f !== 'array.index.ts' && f !== 'index.ts').map((f) => f.replace('.ts', ''));
        } catch (error) {
            // Getters directory doesn't exist, that's fine
            getters = [];
        }

        // Read methods directory
        const methodFiles = await readdir(methodsDir);
        const methods = methodFiles
            .filter((f) => f.endsWith('.ts'))
            .map((f) => {
                const name = f.replace('.ts', '');
                // Handle 'new' which is a reserved keyword - file is named 'new.ts' but exports as 'new_fn'
                return name === 'new' ? { file: name, export: 'new_fn', classProp: 'new' } : { file: name, export: name, classProp: name };
            });

        const staticMethods = ['new', 'new_bool', 'new_float', 'new_int', 'new_string', 'from', 'param'];

        // --- Generate PineArrayObject.ts ---
        const objectMethods = methods.filter(m => !staticMethods.includes(m.classProp));
        
        const objectImports = objectMethods.map(m => 
            `import { ${m.export} as ${m.export}_factory } from './methods/${m.file}';`
        ).join('\n');

        const objectMethodDefs = objectMethods.map(m => {
            return `    ${m.classProp}(...args: any[]) {
        return (${m.export}_factory(this.context) as any)(this, ...args);
    }`;
        }).join('\n\n');

        const objectClassCode = `// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:array-index

${objectImports}

export class PineArrayObject {
    constructor(public array: any, public context: any) {}

    toString(): string {
        return 'PineArrayObject:' + this.array.toString();
    }

${objectMethodDefs}
}
`;
        await writeFile(objectFile, objectClassCode, 'utf-8');
        console.log(`✅ Generated ${objectFile}`);

        // --- Generate array.index.ts ---

        // Generate imports
        const getterImports = getters.length > 0 ? getters.map((name) => `import { ${name} } from './getters/${name}';`).join('\n') : '';
        
        // Imports for index file
        let indexImports = `import { PineArrayObject } from './PineArrayObject';`;
        
        // Import static method factories
        const staticMethodImports = methods
            .filter(m => staticMethods.includes(m.classProp))
            .map(m => `import { ${m.export} } from './methods/${m.file}';`)
            .join('\n');
        
        indexImports += '\n' + staticMethodImports;

        // Generate getters object (for type definitions mostly, or we just inline)
        // In the previous version, getters were added via Object.defineProperty
        
        const getterInstall = getters.length > 0 ? `    // Install getters
    const getters = {
${getters.map(g => `      ${g}: ${g}`).join(',\n')}
    };
    Object.entries(getters).forEach(([name, factory]) => {
      Object.defineProperty(this, name, {
        get: factory(context),
        enumerable: true
      });
    });` : '';

        // Generate methods installation
        const methodInstall = methods.map(m => {
            if (staticMethods.includes(m.classProp)) {
                return `    this.${m.classProp} = ${m.export}(context);`;
            }
            return `    this.${m.classProp} = (id: PineArrayObject, ...args: any[]) => id.${m.classProp}(...args);`;
        }).join('\n');

        // Generate type declarations
        // For 'new', we can use the return type of new_fn factory result.
        // For others, it's hard to get exact types without importing all factories.
        // We'll define them as any for now or try to be smart.
        // To allow 'any' implicit types, we might need to be careful.
        // But wait, if we don't declare them, TS might complain about missing properties if strict.
        // The previous version declared them.
        // Let's declare 'new' properly and others as Function or any for now to avoid import hell,
        // OR we import them just for types.
        // But the goal was to simplify array.index.ts.
        // Let's rely on the dynamic nature (no explicit type decls for methods other than new?)
        // The previous file had explicit type decls.
        // "readonly name: ReturnType<ReturnType<typeof getters.name>>;"
        // "name: ReturnType<typeof methods.name>;"
        
        // If we want to keep types, we need to import the factories.
        // But we are changing implementation to delegation.
        // delegating `(id, ...args) => id.method(...args)` has the same signature as the factory result roughly.
        
        // Let's stick to a simpler version first.
        
        const classCode = `// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:array-index

export { PineArrayObject } from './PineArrayObject';
${getterImports ? getterImports + '\n' : ''}
${indexImports}

export class PineArray {
  [key: string]: any;

  constructor(private context: any) {
${getterInstall}
    // Install methods
${methodInstall}
  }
}

export default PineArray;
`;

        await writeFile(indexFile, classCode, 'utf-8');
        console.log(`✅ Generated ${indexFile}`);
        if (getters.length > 0) {
            console.log(`   - ${getters.length} getters: ${getters.join(', ')}`);
        }
        console.log(`   - ${methods.length} methods: ${methods.map(m => m.classProp).join(', ')}`);
    } catch (error) {
        console.error('Error generating Array index:', error);
        process.exit(1);
    }
}

generateIndex();
