module.exports = {
    apps: [
        {
            name: "hold-bera-vol",
            script: "yarn hold-bera-vol",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            autorestart: false
        },
        {
            name: "thoon",
            script: "yarn thoon",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            autorestart: false
        },
        {
            name: "ati",
            script: "yarn ati",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            autorestart: false
        },
        {
            name: "br",
            script: "yarn br",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            autorestart: false
        },
        {
            name: "henlo",
            script: "yarn henlo",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            autorestart: false
        }
    ]
};
