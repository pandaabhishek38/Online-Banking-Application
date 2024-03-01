const https = require('https');

//A function that makes the 3rd party call to the Map and Geolocation services
function send_map_request(request_body, res){

    const zip_code = JSON.parse(request_body).zip_code;
    const apiUrl = 'nominatim.openstreetmap.org';
  
    if(!zip_code){
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing zip code in the request body' }));
      return;
    }
  
    // Define additional query parameters if needed
    const query_params = new URLSearchParams({
      amenity: 'PNC Bank',
      format: 'json', // Response format (JSON)
      postalcode: zip_code.toString(),
    });
  
    // Creating the endpoint url for the third party provider
    const api_url_with_params = `/search?${query_params.toString()}`;
  
    // Setting up the request options
    const options = {
      hostname: apiUrl,
      path: api_url_with_params,
      method: 'GET',
      headers: {
        'User-Agent': 'Bank Application School Project',
      },
    };
  
    //Sending the request and waiting for the response
    const map_req = https.request(options, (map_res) => {
      let data = '';
  
      map_res.on('data', (chunk) => {
        data += chunk;
      });
  
      map_res.on('end', () => {
        //Sending this json data to the map
        res.writeHead(200, { 'Content-Type': 'application/json' });
        console.log(data);
        res.end(data);
      });
    });
  
    map_req.on('error', (error) => {
      console.error('Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    });
  
    map_req.end();
  }

  module.exports = {
    send_map_request
  }