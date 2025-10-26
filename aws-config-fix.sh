#!/bin/bash

# Create proper AWS configuration files

# Create config file
cat > ~/.aws/config << EOF
[default]
region = us-east-1
output = json

[profile eb-cli]
region = us-east-1
output = json
EOF

# Create credentials file with placeholder values
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[eb-cli]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF

echo "AWS configuration files created successfully!"
echo "Please replace the placeholder values in ~/.aws/credentials with your actual AWS credentials."