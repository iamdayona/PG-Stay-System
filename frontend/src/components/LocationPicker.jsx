/**
 * LocationPicker.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * A reusable Google Maps component that lets the user:
 *   1. Type a location in a Places Autocomplete search box
 *   2. See a map centered on Kerala, India
 *   3. Click anywhere on the map OR select from autocomplete to drop a pin
 *   4. Drag the pin to fine-tune the location
 *
 * Props:
 *   value       { lat, lng, address }  — current pinned location (controlled)
 *   onChange    (locationObj) => void  — called when pin changes
 *   disabled    boolean                — disables interaction (view-only)
 *   placeholder string                 — search box placeholder text
 *   height      string                 — CSS height of the map (default "320px")
 *
 * Usage (owner form):
 *   <LocationPicker
 *     value={pgForm.mapLocation}
 *     onChange={(loc) => setPgForm({ ...pgForm, mapLocation: loc })}
 *   />
 *
 * Usage (tenant preferences):
 *   <LocationPicker
 *     value={form.prefMapLocation}
 *     onChange={(loc) => setForm({ ...form, prefMapLocation: loc })}
 *     disabled={!isEditing}
 *     placeholder="Pin your preferred area…"
 *   />
 *
 * IMPORTANT: This component loads the Google Maps JS API via a <script> tag
 * injected once into the document. The API key is read from
 * import.meta.env.VITE_GOOGLE_MAPS_API_KEY.
 *
 * Required .env variable:
 *   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from "react";

// Kerala, India centre coordinates — all maps default to this view
const KERALA_CENTER = { lat: 10.8505, lng: 76.2711 };
const KERALA_DEFAULT_ZOOM = 8;

// ── Load the Google Maps JS script exactly once across the whole app ──────
let scriptPromise = null;

function loadGoogleMapsScript(apiKey) {
    if (window.google?.maps) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=IN`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Google Maps script. Check your API key."));
        document.head.appendChild(script);
    });

    return scriptPromise;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function LocationPicker({
    value,
    onChange,
    disabled = false,
    placeholder = "Search for a location in Kerala…",
    height = "320px",
}) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const mapRef = useRef(null);   // DOM node for the map
    const mapObj = useRef(null);   // google.maps.Map instance
    const markerObj = useRef(null);   // google.maps.Marker instance
    const inputRef = useRef(null);   // Search box <input> DOM node
    const autoRef = useRef(null);   // google.maps.places.Autocomplete instance

    const [mapsReady, setMapsReady] = useState(false);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState(value?.address || "");

    // ── 1. Load the Maps SDK ──────────────────────────────────────────────
    useEffect(() => {
        if (!apiKey) {
            setError("VITE_GOOGLE_MAPS_API_KEY is not set in your .env file.");
            return;
        }
        loadGoogleMapsScript(apiKey)
            .then(() => setMapsReady(true))
            .catch((err) => setError(err.message));
    }, [apiKey]);

    // ── 2. Initialise map + marker + autocomplete once SDK is ready ───────
    useEffect(() => {
        if (!mapsReady || !mapRef.current) return;

        const initialCenter = value?.lat ? { lat: value.lat, lng: value.lng } : KERALA_CENTER;
        const initialZoom = value?.lat ? 14 : KERALA_DEFAULT_ZOOM;

        // Create map
        mapObj.current = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            styles: [
                // Subtle style — keeps the map clean and matches the clay UI
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            ],
        });

        // Create draggable marker (only shown when a pin exists)
        markerObj.current = new window.google.maps.Marker({
            map: mapObj.current,
            draggable: !disabled,
            visible: !!value?.lat,
            position: value?.lat ? { lat: value.lat, lng: value.lng } : KERALA_CENTER,
            animation: window.google.maps.Animation.DROP,
            title: "Drag to fine-tune location",
        });

        // Marker drag end → reverse geocode → call onChange
        markerObj.current.addListener("dragend", () => {
            const pos = markerObj.current.getPosition();
            reverseGeocode(pos.lat(), pos.lng());
        });

        // Map click → place marker → reverse geocode → call onChange
        if (!disabled) {
            mapObj.current.addListener("click", (e) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                placeMarker(lat, lng);
                reverseGeocode(lat, lng);
            });
        }

        // ── Autocomplete on the search input ──────────────────────────────
        if (inputRef.current && !disabled) {
            autoRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: "IN" }, // India only
                fields: ["geometry", "formatted_address", "name"],
                // Bias results toward Kerala bounding box
                bounds: new window.google.maps.LatLngBounds(
                    { lat: 8.17, lng: 74.85 },   // SW Kerala
                    { lat: 12.79, lng: 77.42 }   // NE Kerala
                ),
                strictBounds: false, // allow outside Kerala if user explicitly types it
            });

            autoRef.current.addListener("place_changed", () => {
                const place = autoRef.current.getPlace();
                if (!place.geometry?.location) return;

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || "";

                placeMarker(lat, lng);
                mapObj.current.panTo({ lat, lng });
                mapObj.current.setZoom(15);
                setSearchText(address);
                onChange?.({ lat, lng, address });
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapsReady]);

    // ── 3. Keep marker in sync if value changes externally ───────────────
    useEffect(() => {
        if (!markerObj.current) return;
        if (value?.lat) {
            markerObj.current.setPosition({ lat: value.lat, lng: value.lng });
            markerObj.current.setVisible(true);
            mapObj.current?.panTo({ lat: value.lat, lng: value.lng });
        } else {
            markerObj.current.setVisible(false);
        }
        if (value?.address !== undefined) setSearchText(value.address);
    }, [value]);

    // ── Helpers ───────────────────────────────────────────────────────────
    const placeMarker = useCallback((lat, lng) => {
        if (!markerObj.current) return;
        markerObj.current.setPosition({ lat, lng });
        markerObj.current.setVisible(true);
    }, []);

    const reverseGeocode = useCallback((lat, lng) => {
        if (!window.google?.maps) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address = status === "OK" && results[0]
                ? results[0].formatted_address
                : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSearchText(address);
            onChange?.({ lat, lng, address });
        });
    }, [onChange]);

    const handleClear = () => {
        if (markerObj.current) markerObj.current.setVisible(false);
        mapObj.current?.panTo(KERALA_CENTER);
        mapObj.current?.setZoom(KERALA_DEFAULT_ZOOM);
        setSearchText("");
        onChange?.({ lat: null, lng: null, address: "" });
    };

    // ── Render ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div style={{
                padding: "16px", borderRadius: "14px",
                background: "rgba(255,235,238,.9)", border: "2px solid rgba(239,83,80,.3)",
                color: "#c62828", fontSize: ".85rem", fontWeight: 600,
            }}>
                ⚠️ Maps Error: {error}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* ── Search box ── */}
            <div style={{ position: "relative" }}>
                <input
                    ref={inputRef}
                    type="text"
                    className="clay-input"
                    placeholder={disabled ? (value?.address || "No location pinned") : placeholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    disabled={disabled || !mapsReady}
                    style={{
                        paddingRight: value?.lat && !disabled ? "72px" : "14px",
                        opacity: !mapsReady ? 0.6 : 1,
                    }}
                />
                {!mapsReady && !error && (
                    <span style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        fontSize: ".75rem", color: "#9a9ab0",
                    }}>
                        Loading…
                    </span>
                )}
                {value?.lat && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        title="Clear location"
                        style={{
                            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(239,83,80,.15)", border: "1.5px solid rgba(239,83,80,.3)",
                            borderRadius: "8px", padding: "4px 10px",
                            color: "#c62828", fontSize: ".75rem", fontWeight: 700, cursor: "pointer",
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Map container ── */}
            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height,
                    borderRadius: "16px",
                    border: "2px solid rgba(255,255,255,.85)",
                    boxShadow: "0 4px 18px rgba(0,0,0,.1)",
                    background: "rgba(200,200,220,.15)",
                    overflow: "hidden",
                    opacity: !mapsReady ? 0.4 : 1,
                    transition: "opacity .3s",
                    cursor: disabled ? "default" : "crosshair",
                }}
            />

            {/* ── Pinned location pill ── */}
            {value?.lat && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px",
                    background: "rgba(232,245,233,.9)",
                    border: "1.5px solid rgba(165,214,167,.5)",
                    borderRadius: "50px",
                    fontSize: ".78rem", fontWeight: 600, color: "#2e7d32",
                }}>
                    <span>📍</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {value.address || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
                    </span>
                    <span style={{ flexShrink: 0, color: "#9a9ab0", fontSize: ".72rem" }}>
                        {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                    </span>
                </div>
            )}

            {/* ── Helper hint ── */}
            {!disabled && mapsReady && !value?.lat && (
                <p style={{ fontSize: ".75rem", color: "#9a9ab0", margin: 0 }}>
                    🗺️ Search above or click on the map to pin a location
                </p>
            )}
        </div>
    );
}