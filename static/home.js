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

function fetchData(page, itemsPerPage, country, city, address, zipcode){
    axios({method: 'GET', url: 'http://127.0.0.1:5000/hotelInfo',
        params: {'country': country, 'city': city, 'page': page, 'limit': itemsPerPage}}).then(function (res){
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
                document.getElementById("result_info").innerHTML = city + ": " + length.toString() + " Hotels Found";
                hotelData.forEach(item =>{
                    let hotel = document.createElement('div');
                    let starsHtml = '';
                    for (let i = 0; i < item["starrating"]; i++) {
                        starsHtml += '<i class="fas fa-star" style="color: yellow;"></i>';
                    }
                    hotel.className = "container box1";
                    hotel.innerHTML = `
                        <div class="row">
                            <div class="col-md-3 mt-2 mb-2 ml-2 mr-2 pl-0 pr-0 box1" style="height:150px">
                                <img class="border-0" height="100%" width="100%" src='${item["image_url"]}'>
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
        }).catch(function (error){
            console.error('Error fetching data:', error);
    });
}



window.addEventListener('load', function (){
    let country;
    let city;
    let address;
    let zipcode;
    axios({method: 'GET', url: 'http://127.0.0.1:5000/searchKey'}).then(function (res){
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