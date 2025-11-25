import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
            choices: ['Portfolio Management', 'Research & Analysis', 'Risk & Performance', 'Compliance', 'Client Management', 'AI Products', 'Support']
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
                        case 'AI Products':
                            return ['Ai Themes']
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
            default: (answers) => `/${answers.team}/${answers.appName}/`,
            validate: (input) => {
                if (!input) return 'Route is required';
                if (!input.startsWith('/')) return 'Route path must start with /';

                return true;
            }
        },
                {
            type: 'list',
            name: 'highestEnv',
            message: 'Highest Environment the feature application should be displayed',
            choices: ['sandbox', 'dev', 'qa', 'prod']
        },
        // todo: get rid of this and give a default one that is +1 of the last one created
        {
            type: 'input',
            name: 'port',
            message: 'Dev server port:',
            default: 3200,
            validate: (input) => {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const port = parseInt(input);
                if (isNaN(port) || port < 3000 || port > 9999) {
                    return 'Port must be between 3000 and 9999';
                }

                // Load the list of used ports
                const usedPortsPath = path.resolve(__dirname, 'plop-templates/config/usedPorts.json');
                const usedPorts = JSON.parse(fs.readFileSync(usedPortsPath, 'utf-8')).usedPorts;

                if (usedPorts.includes(port)) {
                    return `Port ${port} is already in use. Please choose another port.`;
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
            'AI Products': 'aiProductsApps',
            'Support': 'supportApps'
        };
        const fileName = navMenuToFileMap[answers.navMenu];
        // todo: bring in types from appregistry
        const headerEnumConversion = `NavbarHeader.${answers.navMenu.replace(/[^a-zA-Z0-9]/g, '')}`
        const subHeaderEnumConversion = `NavbarSubHeader.${answers.navSubMenu.replace(/[^a-zA-Z0-9]/g, '')}`
        const highEnvEnumConversion = `HighestEnv.${answers.highestEnv}`;


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
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/vite-env.d.ts',
            templateFile: 'plop-templates/app/vite-env.d.ts.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/.env.local',
            templateFile: 'plop-templates/app/.env.local.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/.env.development',
            templateFile: 'plop-templates/app/.env.development.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/.env.qa',
            templateFile: 'plop-templates/app/.env.qa.hbs',
        },
        {
            type: 'add',
            path: 'apps/features/{{team}}/{{appName}}/.env.production',
            templateFile: 'plop-templates/app/.env.production.hbs',
        },
        {
            type: 'modify',
            path: 'plop-templates/config/usedPorts.json',
            pattern: /"usedPorts": \[/,
            template: '"usedPorts": [{{port}}, '
        },
        // Need to update this because it's not updating the file properly
        {
            type: 'modify',  
            path: `packages/app-registry/src/${fileName}.ts`,  
            pattern: /(\s*)\/\/ PLOP_INJECT_APP/,  
            template: `\n    {
        type: 'internal',
        header: ${headerEnumConversion},
        subHeader: ${subHeaderEnumConversion},
        id: \'{{appName}}\',
        name: \'{{appName}}\',
        title: \'{{appName}}\',
        env: ${highEnvEnumConversion},
        path: \'{{routePath}}\',
        team: \'{{team}}\',
        component: lazy(() => import(\'@{{team}}/{{appName}}/src/App\')),
        description: \'{{description}}\',
    },$1// PLOP_INJECT_APP`,  
        },
        function () {
            return `App successfully created. make sure to npm install and then npm run dev`
        }]
    }
})
}

