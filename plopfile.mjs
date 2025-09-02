
export default function (plop) {
    plop.setHelper('dashCase', (text) => {
        return text.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'');
    })

plop.setGenerator('app', {
    description: 'Generate a new Feature application',
    prompts: [
        {
            type: 'input',
            name: 'team',
            message: 'Team name (lowercase):',
            validate: (input) => {
                if (!input) return 'Team name is required';
                if (!/^[a-z]+$/.test(input)) {
                    return 'Team name must be lowercase letters';
                }

                return true;
            }
        },
        {
            type: 'input',
            name: 'appName',
            message: 'What is your application name? (kebab-case): ',
            validate: (input) => {
                if (!input) return 'App name is required';
                if (!/^[a-z]+(-[a-z]+)*$/.test(input)) {
                    return 'App must be kebab-case';
                }

                return true;
            }
        },
        {
            type: 'input',
            name: 'description',
            message: 'Provide a brief description of your application:',
            default: 'A new feature application'
        },
        {
            type: 'input',
            name: 'routePath',
            message: 'What route should this app be accessible at? (e.g., /pe/home/):',
            default: (answers) => answers.appName,
            validate: (input) => {
                if (!input) return 'Route is required';
                if (!input.startsWith('/')) return 'Route path must start with /';

                return true;
            }
        },
        {
            type: 'input',
            name: 'port',
            message: 'Dev server port:',
            default: 3100,
            validate: (input) => {
                const port = parseInt(input);
                if (isNaN(port) || port < 3000 || port > 9999) {
                    return 'Port must be between 3000 and 9999';
                }

                return true;
            }
        }
    ],
    actions: [
        {
            type: 'add',
            destination: 'apps/{{team}}--{{appName}}/package.json',
            templateFiles: 'plop-templates/app/package.json.hbs',
        },
        {
            type: 'add',
            destination: 'apps/{{team}}--{{appName}}/index.html',
            templateFiles: 'plop-templates/app/index.html.hbs',
        },
        {
            type: 'add',
            destination: 'apps/{{team}}--{{appName}}/src/main.tsx',
            templateFiles: 'plop-templates/app/src/main.tsx.hbs',
        },
        {
            type: 'add',
            destination: 'apps/{{team}}--{{appName}}/src/App.tsx',
            templateFiles: 'plop-templates/app/src/App.tsx.hbs',
        },
        {
            type: 'add',
            destination: 'apps/{{team}}--{{appName}}/src/pages/{{pascalCase appName}}Page.tsx',
            templateFiles: 'plop-templates/app/src/pages/Page.tsx.hbs',
        },
        // Need to update this because it's not updating the file properly
        {
            type: 'modify',
            path: 'packages/app-registry/src/registry.ts',
            pattern: /(\s*)\/\/ PLOP_INJECT_APP/,
            template: `.\n {\n
                                id: \'{{appName}}\',\n
                                name: \'{{appName}}\',\n
                                title: \'{{title}}\',\n
                                path: \'{{routePath}}\',\n
                                team: \'{{team}}\',\n
                                component: lazy(() => import(\'@{{team}}/{{appName}}/src/pages/{{pascalCase appName}}Page\')),\n
                                description: \'{{description}}\',\n
                            }$1// PLOP_INJECT_APP`,
        },
        function(answers, config, plop) {
            const path = require('path');
            const fs = require('fs');
            const registryPath = path.join(process.cwd(), 'packages/app-registry/src/registry.ts');
            const registryContent = fs.readFileSync(registryPath, 'utf8');

            if (!registryContent.includes(`id: '${answers.team}'`)) {
                const teamPattern = /(\s*)\/\/ PLOP_INJECT_APP/;
                const teamTemplate = `.\n {\n
                                id: '${answers.team}',\n
                                name: '${answers.team}',\n
                                displayName: '${answers.team.charAt(0).toUpperCase() + answers.team.slice(1)} Team',\n
                                apps: ['${answers.appName}']\n
                            }$1// PLOP_INJECT_TEAM`;
                const updatedContent = registryContent.replace(teamPattern, teamTemplate);
                fs.writeFileSync(registryPath, updatedContent);
                return 'Team added to registry';

            } else {
                const teamRegex = new RegExp(`(id: '${answers.team}'[^}]+apps: \\[)([^\\]]*)(\\])`, 's');
                const updatedContent = registryContent.replace(teamRegex, (match, p1, p2, p3) => {
                    const apps = p2.trim() ? `${p2}, '${answers.appName}'` : `'${answers.appName}'`;
                    return `${p1}${apps}${p3}`;
                });
                fs.writeFileSync(registryPath, updatedContent);
                return 'Team apps updated in registry';
            }
        },
        {
            type: 'modify',
            path: 'apps/platform-shell/vite.config.ts',
            pattern: /(\s*)preserveSymlinks: true,/,
            template: ` '@{{team}}/{{appName}}': path.resolve(__dirname, '../{{team}}-{{appName}}'),\n$1preserveSymlinks: true,`,
        },
        {
            type: 'modify',
            path: 'apps/platform-shell/tsconfig.json',
            pattern: /(\s*)"@platform\/shell\/\*": \["\.\*"\]/,
            template: `$1"@platform/shell/*": ["./*"],\n$1"@{{team}}/{{appName}}/*": ["../{{team}}-{{appName}}/*"]`,
        },
        function () {
            return `App successfully created. make sure to npm install and then npm run dev`
        }


    ]
})
}


