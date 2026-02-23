import fs from 'fs';

export default function (plop) {
    plop.setHelper('dashCase', (text) => {
        return text.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'');
    });

    // ML: Created this to prevent merge conflicts for newly generated apps
    plop.setActionType('insertAliasRandom', function (answers, config, plopApi) {
        const filePath = plopApi.renderString(config.path, answers);
        const marker = config.marker || '// PLOP_INJECT_NEW_FEATURE_APP';
        const minOffset = config.minOffset ?? 3;
        const maxOffset = config.maxOffset ?? 7;

        if (minOffset > maxOffset) {
            throw new Error(`minOffset (${minOffset}) cannot be greater than maxOffset (${maxOffset})`);
        }

        const src = fs.readFileSync(filePath, 'utf8');
        const EOL = src.includes('\r\n') ? '\r\n' : '\n';
        const lines = src.split(/\r?\n/);

        const renderedKey = plopApi.renderString(config.aliasKey, answers);
        const exists = lines.some(
        (l) =>
            l.includes(`${renderedKey}:`) ||
            l.includes(`'${renderedKey}':`) ||
            l.includes(`"${renderedKey}":`)
        );
        if (exists) {
        return `Alias "${renderedKey}" already present. Skipped.`;
        }

        const markerIdx = lines.findIndex((l) => l.includes(marker));
        if (markerIdx === -1) {
        throw new Error(`Marker "${marker}" not found in ${filePath}`);
        }

        // find start of alias block (line with "{")
        let aliasStartIdx = -1;
        for (let i = markerIdx; i >= 0; i--) {
        if (lines[i].includes('alias:')) {
            let braceLine = i;
            for (let j = i; j <= i + 2 && j < lines.length; j++) {
            if (lines[j].includes('{')) {
                braceLine = j;
                break;
            }
            }
            aliasStartIdx = braceLine;
            break;
        }
        }
        if (aliasStartIdx === -1) aliasStartIdx = 0;

        const randOffset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
        const minIdx = aliasStartIdx + 1;
        let insertIdx = Math.max(minIdx, markerIdx - randOffset);
        while (insertIdx < markerIdx && /^\s*$/.test(lines[insertIdx])) insertIdx++;

        const indent = (lines[markerIdx].match(/^(\s*)/) || ['', ''])[1];

        let aliasLine = plopApi
        .renderString(
            config.template || `{{aliasKey}}: path.resolve(__dirname, '{{aliasPath}}')`,
            answers
        )
        .trimEnd();
        if (!aliasLine.trim().endsWith(',')) aliasLine += ',';
        aliasLine = indent + aliasLine;

        lines.splice(insertIdx, 0, aliasLine);
        fs.writeFileSync(filePath, lines.join(EOL), 'utf8');

        return `Inserted alias "${renderedKey}" at line ${insertIdx + 1} (random offset ${randOffset}).`;
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
                            return ['Performance', 'Risk'];
                        case 'Compliance':
                            return ['Research', 'Governance', 'Regulations'];
                        case 'Client Management':
                            return ['Research'];
                        case 'AI Products':
                            return ['AI Themes', 'AI Upload Tools']
                        case 'Support':
                            return ['General'];
                        default:
                            return [];
                    }
                }
        },
        {
            type: 'input',
            name: 'displayAppName',
            message: 'What is the title for your application in the Navigation Bar?',
            default: (answers) => `${answers.appName}`,
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
            choices: ['prod', 'qa', 'dev', 'sandbox']
        },
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
            path: 'apps/features/{{team}}/{{appName}}/.env.sandbox',
            templateFile: 'plop-templates/app/.env.sandbox.hbs',
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
        title: \'{{displayAppName}}\',
        env: ${highEnvEnumConversion},
        path: \'{{routePath}}\',
        team: \'{{team}}\',
        component: lazy(() => import(\'@{{team}}/{{appName}}/src/App\')),
        description: \'{{description}}\',
    },$1// PLOP_INJECT_APP`,  
        },
        {
        type: 'insertAliasRandom',
        path: 'apps/platform-shell/vite.config.ts',
        marker: '// PLOP_INJECT_NEW_FEATURE_APP',
        minOffset: 3,
        maxOffset: 6,
        aliasKey: '@{{team}}/{{appName}}',
        template: `'@{{team}}/{{appName}}': path.resolve(__dirname, '../features/{{team}}/{{appName}}')`,
        },
        function () {
            return `App successfully created. make sure to npm install and then npm run dev`
        }]
    }
})
}

