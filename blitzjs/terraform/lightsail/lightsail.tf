terraform {
  required_version = ">= 0.14.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.74"
    }
  }

  backend "s3" {}
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

locals {
  resource_tags = {
    ProjectName = "InfraLab"
    Environment = terraform.workspace == "production" ? "production" : terraform.workspace
    Terraform   = true
  }
}

resource "aws_lightsail_instance" "instance" {
  name              = "${var.repository_name}-${terraform.workspace}"
  availability_zone = "us-east-1a"
  blueprint_id      = "debian_10"
  bundle_id         = "small_2_0"
  tags              = local.resource_tags
}

resource "aws_lightsail_instance_public_ports" "public_ports" {
  instance_name = aws_lightsail_instance.instance.id

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
  }

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
  }

  port_info {
    protocol  = "tcp"
    from_port = 8080
    to_port   = 8080
  }
}

# resource "aws_lightsail_static_ip" "static_ip" {
#   name = "${aws_lightsail_instance.instance.name}_static_ip"
# }

# resource "aws_lightsail_static_ip_attachment" "test" {
#   static_ip_name = aws_lightsail_static_ip.static_ip.id
#   instance_name  = aws_lightsail_instance.instance.id
# }

