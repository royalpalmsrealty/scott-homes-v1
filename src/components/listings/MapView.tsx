"use client";

import { useEffect, useRef } from "react";
import type { ScrapedListing } from "@/lib/listings/idxScrape";
import { buildOwnListingUrl } from "@/lib/listings/idxScrape";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const OVERRIDES_ID = "map-view-brand-overrides";

function loadLeafletCss() {
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }

  // Leaflet's own default chrome (square white zoom buttons, a plain grey
  // attribution strip, boxy popups) reads as a generic map widget bolted
  // onto the page — this brings its controls in line with the rest of the
  // site's rounded, shadowed, teal-accented button language.
  if (!document.getElementById(OVERRIDES_ID)) {
    const style = document.createElement("style");
    style.id = OVERRIDES_ID;
    style.textContent = `
      .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important; }
      .leaflet-control-zoom a {
        width: 34px !important; height: 34px !important; line-height: 34px !important;
        color: #0f6e6b !important; font-size: 18px !important;
      }
      .leaflet-control-zoom a:first-child { border-radius: 12px 12px 0 0 !important; }
      .leaflet-control-zoom a:last-child { border-radius: 0 0 12px 12px !important; }
      .leaflet-control-zoom a:hover { background: #f0faf9 !important; }
      .leaflet-control-attribution {
        background: rgba(255,255,255,0.85) !important; border-radius: 8px 0 0 0;
        font-size: 10px !important; padding: 2px 6px !important;
      }
      .leaflet-popup-content-wrapper { border-radius: 14px !important; box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important; }
      .leaflet-popup-tip { box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }
}

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

// Key West's own coordinates — used as the map's center when no listing has
// a usable lat/lng to center on instead.
const KEY_WEST_CENTER: [number, number] = [24.5551, -81.7801];

export function MapView({ listings }: { listings: ScrapedListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      loadLeafletCss();
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const pinned = listings.filter(
        (l): l is ScrapedListing & { lat: number; lng: number } => l.lat !== null && l.lng !== null
      );

      const map = L.map(containerRef.current, { zoomControl: false }).setView(KEY_WEST_CENTER, 12);
      mapRef.current = map;
      L.control.zoom({ position: "topright" }).addTo(map);
      // CartoDB's free "Voyager" basemap — real color (green parks, blue
      // water, warm road tones) without default OpenStreetMap's busier,
      // more cluttered label/icon density. No API key required, same as
      // plain OSM tiles.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // A plain teal circle rather than Leaflet's default marker image —
      // the default icon's asset path breaks under bundlers like this
      // project's (Turbopack) unless the PNGs are copied into /public,
      // which a simple DivIcon avoids needing entirely.
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#28bcb8;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const markers: import("leaflet").Marker[] = [];
      for (const listing of pinned) {
        const marker = L.marker([listing.lat, listing.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:'Inter',sans-serif;min-width:170px;padding:2px">
            <p style="margin:0;font-family:'Playfair Display',serif;font-size:17px;color:#000">${formatPrice(listing.price)}</p>
            <p style="margin:4px 0 8px;font-size:13px;color:#2e3233">${listing.address}</p>
            <a href="${buildOwnListingUrl(listing)}" style="font-size:13px;font-weight:600;color:#0f6e6b;text-decoration:none">View details &rarr;</a>
          </div>`
        );
        markers.push(marker);
      }

      if (markers.length > 0) {
        // Leaflet measures its container's on-screen size once, right when
        // L.map() is constructed. In this split grid layout that size isn't
        // always settled yet at that exact moment, so fitBounds can compute
        // against a stale (often much larger, e.g. 0-height-then-expanded)
        // size and zoom out far too wide. Force a re-measure first.
        map.invalidateSize();
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15 });
      }
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // listings is a fresh array each render from server data, not a stable
    // dependency — id-based comparison here avoids tearing the map down and
    // rebuilding it on every unrelated parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings.map((l) => l.listingId).join(",")]);

  return <div ref={containerRef} className="h-full w-full" />;
}
