GEOCODE_API_KEY="dc5cde1f0b5c403184fd2cb1e709e401";

addEventListener("keypress", function(event)
{
    if (event.key=== "Enter")
    {
        event.preventDefault();
        document.getElementById("button").click();
    }
});

document.getElementById("admin_login").addEventListener("click", function(){
    window.location.href = "dashboard/dashboard.html";
});

// id: "button" is the button on index page
document.getElementById("button").addEventListener("click", function(){
    let country;
    let city;
    let address;
    let zipcode;
    if (window.location.pathname.endsWith('index.html')){
        country = document.getElementById("country").value;
        city = document.getElementById("city").value;
        address = document.getElementById("address").value;
        zipcode = document.getElementById("zipcode").value;
    } else if (window.location.pathname.endsWith('result.html')){
        country = document.getElementById("country1").value;
        city = document.getElementById("city1").value;
        address = document.getElementById("address1").value;
        zipcode = document.getElementById("zipcode1").value;
    }
    let searchKey = {
        "country": country, "city": city, "address": address, "zipcode": zipcode
    };
    axios({method: 'POST', url: 'http://127.0.0.1:5000/searchKey', data: searchKey}).then(response => {
        console.log(response.data.message);
    });
    // axios.put('http://127.0.0.1:5000/searchKey', searchKey);

    window.location.href = "result.html";

});

function updatePagination(page, totalPage) {
    let prevBtn = document.getElementById('prev-page');
    let nextBtn = document.getElementById('next-page');

    // prevBtn.classList.toggle('disabled', page === 1);
    // nextBtn.classList.toggle('disabled', page === totalPages);

    prevBtn.className = page === 1 ? 'page-item disabled' : 'page-item';
    nextBtn.className = page < totalPage ? 'page-item' : 'page-item disabled';
}

let map;
let modalMap;

function initializeSmallMap(latitude, longitude) {
  if (map) {
    map.remove();
  }
  map = L.map('smallMap').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);
}

function initializeModalMap(latitude, longitude, hotelData) {
  if (modalMap) {
    modalMap.remove(); 
  }

  modalMap = L.map('modalMap').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(modalMap);

  // Add markers for each hotel
  hotelData.forEach(item => {
    const marker = L.marker([item["latitude"], item["longitude"]]).addTo(modalMap);
    marker.bindPopup(`
      <b>${item["hotelname"]}</b><br>
      ${item["address"]}<br>
      Rating: ${item["starrating"]}
      `, {
        autoPan: false // Avoid auto-panning when the popup opens
      });
  });

  setTimeout(function() {
    modalMap.invalidateSize();
  }, 100);
}

async function geocodeLocation(location) {
    // need moved to flask
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${GEOCODE_API_KEY}`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.results.length > 0) {
        const lat = data.results[0].geometry.lat;
        const lng = data.results[0].geometry.lng;
        return [lat, lng];
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
    
    return null;
  }

function fetchData(page, itemsPerPage, country, city, address, zipcode){
    axios({method: 'GET', url: 'http://127.0.0.1:5000/hotelInfo',
        params: {'country': country, 'city': city, 'address': address, 'zipcode': zipcode, 'page': page, 'limit': itemsPerPage}}).then(async function (res){
            const dataContainer = document.getElementById("result_list");
            dataContainer.innerHTML = "";
            res = res.data;
            let length = res["length"];
            let hotelData = res["hotelData"];
            let totalPage = Math.ceil(length / itemsPerPage);

            if (length === 0){
                document.getElementById("result_info").innerHTML = "No Hotels Found in " + city;
                document.getElementById("result_list").style.display = 'none';
            } else {
                if (city){
                    document.getElementById("result_info").innerHTML = city + ": " + length.toString() + " Hotels Found";
                }
                else {
                    document.getElementById("result_info").innerHTML = length.toString() + " Hotels Found";
                }
                hotelData.forEach((item,index) =>{
                    let hotel = document.createElement('div');
                    let starsHtml = '';
                    for (let i = 0; i < item["starrating"]; i++) {
                        starsHtml += '<i class="fas fa-star" style="color: rgba(251,188,101,255);"></i>';
                    }
                    hotel.className = "container box1";
                    hotel.innerHTML = `
                        <div class="row" style="cursor: pointer" onclick=window.open('${item["final_url"]}')>
                            <div class="col-md-3 mt-2 mb-2 ml-2 mr-2 pl-0 pr-0 box1" style="height:150px">
                                <a><img class="border-0" height="100%" width="100%" src='${item["image_url"]}'></a>
                            </div>
                            <div class="col-md-5 mt-2 mb-2 ml-2 mr-2 pl-0 pr-0">
                                <h4 style="color: rgb(28, 93, 111)">${item["hotelname"]}</h4>
                                <div>${starsHtml}</div>
                                <p style="color: rgb(28, 93, 111)">${item["address"]}</p>
                            </div>
                        </div>
                    `;
                    dataContainer.appendChild(hotel);
                });

                updatePagination(page, totalPage);

            }
            const coordinates = await geocodeLocation(`${country} ${city}`);
            document.getElementById('smallMap').addEventListener('click', function () {
                $('#mapModal').on('shown.bs.modal', function () {
                    initializeModalMap(coordinates[0], coordinates[1], hotelData);
                  });
                  
                $('#mapModal').modal('show');
            });
        }).catch(function (error){
            console.error('Error fetching data:', error);
    });
}



window.addEventListener('load',function (){
    let country;
    let city;
    let address;
    let zipcode;
    axios({method: 'GET', url: 'http://127.0.0.1:5000/searchKey'}).then(async function (res){
        res = res.data;
        // console.log(res)
        country = res["country"];
        city = res["city"];
        address = res["address"];
        zipcode = res["zipcode"];
        document.getElementById("country1").value = country;
        document.getElementById("city1").value = city;
        document.getElementById("address1").value = address;
        document.getElementById("zipcode1").value = zipcode;


        const itemsPerPage = 20;
        let currentPage = 1;
        fetchData(currentPage, itemsPerPage, country, city, address, zipcode);
        const coordinates = await geocodeLocation(`${country} ${city}`);
        if (coordinates) {
            initializeSmallMap(coordinates[0], coordinates[1]);
        }
        document.getElementById('prev-page').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
              currentPage--;
              fetchData(currentPage, itemsPerPage, country, city, address, zipcode);
              window.scrollTo(0, 0);
            }
        });

        document.getElementById('next-page').addEventListener('click', function (e) {
            e.preventDefault();
            currentPage++;
            fetchData(currentPage, itemsPerPage, country, city, address, zipcode);
            window.scrollTo(0, 0);
        });
    })



})