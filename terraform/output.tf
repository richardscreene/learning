
output "user_api_url" {
  value = aws_api_gateway_deployment.user_apigw_deployment.invoke_url
}

output "web_domain" {
  value = aws_cloudfront_distribution.frontend_distribution.domain_name
}
