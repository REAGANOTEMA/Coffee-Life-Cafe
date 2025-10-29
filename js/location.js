// contact-map.js - Coffee Life Cafe | Final World Map Version
(function () {
  let map;
  let markers = [];
  let bounds;

  // Branch locations including Jinja Roundabout Coffee Life Cafe
  const locations = [
    {
      id: "jinja-coffee-life",
      name: "☕ Coffee Life Cafe — Jinja Roundabout",
      desc: "Experience World-Class Coffee at the Heart of Jinja Roundabout",
      lat: 0.4356,
      lng: 33.2039,
      highlight: true, // Main branch
      contacts: ["256746888730", "256784305795"],
      color: "yellow"
    },
    {
      id: "jinja-lakeview",
      name: "Coffee Life Cafe — Lakeview",
      desc: "Mailo Mbili, Scenic Lakeview Spot",
      lat: 0.4425,
      lng: 33.2107,
      contacts: ["256746888730"],
      color: "blue"
    },
    {
      id: "kampala-kasanga",
      name: "Coffee Life Cafe — Kansanga, Kampala",
      desc: "Opposite University of East Africa on Ggaba Road",
      lat: 0.3190,
      lng: 32.5955,
      contacts: ["256748888730"],
      color: "green"
    }
  ];

  // Initialize map globally for Google Maps API callback
  window.initMap = function () {
    const mapEl = document.querySelector(".map-preview");
    if (!mapEl) return console.error("Map container (.map-preview) not found!");

    // Initialize Google Map
    map = new google.maps.Map(mapEl, {
      zoom: 12,
      center: { lat: locations[0].lat, lng: locations[0].lng },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: true
    });

    bounds = new google.maps.LatLngBounds();

    locations.forEach(loc => {
      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        title: loc.name,
        animation: loc.highlight ? google.maps.Animation.BOUNCE : null,
        icon: `https://maps.google.com/mapfiles/ms/icons/${loc.color}-dot.png`
      });

      // WhatsApp links for each branch
      const contactsHTML = loc.contacts
        .map(c => `<a href="https://wa.me/${c}" target="_blank" style="color:#0a7f00;font-weight:bold;">+${c}</a>`)
        .join("<br>");

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family:Arial; font-size:14px; line-height:1.4;">
            <h3 style="margin:0; color:#FFD66B; font-size:16px;">${loc.name}</h3>
            <p>${loc.desc}</p>
            <strong>Contact / WhatsApp:</strong><br>${contactsHTML}
            <br><br>
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}','_blank')" 
              style="padding:6px 12px; background-color:#FFD66B; color:#111; border:none; border-radius:4px; cursor:pointer;">
              Get Directions
            </button>
          </div>`
      });

      marker.addListener("click", () => infoWindow.open(map, marker));

      // Auto-show info window for HQ on load
      if (loc.highlight) {
        setTimeout(() => {
          infoWindow.open(map, marker);
          marker.setAnimation(null); // stop bouncing after attention
        }, 1500);
      }

      markers.push({ marker, infoWindow });
      bounds.extend(marker.position);
    });

    // Fit all branches into view
    map.fitBounds(bounds);
    window.addEventListener("resize", () => map.fitBounds(bounds));
  };
})();
