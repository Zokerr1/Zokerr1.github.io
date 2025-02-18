//flytofeature
const flyToFeature = feature => {
  map.flyTo({
    center: feature.geometry.coordinates,
    zoom: 16,
    bearing: 0,
    speed: 1.2,
    curve: 1.42,
    essential: true
  });
};

//click map
map.on('click', (event) => {
    const features = map.queryRenderedFeatures(event.point, {
        layers: ['pitch-points'] // replace with your layer name
    });

    if (!features.length) {
        return;
    }

    const feature = features[0];
    flyToFeature(feature);
  
  //make tags clear and breif
    let typesData = feature.properties.facility_s || '';
    let importantType = typesData.includes(' - ') ? typesData.split(' - ')[1].trim() : typesData.trim();
    let surfaceTag = feature.properties.surface ? feature.properties.surface.trim() : '';
  //create tags
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';
  
    [importantType, surfaceTag].forEach(tagText => {
        if (tagText) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tagText;
            tagsContainer.appendChild(tagElement);
        }
    });

    // create pop up
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.innerHTML = `
        <h3>${feature.properties.site_name}</h3>
        <p>${feature.properties.postcode}</p>
        <p>${feature.properties.address}</p>
    `;
  //attach tags
    popupContent.appendChild(tagsContainer);
  
    const popup = new mapboxgl.Popup({ offset: [0, -15], className: "my-popup" })
        .setLngLat(feature.geometry.coordinates)
        .setDOMContent(popupContent)
        .addTo(map);
});

//track location
map.addControl(
 new mapboxgl.GeolocateControl({
     positionOptions: {
         enableHighAccuracy: true
     },
     trackUserLocation: true,
     showUserHeading: true
 }), 
 "top-right"
);

// create listener
document.getElementById('facility-select').addEventListener('change', applyFilters);
document.getElementById('surface-select').addEventListener('change', applyFilters);

//create filters via function
function applyFilters() {
    const facilitySelect = document.getElementById('facility-select');
    const surfaceSelect = document.getElementById('surface-select');
//transfor POI
    const selectedFacility = facilitySelect.value;
    const selectedSurface = surfaceSelect.value;

    // 
    let filters = ['all'];

    // set conditions
    if (selectedFacility !== 'all') {
        const facilityFilter = [
            'match',//check for consistency
            ['get', 'facility_s'],
            getFacilityTypes(selectedFacility),
            true,
            false
        ];
        filters.push(facilityFilter);
    }

    //set surface condition
    if (selectedSurface !== 'all') {
        const surfaceFilter = [
            '==',
            ['get', 'surface'],
            selectedSurface
        ];
        filters.push(surfaceFilter);
    }

    // check
    map.setFilter('pitch-points', filters.length > 1 ? filters : null);
}

// respond to facility
function getFacilityTypes(facility) {
    const facilityTypes = {
        'Football': ['Pitch - Football (5-a-side)', 'Pitch - Football (7-a-side)', 'Pitch - Full Size', 'Pitch - Small Size'],
        'Rugby': ['Pitch - Rugby', 'Pitch - Full Size', 'Pitch - Small Size'],
        'Cricket': ['Cricket Square', 'Pitch - Full Size', 'Pitch - Small Size'],
        'Hockey': ['Pitch - Hockey', 'Pitch - Full Size', 'Pitch - Small Size']
    };
    return facilityTypes[facility] || [];
}