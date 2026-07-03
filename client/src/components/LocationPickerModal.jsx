import React, { useEffect, useState, useRef } from 'react';

const LocationPickerModal = ({ isOpen, onClose, onConfirm }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoords, setSelectedCoords] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India default
    const [geocodedAddr, setGeocodedAddr] = useState('');
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerId = 'map-picker-container';

    // Inject Leaflet scripts lazily when modal opens
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        const initLeafletMap = () => {
            if (!isMounted) return;
            try {
                // Remove existing map instance if any
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                const L = window.L;
                if (!L) return;

                // Try to get user's current location first
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const coords = { lat: latitude, lng: longitude };
                            setSelectedCoords(coords);
                            setupMapInstance(L, coords);
                        },
                        () => {
                            setupMapInstance(L, selectedCoords);
                        }
                    );
                } else {
                    setupMapInstance(L, selectedCoords);
                }
            } catch (err) {
                console.error("Map initialization error:", err);
            }
        };

        const setupMapInstance = (L, startCoords) => {
            const container = document.getElementById(mapContainerId);
            if (!container) return;

            const map = L.map(mapContainerId).setView([startCoords.lat, startCoords.lng], 13);
            mapRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO'
            }).addTo(map);

            const marker = L.marker([startCoords.lat, startCoords.lng], { draggable: true }).addTo(map);
            markerRef.current = marker;

            // Trigger geocode for initial load
            reverseGeocode(startCoords.lat, startCoords.lng);

            // Drag event
            marker.on('dragend', () => {
                const position = marker.getLatLng();
                const coords = { lat: position.lat, lng: position.lng };
                setSelectedCoords(coords);
                reverseGeocode(position.lat, position.lng);
            });

            // Map click event
            map.on('click', (e) => {
                const coords = e.latlng;
                marker.setLatLng(coords);
                setSelectedCoords({ lat: coords.lat, lng: coords.lng });
                reverseGeocode(coords.lat, coords.lng);
            });

            setMapLoaded(true);
        };

        const loadResources = () => {
            if (window.L) {
                setTimeout(initLeafletMap, 100);
                return;
            }

            const cssId = 'leaflet-css-cdn';
            if (!document.getElementById(cssId)) {
                const link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                setTimeout(initLeafletMap, 100);
            };
            document.body.appendChild(script);
        };

        loadResources();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isOpen]);

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
                setGeocodedAddr(data.display_name);
                // Parse standard address details
                const addr = data.address || {};
                const city = addr.city || addr.town || addr.village || addr.suburb || '';
                const state = addr.state || '';
                const postcode = addr.postcode || '';
                const street = addr.road || addr.suburb || addr.neighbourhood || '';
                const houseNo = addr.house_number ? `${addr.house_number}, ` : '';
                
                // Store structural parsing in marker object metadata
                markerRef.current.addressDetails = {
                    addressLine: `${houseNo}${street}` || data.display_name.split(',')[0],
                    city,
                    state,
                    postalCode: postcode
                };
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);
                const coords = { lat: latitude, lng: longitude };

                setSelectedCoords(coords);
                setGeocodedAddr(display_name);

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latitude, longitude], 15);
                    markerRef.current.setLatLng([latitude, longitude]);
                    reverseGeocode(latitude, longitude);
                }
            }
        } catch (err) {
            console.error("Location search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        const details = markerRef.current?.addressDetails || {};
        onConfirm({
            latitude: selectedCoords.lat,
            longitude: selectedCoords.lng,
            addressLine: details.addressLine || geocodedAddr.split(',')[0] || '',
            city: details.city || '',
            state: details.state || '',
            postalCode: details.postalCode || '',
            mapAddress: geocodedAddr
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Pinpoint on Map</h3>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                {/* Search query */}
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input 
                        type="text" 
                        placeholder="Search street, building, city..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="save-profile-btn" style={styles.searchBtn}>
                        SEARCH
                    </button>
                </form>

                {/* Map Display area */}
                <div style={styles.mapWrapper}>
                    <div id={mapContainerId} style={styles.mapContainer}></div>
                    {loading && (
                        <div style={styles.loadingOverlay}>
                            <span style={styles.loadingText}>Fetching address info...</span>
                        </div>
                    )}
                </div>

                {/* Address Summary */}
                <div style={styles.addressBox}>
                    <span style={styles.addressLabel}>Selected Address:</span>
                    <p style={styles.addressText}>
                        {geocodedAddr || (loading ? 'Loading...' : 'Drag marker or tap map to select location')}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div style={styles.footer}>
                    <button 
                        className="save-profile-btn" 
                        style={{ height: '44px', width: 'auto', padding: '0 24px' }}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        CONFIRM LOCATION
                    </button>
                    <button 
                        className="cancel-btn" 
                        style={{ height: '44px', width: 'auto', padding: '0 24px' }}
                        onClick={onClose}
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modalContent: {
        width: '100%',
        maxWidth: '650px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid #eee'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid #eee'
    },
    title: {
        fontSize: '15px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
        color: '#000'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#888'
    },
    searchForm: {
        display: 'flex',
        padding: '16px 24px',
        gap: '8px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fbfbfb'
    },
    searchInput: {
        flex: 1,
        border: '1px solid #ddd',
        padding: '0 16px',
        height: '44px',
        fontSize: '13px',
        fontFamily: 'inherit',
        outline: 'none',
        backgroundColor: '#fff'
    },
    searchBtn: {
        height: '44px',
        width: 'auto',
        padding: '0 20px',
        fontSize: '11px',
        marginTop: 0
    },
    mapWrapper: {
        position: 'relative',
        height: '320px',
        width: '100%'
    },
    mapContainer: {
        height: '100%',
        width: '100%'
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingText: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#000',
        letterSpacing: '0.05em'
    },
    addressBox: {
        padding: '16px 24px',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fafafa'
    },
    addressLabel: {
        fontSize: '10px',
        fontWeight: 600,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'block',
        marginBottom: '4px'
    },
    addressText: {
        fontSize: '13px',
        color: '#222',
        margin: 0,
        lineHeight: 1.4
    },
    footer: {
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        justifyContent: 'flex-end',
        backgroundColor: '#fbfbfb'
    }
};

export default LocationPickerModal;
