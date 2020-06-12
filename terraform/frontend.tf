
data "external" "frontend_build" {
	program = ["bash", "-c", <<EOF
(npm ci && npm run build -- --env.USER_API_URL="$(sed 's/^{.*"user_api_url"\s*:\s*"\([^"]*\)".*}$/\1/')") >&2 && echo '{"dest": "dist"}'
EOF
]
	working_dir = "${path.module}/../frontend"
  query = {
		user_api_url = aws_api_gateway_deployment.user_apigw_deployment.invoke_url
	}
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.bucket_name
  acl = "public-read"

  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${var.bucket_name}/*"
    }
  ]
}
EOF

  website {
    index_document = "index.html"
  }
}

locals {
  # files to upload to S3 bucket
  files = [ "index.html", "build.js" ]

  # file extenstion to MIME type
  mime_type_mappings = {
    html = "text/html",
    js   = "text/javascript",
    css  = "text/css"
  }

  origin_id = "frontend-origin-id"
}

resource "aws_s3_bucket_object" "frontend_object" {
  bucket = aws_s3_bucket.frontend_bucket.bucket

  for_each = toset(local.files)

	key    = each.value
	source = "${data.external.frontend_build.working_dir}/${data.external.frontend_build.result.dest}/${each.value}"

  etag         = filemd5("${data.external.frontend_build.working_dir}/${data.external.frontend_build.result.dest}/${each.value}")
  content_type = lookup(local.mime_type_mappings, concat(regexall("\\.([^\\.]*)$", each.value), [[""]])[0][0], "application/octet-stream")
}

resource "aws_cloudfront_distribution" "frontend_distribution" {
  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id = local.origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }
}
