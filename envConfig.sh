#!/usr/bin/env bash
set -e
HOME=/home/vagrant
echo "Ensuring correct landing"
if ! grep -q "cd /vagrant" $HOME/.bashrc ; then 
    echo "cd /vagrant" >> $HOME/.bashrc 
    echo "Corrected..."
fi 
if ! grep -q "alias dock='docker ps -a'" $HOME/.bashrc ; then 
    echo "alias dock='docker ps -a'" >> $HOME/.bashrc
    echo "alias sls='/vagrant/node_modules/serverless/bin/serverless'" >> $HOME/.bashrc
    echo "alias nodemon='/vagrant/node_modules/nodemon/bin/nodemon'" >> $HOME/.bashrc
fi 
echo "Landing..."

echo "Installing packages"
sudo apt-get -qq update \
    && apt-get -qq install \
        gcc \
        curl \
        npm \
        nodejs \
        ntp
echo "Updating Node"
sudo npm i -g n
sudo n latest
echo "Installing Yarn"
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get -qq update && sudo apt-get -qq install yarn
echo "Installing Updates"
sudo apt-get -qq update && apt-get -qq upgrade
echo "Done"
