const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
    plop.setGenerator('app', {
        description: 'Generate a new React application',
        prompts: [
            {
                type: 'input',
                name: 'appName',
                message: 'What is your application name?',
                validate: (input) => {
                    if (!input) return 'App name is required';
                    if (!/^[a-z][a-z0-9-]*$/.test(input)) {
                        return 'App name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
                    }

                    if (fs.existsSync(path.resolve(process.cwd(), 'apps', input))) {
                        return 'An application with this name already exists';
                    }

                    return true;
                }
            },
            {
                type: 'input',
                name: 'appDescription',
                message: 'Provide a brief description of your application:',
                default: 'A new feature application'
            },
            {
                type: 'input',
                name: 'appRoute',
                message: 'What route should this app be accessible at?',
                default: (answers) => answers.appName,
                validate: (input) => {
                    if (!input) return 'Route is required';
                    if (!/^[a-z][a-z0-9-]*$/.test(input)) {
                        return 'Route must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
                    }

                    return true;
                }
            }
        ],
        actions: [
            {
                type: 'addMany',
                destination: 'apps/{{appName}}',
                templateFiles: 'plop-templates/app/**/*',
                base: 'plop-templates/app'
            },
            {
                type: 'modify',
                path: 'apps/platform-shell/src/config/appRegistry.ts',
                pattern: /(export const appRegistry: AppConfig\[] = \[)/,
                template: `$1
                    {
                        name: '{{appName}},
                        route: '{{appRoute}},
                        component: lazy(() => import('../../{{appName}}/src/App')),
                        title: '{{pascalCase appName}}',
                        description: '{{appDescription}}'
                    },`
            },
            function updateTurboConfig(answers) {
                const turboPath = path.resolve(process.cwd(), 'turbo.json');
                const turboConfig = JSON.parse(fs.readFileSync(turboPath, 'utf8'));

                if (!turboConfig.pipeline) turboConfig.pipeline = {};

                fs.writeFileSync(turboPath, JSON.stringify(turboConfig, null, 2));
                return 'Updated turbo.json configuration';
            },
            function runSyncpack(answers) {
                const { execSync } = require('child_process');
                try {
                    console.log('Installing dependencies...');
                    execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
                    return 'Dependecies installed successfully';
                } catch (error) {
                    console.warn('Dependency installation failed:', error.message);
                    return 'Dependencies installation completed with warnings';
                }
            }
        ]
    })
}