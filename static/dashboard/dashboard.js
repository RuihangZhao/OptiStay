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

async function fetchLocationData() {
    try {
      const res = await axios({ method: "GET", url: "http://127.0.0.1:5000/dashboard" });
      const hotelsData = res.data;
  
      const topology = await fetch('https://code.highcharts.com/mapdata/custom/europe.topo.json')
        .then(response => response.json());
  
      const countryData = {};
      const propertyTypeData={};
      let total = 0;
      hotelsData.forEach(hotel => {
        const { country, propertytype} = hotel;
        if (!countryData[country]) {
          countryData[country] = {
            name: country,
            code3: countryCodes.get(country),
            value: 0
          };
        }
        if (!propertyTypeData[propertytype])
        {
            propertyTypeData[propertytype] = {
                name: propertytype,
                count: 0
            }
        }
        countryData[country].value++;
        propertyTypeData[propertytype].count++;
        total++;
      });

      const mapData = [];
      const barData = [];
      for (const country in countryData) {
        mapData.push({
          name: countryData[country].name,
          code3: countryData[country].code3,
          value: countryData[country].value
        });
      }

      for (const propertytype in propertyTypeData)
      {
        barData.push({
            name: propertyTypeData[propertytype].name,
            y: 100*propertyTypeData[propertytype].count/total
        });
      }

       Highcharts.mapChart('dashboardContainer1', {
            chart: {
                map: topology,
            },

            title: {
                text: 'European Hotels',
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

        const colors = Highcharts.getOptions().colors.map((c, i) =>
            Highcharts.color(Highcharts.getOptions().colors[0])
                .brighten((i - 2) / 7)
                .get()
        );

        Highcharts.chart('dashboardContainer2', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Hotels by Categories'
            },
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    colors,
                    dataLabels: [{
                        enabled: true,
                        distance: 20
                    }, {
                        enabled: true,
                        distance: -40,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        },
                        filter: {
                            operator: '>',
                            property: 'percentage',
                            value: 10
                        }
                    }]
                }
            },
            series: [
                {
                    name: 'Percentage: ',
                    colorByPoint: true,
                    data: barData
                }
            ]
        });
    } catch (error) {
      console.error('Error when fetching hotel data:', error);
    }
}

async function fetchUserData()
{
    try{
        const res = await axios({ method: "GET", url: "http://127.0.0.1:5000/user_analysis" });
        const userData = res.data;
        console.log(userData);
    }catch(error)
    {
        console.error('Error when fetching user data: ', error)
    }
}
window.addEventListener('load', function(){
    fetchLocationData()
})