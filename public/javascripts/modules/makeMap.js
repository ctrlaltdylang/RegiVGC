/* eslint-disable no-undef */
import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 34.73024, lng: -86.58512 },
  zoom: 10,
};

function loadPlaces(map, lat = 34.73024, lng = -86.58512) {
  axios
    .get(`/api/events/near?lat=${lat}&lng=${lng}`)
    .then((res) => {
      const places = res.data;
      console.log(res);
      if (!places.length) {
        alert('no events near there!');
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map((place) => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position);
        const marker = new google.maps.Marker({ map, position });
        marker.place = place;
        return marker;
      });

      markers.forEach((marker) =>
        marker.addListener('click', function () {
          const html = `
          <div class="popup">
            <a href="/event/${this.place.slug}">
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
          infoWindow.setContent(html);
          infoWindow.open(map, this);
        })
      );

      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
    .catch((err) => console.log(err));
}

function makeMap(mapDiv) {
  console.log('in makemap.js');
  if (!mapDiv) return;

  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });
}

export default makeMap;
