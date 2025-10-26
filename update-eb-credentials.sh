#!/bin/bash

# Script to update EB CLI credentials with the same as default profile

echo "===== Updating EB CLI Credentials ====="
echo ""

# Extract credentials from default profile
DEFAULT_ACCESS_KEY=$(grep -A 1 "\[default\]" ~/.aws/credentials | grep "aws_access_key_id" | cut -d'=' -f2 | tr -d ' ')
DEFAULT_SECRET_KEY=$(grep -A 1 "\[default\]" ~/.aws/credentials | grep "aws_secret_access_key" | cut -d'=' -f2 | tr -d ' ')

echo "Default profile access key: $DEFAULT_ACCESS_KEY"
echo "Default profile secret key: ${DEFAULT_SECRET_KEY:0:5}********************"

# Update eb-cli profile with default credentials
sed -i '' '/\[eb-cli\]/,/^\[.*\]/ {
    s/aws_access_key_id = .*/aws_access_key_id = '"$DEFAULT_ACCESS_KEY"'/g
}' ~/.aws/credentials

sed -i '' '/\[eb-cli\]/,/^\[.*\]/ {
    /aws_secret_access_key/d
}' ~/.aws/credentials

# Add secret key after access key
sed -i '' '/aws_access_key_id = '"$DEFAULT_ACCESS_KEY"'/a\
aws_secret_access_key = '"$DEFAULT_SECRET_KEY"'' ~/.aws/credentials

echo ""
echo "✓ EB CLI credentials updated with default profile credentials"
echo "✓ Both profiles now have the same credentials"

# Verify the update
echo ""
echo "Verifying credentials file:"
echo "--------------------------"
grep -A 2 "\[default\]" ~/.aws/credentials
echo ""
grep -A 2 "\[eb-cli\]" ~/.aws/credentials