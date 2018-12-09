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
fi 
echo "Landing..."

echo "Installing packages"
sudo apt-get -qq update \
    && apt-get -qq install \
        gcc \
        curl \
        npm \
        nodejs \
        ntp \
        apt-transport-https \
        ca-certificates \
        software-properties-common
echo "Downloading and verifying Docker"
sudo apt-key fingerprint 0EBFCD88
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get -qq update && sudo apt-get -qq install docker-ce
echo "Pulling dynamo container"
docker pull amazon/dynamodb-local
echo "Setting user permissions"
sudo usermod -aG docker vagrant
echo "Updating Node"
sudo npm i -g n
sudo n latest
echo "Installing Yarn"
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get -qq update && sudo apt-get -qq install yarn
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
echo "Installing Updates"
sudo apt-get -qq update && apt-get -qq upgrade
echo "Done"