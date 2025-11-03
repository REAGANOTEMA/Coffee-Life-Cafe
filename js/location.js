// contact-map.js — Coffee Life Cafe | Final Integrated Map Version
(function () {
  let map;
  let bounds;
  let markers = [];

  // Coffee Life Cafe branch locations
  const locations = [
    {
      id: "jinja-highway",
      name: "☕ Coffee Life Cafe — Jinja Highway (Main Branch)",
      desc: "Experience world-class coffee at the Jinja Roundabout, opposite Police Barracks.",
      lat: 0.4356,
      lng: 33.2039,
      highlight: true,
      contacts: ["256746888730", "256784305795"],
      color: "yellow"
    },
    {
      id: "jinja-lakeview",
      name: "Coffee Life Cafe — Lakeview, Jinja",
      desc: "Mailo Mbili, Total Lakeview — a scenic lakeside location.",
      lat: 0.4425,
      lng: 33.2107,
      contacts: ["256746888730"],
      color: "blue"
    },
    {
      id: "kampala-kansanga",
      name: "Coffee Life Cafe — Kansanga, Kampala",
      desc: "Yosef Mall, Ggaba Road, opposite University of East Africa.",
      lat: 0.319,
      lng: 32.5955,
      contacts: ["256709691395"],
      color: "green"
    }
  ];

  // Try initializing Google Map if API is available
  window.initMap = function () {
    const mapContainer = document.querySelector(".map-preview");
    if (!mapContainer) return console.error("Map container not found!");

    // Hide fallback iframe if Google Maps loads successfully
    const iframe = mapContainer.querySelector("iframe");
    if (iframe) iframe.style.display = "none";

    map = new google.maps.Map(mapContainer, {
      zoom: 12,
      center: { lat: locations[0].lat, lng: locations[0].lng },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#2c2c2c" }]
        }
      ]
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

      const contactsHTML = loc.contacts
        .map(
          c =>
            `<a href="https://wa.me/${c}" target="_blank" style="color:#0a7f00;font-weight:bold;text-decoration:none;">+${c}</a>`
        )
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

      if (loc.highlight) {
        setTimeout(() => {
          infoWindow.open(map, marker);
          marker.setAnimation(null);
        }, 1500);
      }

      markers.push(marker);
      bounds.extend(marker.getPosition());
    });

    // Fit all markers within view
    map.fitBounds(bounds);
    window.addEventListener("resize", () => map.fitBounds(bounds));
  };

  // If Google Maps fails to load, show fallback iframe
  window.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "SCRIPT" && e.target.src.includes("maps.googleapis.com")) {
      console.warn("Google Maps failed to load — fallback map shown.");
      const iframe = document.querySelector(".map-preview iframe");
      if (iframe) iframe.style.display = "block";
    }
  });
})();
