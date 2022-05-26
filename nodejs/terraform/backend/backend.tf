terraform {
  required_version = ">= 0.14.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.74"
    }
  }
}

provider "aws" {
  shared_credentials_file = "~/.aws/credentials"
  profile                 = "infra-lab"
  region                  = "us-east-1"
}

resource "aws_s3_bucket" "tf-state-bucket" {
  bucket = "wz-tf-state-infra-lab-${var.repository_name}"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  object_lock_configuration {
    object_lock_enabled = "Enabled"
  }
}

resource "aws_dynamodb_table" "tf-lock-dynamodb" {
  name           = "tf-state-lock-${var.repository_name}"
  hash_key       = "LockID"
  read_capacity  = 5
  write_capacity = 5

  attribute {
    name = "LockID"
    type = "S"
  }
}
