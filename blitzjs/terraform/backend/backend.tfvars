bucket         = "wz-tf-state-infra-lab-[repo_name]"
key            = "infra-lab/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "tf-state-lock-[repo_name]"
encrypt        = true
