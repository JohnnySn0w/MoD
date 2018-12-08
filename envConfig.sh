#!/usr/bin/env bash
set -e
HOME=/home/vagrant
echo "1) Logged in, ensuring correct landing"
if ! grep -q "cd /vagrant" $HOME/.bashrc ; then 
    echo "cd /vagrant" >> $HOME/.bashrc 
    echo "Corrected..."
fi 
echo "Landing..."

echo "2) Installing packages"
sudo apt-get -qq update \
    && apt-get -qq install \
        gcc \
        curl \
        npm \
        nodejs \
        ntp \
        python-dev \
        python-pip
echo "3) Installing Updates"
sudo apt-get -qq update && apt-get -qq upgrade