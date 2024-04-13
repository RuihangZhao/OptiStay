const countryCodes = new Map([
    ["Albania", "ALB"],
    ["Andorra", "AND"],
    ["Austria", "AUT"],
    ["Belarus", "BLR"],
    ["Belgium", "BEL"],
    ["Bosnia and Herzegovina", "BIH"],
    ["Bulgaria", "BGR"],
    ["Croatia", "HRV"],
    ["Cyprus", "CYP"],
    ["Czech Republic", "CZE"],
    ["Denmark", "DNK"],
    ["Estonia", "EST"],
    ["Finland", "FIN"],
    ["France", "FRA"],
    ["Germany", "DEU"],
    ["Greece", "GRC"],
    ["Hungary", "HUN"],
    ["Iceland", "ISL"],
    ["Ireland", "IRL"],
    ["Italy", "ITA"],
    ["Latvia", "LVA"],
    ["Liechtenstein", "LIE"],
    ["Lithuania", "LTU"],
    ["Luxembourg", "LUX"],
    ["Malta", "MLT"],
    ["Moldova", "MDA"],
    ["Monaco", "MCO"],
    ["Montenegro", "MNE"],
    ["Netherlands", "NLD"],
    ["North Macedonia", "MKD"],
    ["Norway", "NOR"],
    ["Poland", "POL"],
    ["Portugal", "PRT"],
    ["Romania", "ROU"],
    ["Russia", "RUS"],
    ["San Marino", "SMR"],
    ["Serbia", "SRB"],
    ["Slovakia", "SVK"],
    ["Slovenia", "SVN"],
    ["Spain", "ESP"],
    ["Sweden", "SWE"],
    ["Switzerland", "CHE"],
    ["Ukraine", "UKR"],
    ["United Kingdom", "GBR"],
    ["Vatican City", "VAT"]
  ]);

async function fetchUserData()
{
    try{
        const res = await axios({ method: "GET", url: "http://127.0.0.1:5000/user_analysis" });
        const userData = res.data.transactions;
        transactions = Object.values(userData);
        const topology = await fetch('https://code.highcharts.com/mapdata/custom/europe.topo.json')
        .then(response => response.json());

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
        oneWeekAgo.setHours(0, 0, 0, 0);
        const hourlyData = {};

        for (let i = 0; i < 7 * 24; i++) {
            const date = new Date(oneWeekAgo);
            date.setHours(date.getHours() + i);
            const pacificDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
            const dateHour = pacificDate.toISOString().slice(0, 13);
            hourlyData[dateHour] = 0;
        }

        const countryData = {};
        transactions.forEach(transaction=>
        {
            const country = transaction.country;
            const timestamp = transaction.searchTime;
            const searchTime = new Date(timestamp*1000);
            if (!countryData[country])
            {
                countryData[country] = {
                    name: country,
                    code3: countryCodes.get(country),
                    value: 0
                };
            }
            countryData[country].value++;

            if (searchTime > oneWeekAgo)
            {
                const pacificTime = new Date(searchTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
                const dateHour = pacificTime.toISOString().slice(0, 13);
                hourlyData[dateHour] = (hourlyData[dateHour] || 0) + 1;
            }
        });
        console.log(hourlyData);

        const mapData = [];
        for (const country in countryData) {
          mapData.push({
            name: countryData[country].name,
            code3: countryData[country].code3,
            value: countryData[country].value
          });
        }

        const lineChartData = Object.entries(hourlyData).map(([dateHour, count]) => {
            const isoDateTime = `${dateHour}:00:00`;
            return {
              x: Date.parse(isoDateTime),
              y: count
            };
          });

        Highcharts.mapChart('AnalysisContainer1', {
            chart: {
                map: topology,
            },

            title: {
                text: 'User Click Analysis',
                align: 'center'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                min: 0,
                stops: [
                    [0, '#E0F7FA'],
                    [0.5, '#4FC3F7'],
                    [1, '#0D47A1']
                ]
            },
            series: [{
                name: 'Hotels',
                joinBy: ['iso-a3', 'code3'],
                data: mapData,
                tooltip: {
                    pointFormat: '{point.name}: {point.value}'
                }
            }]
        });
        console.log(lineChartData);
        Highcharts.chart('AnalysisContainer2', {
            chart: {
              type: 'line'
            },
            title: {
              text: 'Hourly Click Count (Last 7 Days - Pacific Time)'
            },
            xAxis: {
              type: 'datetime',
              labels: {
                format: '{value:%Y-%m-%d}'
              }
            },
            yAxis: {
              title: {
                text: 'Count'
              }
            },
            series: [{
              name: 'Click Count',
              data: lineChartData
            }]
          });


    }catch(error)
    {
        console.error('Error when fetching user data: ', error)
    }
}
window.addEventListener('load', function(){
    fetchUserData()
})