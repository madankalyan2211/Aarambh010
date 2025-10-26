#!/bin/bash

# Script to generate SSH key for Elastic Beanstalk

echo "Generating SSH key for Elastic Beanstalk..."

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "aarambh-eb-key" -f ~/.ssh/aws-eb -N ""

# Set proper permissions
chmod 600 ~/.ssh/aws-eb
chmod 644 ~/.ssh/aws-eb.pub
chmod 700 ~/.ssh

echo "SSH key generated successfully!"
echo "Private key: ~/.ssh/aws-eb"
echo "Public key: ~/.ssh/aws-eb.pub"
echo ""
echo "Key fingerprint:"
ssh-keygen -lf ~/.ssh/aws-eb.pub
echo ""
echo "To use this key with Elastic Beanstalk:"
echo "1. Run 'cd server && eb init' and select this key when prompted"
echo "2. Or update your .elasticbeanstalk/config.yml to reference this key"