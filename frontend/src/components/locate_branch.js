mapboxgl.accessToken = 'pk.eyJ1IjoibWFoYXJzaGlwYXRlbCIsImEiOiJjbG51aHY1dGEwYzFiMnFvMDVtaGFiYzAzIn0.t01QVyxqA4d48KxwjSrtsw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

//Event Listener
document.getElementById('submit_zip').addEventListener('click', fetchData);

//A function to check and validate zip-codes
function validate (input) {
    return input.match(/^[/\d]{5}?$/) !== null      
}

//A function to fetch data from the backend api
function fetchData() {
    const query_param = document.getElementById('zip_code').value;

    try{
        const int_zip_code = parseInt(query_param)
    }
    catch(err){
        window.alert("The zip-code entered is invalid.");
        return;
    }

    if(validate(query_param) === false){
        window.alert("The zip-code entered is invalid.");
        return;
    }

    const data = {
        zip_code: query_param,
    }

    //Defining the API URL you want to request
    const apiUrl = `http://localhost:8080/api/locate_branch`;

    //Defining the options for the POST Request
    const options = {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(data) 
    }

    //Sending a POST request to the API
    fetch(apiUrl, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('There was an internal error.');
            }
            return response.json();
        })
        .then(data => {
            populate_map(data);
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
}

//A function to populate the map
function populate_map(json_data){
    
    //Changing the center of the map
    map.setCenter([json_data[0].lon, json_data[0].lat]);

    json_data.forEach((obj) => { 
        var popup = new mapboxgl.Popup()
            .setHTML(obj.display_name)
            .addTo(map);

        var markerWithPopup = new mapboxgl.Marker()
            .setLngLat([obj.lon, obj.lat])
            .setPopup(popup)
            .addTo(map);
    });
}