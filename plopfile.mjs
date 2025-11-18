
export default function (plop) {
    plop.setHelper('dashCase', (text) => {
        return text.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'');
    });

plop.setGenerator('app', {
    description: 'Generate a new Feature application',
    prompts: [
        {
            type: 'list',
            name: 'team',
            message: 'Select your Team',
            choices: ['PE', 'R2', 'IOD']
        },
        {
            type: 'input',
            name: 'appName',
            message: 'What is your feature application name? (kebab-case): ',
            validate: (input) => {
                if (!input) return 'Feature application name is required';
                if (!/^[a-z]+(-[a-z]+)*$/.test(input)) {
                    return 'App must be kebab-case';
                }

                return true;
            }
        },
        {
            type: 'input',
            name: 'appDescription',
            message: 'Provide a brief description of your feature application:',
            default: 'A new feature application'
        },
        {
            type: 'list',
            name: 'navMenu',
            message: 'Which Menu item would you like your application to be under in the Nav Bar?',
            choices: ['Portfolio Management', 'Research & Analysis', 'Risk & Performance', 'Compliance', 'Client Management', 'Support']
        },
        {
            type: 'list',
            name: 'navSubMenu',
            message: 'Which Sub Menu would you like your application to be under from the Nav Menu that was selected?',
            choices: (answers) => {
                    switch (answers.navMenu) {
                        case 'Portfolio Management':  
                            return ['Aladdin Portfolio Management', 'Investment Management Solutions'];
                        case 'Research & Analysis':
                            return ['Fundamental', 'ESG', 'Market', 'Other'];
                        case 'Risk & Performance':
                            return ['Performance'];
                        case 'Compliance':
                            return ['Research', 'Governance', 'Regulations'];
                        case 'Client Management':
                            return ['Research'];
                        case 'Support':
                            return ['General'];
                        default:
                            return [];
                    }
                }
        },
        {
            type: 'input',
            name: 'routePath',
            message: 'What route should this feature application be accessible at? (e.g., /pe/appA/):',
            default: (answers) => answers.appName,
            validate: (input) => {
                if (!input) return 'Route is required';
                if (!input.startsWith('/')) return 'Route path must start with /';

                return true;
            }
        },
                {
            type: 'list',
            name: 'highestEnv',
            message: 'Highest Env the feature should be displayed',
            choices: ['sandbox', 'development', 'qa', 'production']
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
    actions: (answers) => {
        const navMenuToFileMap = {
            'Portfolio Management': 'portfolioManagementApps',
            'Research & Analysis': 'researchAnalysisApps',
            'Risk & Performance': 'riskPerformanceApps',
            'Compliance': 'complianceApps',
            'Client Management': 'clientManagementApps',  
            'Support': 'supportApps'
        };
        const fileName = navMenuToFileMap[answers.navMenu];
        return [
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/package.json',
            templateFile: 'plop-templates/app/package.json.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/index.html',
            templateFile: 'plop-templates/app/index.html.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/src/main.tsx',
            templateFile: 'plop-templates/app/src/main.tsx.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/src/App.tsx',
            templateFile: 'plop-templates/app/src/App.tsx.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/src/pages/{{pascalCase appName}}Page.tsx',
            templateFile: 'plop-templates/app/src/pages/Page.tsx.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/tsconfig.json',
            templateFile: 'plop-templates/app/tsconfig.json.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/vite.config.ts',
            templateFile: 'plop-templates/app/vite.config.ts.hbs',
        },
        // Need to update this because it's not updating the file properly
        {
            type: 'modify',  
            path: `packages/app-registry/src/${fileName}.ts`,  
            pattern: /(\s*)\/\/ PLOP_INJECT_APP/,  
            template: `\n        {
            type: 'internal',
            header: '${answers.navMenu}',
            subHeader: '${answers.navSubMenu}',
            id: \'{{appName}}\',
            name: \'{{appName}}\',
            title: \'{{appName}}\',
            env: 'development',
            path: \'{{routePath}}\',
            team: \'{{team}}\',
            component: lazy(() => import(\'@{{team}}/{{appName}}/src/App\')),
            description: \'{{description}}\',
        },$1// PLOP_INJECT_APP`,  
        },
        // async function(answers, config, plop) {
        //                 const path = await import('path');  
        //     const fs = await import('fs');  
        //     const registryPath = path.join(process.cwd(), `packages/app-registry/src/${fileName}.ts`);
        //     const registryContent = fs.readFileSync(registryPath, 'utf8');

        //         const teamRegex = new RegExp(`(id: '${answers.team}'[^}]+apps: \\[)([^\\]]*)(\\])`, 's');
        //         const updatedContent = registryContent.replace(teamRegex, (match, p1, p2, p3) => {
        //             const apps = p2.trim() ? `${p2}, '${answers.appName}'` : `'${answers.appName}'`;
        //             return `${p1}${apps}${p3}`;
        //         });
        //         console.log('teamRegex', teamRegex)
        //         console.log('updatedContent', updatedContent)
        //         fs.writeFileSync(registryPath, updatedContent);
        //         return 'Team apps updated in registry';




            // if (!registryContent.includes(`id: '${answers.team}'`)) {
            //     const teamPattern = /(\s*)\/\/ PLOP_INJECT_APP/;
            //     const teamTemplate = `.\n {\n
            //                     id: '${answers.team}',\n
            //                     name: '${answers.team}',\n
            //                     displayName: '${answers.team.charAt(0).toUpperCase() + answers.team.slice(1)} Team',\n
            //                     apps: ['${answers.appName}']\n
            //                 }$1// PLOP_INJECT_TEAM`;
            //     const updatedContent = registryContent.replace(teamPattern, teamTemplate);
            //     console.log('teamPattern', teamPattern)
            //     console.log('teamTemplate', teamTemplate)
            //     console.log('updatedContent', updatedContent)
            //     fs.writeFileSync(registryPath, updatedContent);
            //     return 'Team added to registry';

            // } else {
            //     const teamRegex = new RegExp(`(id: '${answers.team}'[^}]+apps: \\[)([^\\]]*)(\\])`, 's');
            //     const updatedContent = registryContent.replace(teamRegex, (match, p1, p2, p3) => {
            //         const apps = p2.trim() ? `${p2}, '${answers.appName}'` : `'${answers.appName}'`;
            //         return `${p1}${apps}${p3}`;
            //     });
            //     console.log('teamRegex', teamRegex)
            //     console.log('updatedContent', updatedContent)
            //     fs.writeFileSync(registryPath, updatedContent);
            //     return 'Team apps updated in registry';
            // }
        // },
        // {
        //     type: 'modify',
        //     path: 'packages/app-registry/src/{{}}.ts',
        //     pattern: /(\s*)\/\/ PLOP_INJECT_APP/,
        //     template: `.\n {\n
        //                         id: \'{{appName}}\',\n
        //                         name: \'{{appName}}\',\n
        //                         title: \'{{title}}\',\n
        //                         path: \'{{routePath}}\',\n
        //                         team: \'{{team}}\',\n
        //                         component: lazy(() => import(\'@{{team}}/{{appName}}/src/pages/{{pascalCase appName}}Page\')),\n
        //                         description: \'{{description}}\',\n
        //                     }$1// PLOP_INJECT_APP`,
        // },
        // function(answers, config, plop) {
        //     const path = require('path');
        //     const fs = require('fs');
        //     const registryPath = path.join(process.cwd(), 'packages/app-registry/src/registry.ts');
        //     const registryContent = fs.readFileSync(registryPath, 'utf8');

        //     if (!registryContent.includes(`id: '${answers.team}'`)) {
        //         const teamPattern = /(\s*)\/\/ PLOP_INJECT_APP/;
        //         const teamTemplate = `.\n {\n
        //                         id: '${answers.team}',\n
        //                         name: '${answers.team}',\n
        //                         displayName: '${answers.team.charAt(0).toUpperCase() + answers.team.slice(1)} Team',\n
        //                         apps: ['${answers.appName}']\n
        //                     }$1// PLOP_INJECT_TEAM`;
        //         const updatedContent = registryContent.replace(teamPattern, teamTemplate);
        //         fs.writeFileSync(registryPath, updatedContent);
        //         return 'Team added to registry';

        //     } else {
        //         const teamRegex = new RegExp(`(id: '${answers.team}'[^}]+apps: \\[)([^\\]]*)(\\])`, 's');
        //         const updatedContent = registryContent.replace(teamRegex, (match, p1, p2, p3) => {
        //             const apps = p2.trim() ? `${p2}, '${answers.appName}'` : `'${answers.appName}'`;
        //             return `${p1}${apps}${p3}`;
        //         });
        //         fs.writeFileSync(registryPath, updatedContent);
        //         return 'Team apps updated in registry';
        //     }
        // },

        function () {
            return `App successfully created. make sure to npm install and then npm run dev`
        }


    ]
    }
})
}

