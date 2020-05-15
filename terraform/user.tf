provider "aws" {
  region = var.aws_region
}

data "external" "user_build" {
  # to ensure that the md5 of the zip files is OK we set the timestamps of all files
  # to a known constant
	program = ["bash", "-c", <<EOF
(rm -rf node_modules && npm ci && npm run build && find . -exec touch -t 0001010000 {} \; && zip -r -X /tmp/lambda.zip *) >&2 && echo '{"dest": "/tmp/lambda.zip"}'
EOF
]
	working_dir = "${path.module}/../backend/user"
}

resource "aws_lambda_function" "user_function" {
  filename = data.external.user_build.result.dest
  function_name = "user_function"
  handler = "server.handler"
  runtime = "nodejs12.x"
  source_code_hash = filebase64sha256("${data.external.user_build.result.dest}")
  role = aws_iam_role.user_role.arn
  #role = arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole

  environment {
    variables = {
      CORS_ORIGIN = "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
    }
  }
}

# IAM role which dictates what other AWS services the Lambda function
# may access.
resource "aws_iam_role" "user_role" {
  name = "user_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_api_gateway_rest_api" "user_apigw_restapi" {
  name = "user_apigw_restapi"
  description = "API Gateway RESTful API"
}

resource "aws_api_gateway_resource" "user_apigw_resource" {
  rest_api_id = aws_api_gateway_rest_api.user_apigw_restapi.id
  parent_id = aws_api_gateway_rest_api.user_apigw_restapi.root_resource_id
  path_part = "{proxy+}"
}

resource "aws_api_gateway_method" "user_apigw_method" {
  rest_api_id = aws_api_gateway_rest_api.user_apigw_restapi.id
  resource_id = aws_api_gateway_resource.user_apigw_resource.id
  http_method = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "user_apigw_integration" {
   rest_api_id = aws_api_gateway_rest_api.user_apigw_restapi.id
   resource_id = aws_api_gateway_method.user_apigw_method.resource_id
   http_method = aws_api_gateway_method.user_apigw_method.http_method

   integration_http_method = "POST"
   type = "AWS_PROXY"
   uri = aws_lambda_function.user_function.invoke_arn
 }

 resource "aws_api_gateway_deployment" "user_apigw_deployment" {
    depends_on = [
      aws_api_gateway_integration.user_apigw_integration
    ]

    rest_api_id = aws_api_gateway_rest_api.user_apigw_restapi.id
    stage_name = "test"
  }

  resource "aws_lambda_permission" "user_lambda_permission" {
     statement_id  = "AllowAPIGatewayInvoke"
     action        = "lambda:InvokeFunction"
     function_name = aws_lambda_function.user_function.function_name
     principal     = "apigateway.amazonaws.com"

     # The "/*/*" portion grants access from any method on any resource
     # within the API Gateway REST API.
     source_arn = "${aws_api_gateway_rest_api.user_apigw_restapi.execution_arn}/*/*"
   }
