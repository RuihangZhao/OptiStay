function fetchLocationData()
{
    axios({method: "GET", url: "http://127.0.0.1:5000/dashboard"}).then(async function(res)
    {
        res = res.data;
    });
}

window.addEventListener('load', function(){
    fetchLocationData()
})