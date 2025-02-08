module.exports = {
    apps: [
        {
            name: "pumpe",
            script: "yarn pumpe",
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
