#!/bin/bash

# Script to fix AWS configuration issues

echo "===== AWS Configuration Fix Tool ====="
echo ""

# Check if credentials file exists
if [ ! -f ~/.aws/credentials ]; then
    echo "Creating ~/.aws/credentials file..."
    mkdir -p ~/.aws
    cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = YOUR_DEFAULT_ACCESS_KEY_ID
aws_secret_access_key = YOUR_DEFAULT_SECRET_ACCESS_KEY

[eb-cli]
aws_access_key_id = YOUR_EB_CLI_ACCESS_KEY_ID
aws_secret_access_key = YOUR_EB_CLI_SECRET_ACCESS_KEY
EOF
    echo "Credentials file created. Please update with your actual credentials."
    echo "Then run 'aws configure' to set up your default profile."
else
    echo "Checking ~/.aws/credentials file..."
    # Check if eb-cli section has secret key
    if grep -q "\[eb-cli\]" ~/.aws/credentials && ! grep -A 2 "\[eb-cli\]" ~/.aws/credentials | grep -q "aws_secret_access_key"; then
        echo "Missing secret key in eb-cli section. Adding placeholder..."
        sed -i '' '/\[eb-cli\]/a\
aws_secret_access_key = YOUR_EB_CLI_SECRET_ACCESS_KEY' ~/.aws/credentials
        echo "Added placeholder for eb-cli secret key. Please update with your actual secret key."
    fi
fi

# Check if config file exists
if [ ! -f ~/.aws/config ]; then
    echo "Creating ~/.aws/config file..."
    cat > ~/.aws/config << EOF
[default]
region = us-east-1
output = json

[profile eb-cli]
region = us-east-1
output = json
EOF
    echo "Config file created."
fi

# Set proper permissions
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config

echo ""
echo "AWS configuration files have been checked and fixed."
echo "Please update the credentials files with your actual AWS credentials."
echo "Then run 'aws configure' to set up your default profile."