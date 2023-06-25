import jsonfile from 'jsonfile';
import listPaths from 'list-paths';
import {moveFile} from 'move-file';
import {rimraf} from 'rimraf';

async function updatePackage() {
    const pkg = await jsonfile.readFile('./package.json');
    const exports = {}
    const paths = await listPaths('./src', { includeFiles: false});
    paths.forEach(path => {
        const name = path === './src/' ? '.' : '.' + path.replace('./src', '').replace(/\/$/, ''); 
        const route = path === './src/' ? '/' : path.replace('./src', ''); 
        exports[name] = {
            "types": `./dist${route}index.d.ts`,
            "import": `./dist${route}index.mjs`,
            "require": `./dist${route}index.cjs`
        }
    });

    pkg.exports = exports;
    await jsonfile.writeFile('./package.json', pkg, { spaces: 2 });
    
    const files = await listPaths('./dist', { includeFiles: true }).filter(file => file.indexOf('.cjs') > -1);
    files.forEach(async file => {
        await moveFile(file, file.replace('/cjs/', '/'));
    })

    await rimraf('./dist/cjs');
}

updatePackage();