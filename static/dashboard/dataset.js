async function renderTable(){
    try{
        const tableBody = document.getElementById('datasetTableBody');
        const res = await axios({ method: "GET", url: "http://127.0.0.1:5000/dataset" });
        const hotelsData = res.data;
        console.log(hotelsData);
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
        tableRows+='<tbody>'
        hotelsData.forEach(hotel => {
            tableRows += `
            <tr>
              <td contenteditable="true" data-field="id">${hotel.id}</td>
              <td contenteditable="true" data-field="hotelId">${hotel.hotelid}</td>
              <td contenteditable="true" data-field="hotelName">${hotel.hotelname}</td>
              <td contenteditable="true" data-field="address">${hotel.address}</td>
              <td contenteditable="true" data-field="city">${hotel.city}</td>
              <td contenteditable="true" data-field="country">${hotel.country}</td>
              <td contenteditable="true" data-field="zipCode">${hotel.zipcode}</td>
              <td contenteditable="true" data-field="propertyType">${hotel.propertytype}</td>
              <td contenteditable="true" data-field="starRating">${hotel.starrating}</td>
              <td contenteditable="true" data-field="latitude">${hotel.latitude.toFixed(2)}</td>
              <td contenteditable="true" data-field="longitude">${hotel.longitude.toFixed(2)}</td>
              <td contenteditable="true" data-field="source">${hotel.Source}</td>
              <td contenteditable="true" data-field="url">${hotel.url}</td>
              <td><button class="deleteButton" data-id="${hotel.hotelid}">Delete</button></td>
            </tr>
          `;
        });
        tableRows+='</tbody>';
        tableBody.innerHTML = tableRows;
    } catch (error)
    {
        console.error("Error rendering hotel data: ", error)
    }

}

function handleRowDelete(event)
{
    if (event.target.classList.contains('deleteButton'))
    {
        const hotelID = event.target.getAttribute('data-id')
        fetch(`http://127.0.0.1:5000/delete-hotel/${hotelID}`, {
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
window.addEventListener('load', function(){
    renderTable()
})