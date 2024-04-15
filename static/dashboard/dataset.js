async function renderTable() {
    try {
        const tableBody = document.getElementById('datasetTableBody');
        
        // Get filter values
        const country = document.getElementById('filterCountry').value;
        const city = document.getElementById('filterCity').value;
        const zipcode = document.getElementById('filterZipcode').value;

        // Construct query parameters
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (city) params.append('city', city);
        if (zipcode) params.append('zipcode', zipcode);
        params.append('page', 1);
        params.append('limit', 1000); // You can adjust this as needed

        const res = await axios({
            method: "GET",
            url: "http://127.0.0.1:5000/hotelInfo",
            params: params
        });

        let hotelsData = res.data.hotelData;

        let tableRows = `<thead>
        <tr>
            <th scope="col">id</th>
            <th scope="col">hotelId</th>
            <th scope="col">hotelName</th>
            <th scope="col">address</th>
            <th scope="col">city</th>
            <th scope="col">country</th>
            <th scope="col">zipCode</th>
            <th scope="col">propertyType</th>
            <th scope="col">starRating</th>
            <th scope="col">latitude</th>
            <th scope="col">longitude</th>
            <th scope="col">source</th>
            <th scope="col">url</th>
            <th scope="col"></th>
        </tr>
        </thead>`;
        tableRows += '<tbody>';
        hotelsData.forEach((hotel, index) => {
            tableRows += `
            <tr>
                <td contenteditable="false" data-field="id">${hotel.id}</td>
                <td contenteditable="false" data-field="hotelId">${index}</td>
                <td contenteditable="true" data-field="hotelname">${hotel.hotelname}</td>
                <td contenteditable="true" data-field="address">${hotel.address}</td>
                <td contenteditable="true" data-field="city">${hotel.city}</td>
                <td contenteditable="true" data-field="country">${hotel.country}</td>
                <td contenteditable="true" data-field="zipcode">${hotel.zipcode}</td>
                <td contenteditable="true" data-field="propertytype">${hotel.propertytype}</td>
                <td contenteditable="true" data-field="starrating">${hotel.starrating}</td>
                <td contenteditable="true" data-field="latitude">${hotel.latitude.toFixed(2)}</td>
                <td contenteditable="true" data-field="longitude">${hotel.longitude.toFixed(2)}</td>
                <td contenteditable="true" data-field="source">${hotel.Source}</td>
                <td contenteditable="true" data-field="url">${hotel.url}</td>
                <td><button class="deleteButton" data-id="${index}" onclick="handleRowDelete(event)">Delete</button></td>
            </tr>
            `;
        });
        tableRows += '</tbody>';
        tableBody.innerHTML = tableRows;
    } catch (error) {
        console.error("Error rendering hotel data: ", error);
    }
}

function handleRowDelete(event)
{
    if (event.target.classList.contains('deleteButton'))
    {
        const hotelId = event.target.getAttribute('data-id')
        fetch(`http://127.0.0.1:5000/delete-hotel/${hotelId}`, {
            method: 'DELETE'
        }).then(response=>response.json())
        .then(data=>{
            if (data.success)
            {
                console.log(data.message);
                renderTable();
            }
        })
        .catch(error=>console.error("Error deleting: ", error));
    }
}

async function handleRowInsert()
{
    const attributeValues = prompt('Enter the attribute values (comma-separated) in the following order:\nhotelID, ID, Hotel Name, Address, City, Country, Zip Code, Property Type, Star Rating, Latitude, Longitude, Source, URL');
    if (attributeValues)
    {
        const [hotelId, id, hotelname, address, city, country, zipcode, propertytype, starrating, latitude, longitude, Source, url] = attributeValues.split(',').map(value => value.trim());
        const newHotel = {
            id: parseInt(id),
            hotelname, 
            address,
            city, 
            country,
            zipcode: parseInt(zipcode),
            propertytype,
            starrating: parseInt(starrating),
            latitude: parseFloat(latitude), 
            longitude: parseFloat(longitude),
            Source: parseInt(Source),
            url
        };

        try
        {
            const response = await fetch(`http://127.0.0.1:5000/insert-hotel/${hotelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newHotel)
            });

            const data = await response.json();
            console.log(data.message);
            renderTable();
        }catch (error){
            console.error('Error inserting hotel data: ', error);
        }
    }
}

async function handleCellEdit(event)
{
    if (event.target.hasAttribute('contenteditable')){
        const row = event.target.parentNode;
        const hotelId = row.querySelector('.deleteButton').getAttribute('data-id');
        const field = event.target.getAttribute('data-field');
        let value = event.target.textContent;
        const country = row.querySelector('[data-field="country"]').textContent;

        switch (field) {
            case 'id':
            case 'zipcode':
            case 'Source':
                value = parseInt(value, 10);
                break;
            case 'starrating':
                value = parseInt(value, 10);
                break;
            case 'latitude':
            case 'longitude':
                value = parseFloat(value);
                break;
        }
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/update-hotel/${hotelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ field, value, country}),
            });

            const data = await response.json();
            console.log(data.message);

        } catch (error) {
            console.error('Error updating hotel field:', error);
        }
    }
}

// window.addEventListener('load', function(){
//     renderTable()
//     document.addEventListener('input', handleCellEdit);
// })

window.addEventListener('load', function() {
    renderTable();
    document.addEventListener('input', handleCellEdit);

    const filterButton = document.getElementById('filterButton');
    filterButton.addEventListener('click', function() {
        renderTable();
    });
});