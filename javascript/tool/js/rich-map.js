mapboxgl.accessToken = 'pk.eyJ1Ijoicm1jYXJkZXIiLCJhIjoiY2lqM2lwdHdzMDA2MHRwa25sdm44NmU5MyJ9.nQY5yF8l0eYk2jhQ1koy9g';

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/rmcarder/cizru0urw00252ro740x73cea',
  zoom: 11,
  center: [-76.92, 38.9072],
  minZoom: 3,
  preserveDrawingBuffer: true
});

function prepareMaps(){

  map.on('load', function() {

    map.addSource("zip", {
      "type": "geojson",
      "data": "data/zip.geojson"
    });

    map.addLayer({
      "id": "zip",
      "type": "line",
      "source": "zip",
      layout: {
        visibility: 'none'
      },
      paint: {
        "line-color": "#0D7B8A",
        "line-width": 1
      }
    });

    map.addSource("tract", {
      "type": "geojson",
      "data": "data/tract.geojson"
    });

    map.addLayer({
      "id": "tract",
      "type": "line",
      "source": "tract",
        layout: {
          visibility: 'none'
        },
        paint: {
          "line-color": "#8DE2B8",
          "line-width": 1
        }
    });
  
    map.addSource("neighborhood", {
      "type": "geojson",
      "data": "data/neighborhood.geojson"
    });

    map.addLayer({
      "id": "neighborhood",
      "type": "line",
      "source": "neighborhood",
      layout: {
        visibility: 'none'
      },
      paint: {
        "line-color": "#0D5C7D",
        "line-width": 1
      }
    });

    map.addSource("ward", {
      "type": "geojson",
      "data": "data/ward.geojson"
    });

    map.addLayer({
      "id": "ward",
      "type": "line",
      "source": "ward",
      layout: {
        visibility: 'none'
      },
      paint: {
        "line-color": "#002D61",
        "line-width": 1
      }
    });

    map.addSource("zillow", {
      "type": "geojson",
      "data": "data/zillow.geojson"
    });

    map.addLayer({
      "id": "zillow",
      "type": "line",
      "source": "zillow",
      layout: {
        visibility: 'none'
      },
      paint: {
        "line-color": "#57CABD",
        "line-width": 1
      }
    });
    //zillow color 57CABD
    
    console.log('app in rich-map.js', app);
    console.log('app.dataCollection.project.geoJSON()', app.dataCollection.project.geoJSON());
    
    map.addSource("project", {
      "type": "geojson",
      "data": app.dataCollection.project.geoJSON('proj_lon', 'proj_lat')
    });
    
    console.log(map.getSource('project'));

    map.addLayer({
      'id': 'project',
      'type': 'circle',
      'source': 'project',
      'paint': {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
          'base': 1.75,
          'stops': [[12, 3], [22, 180]]
        },
        // color circles by ethnicity, using data-driven styles
        'circle-color': {
          property: 'category_code',
          type: 'categorical',
          stops: [
            ['1 - At-Risk or Flagged for Follow-up', '#f03b20'],
            ['2 - Expiring Subsidy', '#fecc5c'],
            ['3 - Recent Failing REAC Score', '#fd8d3c'],
            ['4 - More Info Needed', '#A9A9A9'],
            ['5 - Other Subsidized Property', '#A9A9A9'],
            ['6 - Lost Rental', '#bd0026']
          ]
        }
      }
    });
  
    map.addLayer({
      'id': 'projecttext',
      'source': 'project',
      'type': 'symbol',
      'minzoom': 14,
      layout: {
        'text-field': "{proj_name}",
        'text-anchor': "bottom-left"
      },
    });

    var toggleableLayerIds = [ 'ward', 'tract','neighborhood','zip','zillow' ];
    map.clickedLayer = toggleableLayerIds[0];
    var previousLayer; // keeping track of previously selected layer so it can be turned off

    function showLayer() { // JO putting this bit in a reusable function

      var visibility = map.getLayoutProperty(map.clickedLayer, 'visibility');

      if (previousLayer !== undefined) {
        map.setLayoutProperty(previousLayer, 'visibility', 'none');
      }
      document.querySelectorAll('nav#menu a').forEach(function(item){

        item.className = 'disabled';
      });
      this.className = 'active';
      map.setLayoutProperty(map.clickedLayer, 'visibility', 'visible');
    
      previousLayer = map.clickedLayer;
    };

    for (var i = 0; i < toggleableLayerIds.length; i++) {
      var id = toggleableLayerIds[i];

      var link = document.createElement('a');
      link.href = '#';
      link.className = 'disabled';
      link.textContent = id;

      link.onclick = function (e) {
      map.clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
      showLayer.call(this); // call reusable function with current `this` (element) as context -JO
      setHeader();
      changeZoneType(); // defined in pie.js

      };

      var layers = document.getElementById('menu');
      layers.appendChild(link);
    }

   console.log(document.querySelector('nav#menu a:first-of-type'));
   showLayer.call(document.querySelector('nav#menu a:first-of-type')); // this call happens once on load, sets up initial
                                                                     // condition of having first option active.

    map.on('click', function (e) {
      var building = (map.queryRenderedFeatures(e.point, { layers: ['project'] }))[0];
      var projAddressId = building['properties']['proj_address_id'];
      var projectName = building['properties']['proj_name'];
      var queryString = '?building=' + encodeURIComponent(projAddressId);
    
      document.getElementById('pd').innerHTML = "<h3><strong>" + building.properties.proj_addre +"</strong><br>"+building.properties.proj_name + "<br><br>" + "</h3><p>" + "Owner: " + building.properties.hud_own_name +"<br>"+"Cluster Name: "+ building.properties.cluster_tr2000_name+"<br>"+"HUD Owner Name: " + building.properties.hud_own_name+"<br>"+"HUD Owner Type: " + building.properties.hud_own_type +"<br>"+"HUD Manager Name: " + building.properties.hud_mgr_name+"<br>"+"HUD Manager Type: " + building.properties.hud_mgr_type +"<br><br><strong>"+"At Risk: "+"</strong>"+ building.properties.cat_at_risk+"<br>"+building.properties.category_Code +"</p>";
        
      var popup = new mapboxgl.Popup({ 'anchor': 'top-right' })
        .setLngLat(e.lngLat)
        .setHTML("<a href = '/javascript/tool/building.html" + queryString + "' >See more about " + projectName + "</a>" )
        .addTo(map);
    });

    map.getCanvas().style.cursor = 'default';

    setHeader();

                                                        // putting maps here so they are not called until
                                                        // the map renders, so that the zone (ward, neighborhood) can
                                                        // be selected programmatically 
                                                        
    // putting pie charts in an array property of map so we can access them later, for updating
    map.pieCharts = [
      new PieChart(DATA_FILE,'#pie', 'Subsidized',75,75), 
      new PieChart(DATA_FILE,'#pie-1','Cat_Expiring',75,75), 
      new PieChart(DATA_FILE,'#pie-2','Cat_Failing_Insp',75,75), 
      new PieChart(DATA_FILE,'#pie-3','Cat_At_Risk',75,75),
    //  new PieChart(DATA_FILE,'#pie-4','PBCA',75,75)
    ];
  });

};

function setHeader(){ // sets the text in the sidebar header according to the selected mapLayer
  console.log(currentZoneType);
  if (currentZoneType !== map.clickedLayer) {



    document.querySelector('div#zone h2').innerText = map.clickedLayer.capitalizeFirstLetter() + ' Details';
    document.querySelector('div#zone p:first-of-type').innerText = 'Select a ' + map.clickedLayer + ' to drill down';
    document.getElementById('zone-selector').onchange = changeZone;

  }
  };

app.getAPIData(['project'], prepareMaps);
