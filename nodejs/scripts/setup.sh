#!/bin/bash

# Exit on any command failure
set -e

# Define variables
WORKSPACE=$1
NODE_VER=$2
AWS_ACCESS_KEY_ID=$3
AWS_SECRET_ACCESS_KEY=$4

store_aws_credentials() {
    # Store AWS variables in .bashrc only if they haven't been stored before
    grep -q 'AWS_ACCESS_KEY_ID' ~/.bashrc || echo AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" >>~/.bashrc
    grep -q 'AWS_SECRET_ACCESS_KEY' ~/.bashrc || echo AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" >>~/.bashrc

    export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
}

update_upgrade_system() {
    sudo apt -y update
    sudo apt -y upgrade
}

install_nvm() {
    # Only install nvm if not installed
    if ! command -v nvm >/dev/null 2>&1; then
        # Install nvm to use specific node version
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

        # These 2 lines enable the nvm command without having to close and reopen the shell
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
}

install_and_use_specific_node_version() {
    # Install and use node version as specified by the NODE_VER variable
    nvm install "$NODE_VER"
    nvm use "$NODE_VER"
}

install_system_packages() {
    # Install nginx to use it as reverse proxy for the blitz server
    # Install ufw to manage the system firewall easily
    sudo apt install -y nginx ufw

    # Allow ports 22, 80 and 8080
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 8080

    # Enable the ufw service to start at boot
    echo y | sudo ufw enable
    sudo ufw status
}

setup_nodejs_project() {
    # Install dependencies
    npm install
    # Install pm2
    npm install -g pm2
    # Rename env-tmp to .env
    mv env-tmp .env
    # Build blitz app
    npm run build
}

setup_nginx() {
    sudo cp -rf nginx/config /etc/nginx/sites-enabled/default
    sudo service nginx restart
}

create_directory_structure() {
    # Remove app folder
    rm -rf ~/project/app

    # Create app folder
    mkdir -p ~/project/app

    # Copy files to app folder
    cp -R ~/project/tmp/. ~/project/app/
}

launch_nodejs_app() {
    pm2 restart ./pm2/server.json
}

enable_pm2_service() {
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u admin --hp /home/admin
    sudo systemctl enable pm2-admin
}

# Change to tmp directory
cd ~/project/tmp || exit

store_aws_credentials
update_upgrade_system
install_nvm
install_and_use_specific_node_version
install_system_packages
setup_nodejs_project
setup_nginx
create_directory_structure

# Change to app directory
cd ~/project/app || exit

launch_nodejs_app
enable_pm2_service
