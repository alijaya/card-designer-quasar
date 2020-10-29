export default function enableCORS(url) {
  const cors_api_host = 'cors-anywhere.herokuapp.com'
  const cors_api_url = 'https://' + cors_api_host + '/'
  const origin = window.location.protocol + '//' + window.location.host
  const targetOrigin = /^https?:\/\/([^\/]+)/i.exec(url)
  if (targetOrigin && targetOrigin[0].toLowerCase !== origin && targetOrigin[1] !== cors_api_host) {
    url = cors_api_url + url
  }
  return url
}