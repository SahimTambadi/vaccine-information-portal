
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Building2,
  Navigation,
  RefreshCw,
  Phone,
  Globe,
  SlidersHorizontal,
  X,
  ArrowRight,
  MapPinned,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./Hospitals.css";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
};

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [hospitalType, setHospitalType] = useState("all");

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [hospitalResult, locationResult] = await Promise.all([
        supabase
          .from("hospital_public_catalog")
          .select("*")
          .order("name", { ascending: true }),

        supabase
          .from("hospital_locations")
          .select("*")
          .eq("review_status", "verified")
          .order("is_primary", { ascending: false }),
      ]);

      if (hospitalResult.error) throw hospitalResult.error;
      if (locationResult.error) throw locationResult.error;

      setHospitals(hospitalResult.data || []);
      setLocations(locationResult.data || []);
    } catch (err) {
      console.error("Hospital directory error:", err);
      setError(err.message || "Unable to load hospitals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Your browser does not support location detection. Please search by area instead."
      );
      return;
    }

    setLocationMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setNearbyEnabled(true);

        setLocationMessage(
          "Showing verified hospital locations within 30 km that have map coordinates."
        );
      },
      (geoError) => {
        console.error("Location error:", geoError);

        setNearbyEnabled(false);
        setUserLocation(null);

        if (geoError.code === 1) {
          setLocationMessage(
            "Location permission was denied. You can search by locality, city or pincode instead."
          );
        } else {
          setLocationMessage(
            "Unable to detect your location. Please search by area instead."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const clearNearbySearch = () => {
    setUserLocation(null);
    setNearbyEnabled(false);
    setLocationMessage("");
  };

  const clearAllFilters = () => {
    setSearch("");
    setAreaSearch("");
    setHospitalType("all");
    clearNearbySearch();
  };

  const hospitalResults = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const areaTerm = areaSearch.trim().toLowerCase();

    const hospitalMap = new Map(
      hospitals.map((hospital) => [hospital.id, hospital])
    );

    const matchingLocations = locations
      .filter((location) => hospitalMap.has(location.hospital_id))
      .map((location) => {
        let distance = null;

        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);

        const hasCoordinates =
          location.latitude !== null &&
          location.latitude !== undefined &&
          location.longitude !== null &&
          location.longitude !== undefined &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude);

        if (userLocation && hasCoordinates) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            latitude,
            longitude
          );
        }

        return {
          ...location,
          distance,
          hospital: hospitalMap.get(location.hospital_id),
        };
      });

    const filtered = matchingLocations.filter((location) => {
      const hospital = location.hospital;

      const searchableValues = [
        hospital.name,
        hospital.hospital_type,
        hospital.description,
        location.locality,
        location.city,
        location.state,
        location.pincode,
        location.address,
        location.branch_name,
      ];

      const matchesSearch =
        !searchTerm ||
        searchableValues
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);

      const areaValues = [
        location.locality,
        location.city,
        location.state,
        location.pincode,
        location.address,
      ];

      const matchesArea =
        !areaTerm ||
        areaValues
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(areaTerm);

      const matchesType =
        hospitalType === "all" ||
        hospital.hospital_type === hospitalType;

      // Nearby results must have coordinates and be within 30 km.
      const matchesNearby =
        !nearbyEnabled ||
        (location.distance !== null && location.distance <= 30);

      return (
        matchesSearch &&
        matchesArea &&
        matchesType &&
        matchesNearby
      );
    });

    filtered.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }

      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;

      return a.hospital.name.localeCompare(b.hospital.name);
    });

    return filtered;
  }, [
    hospitals,
    locations,
    search,
    areaSearch,
    hospitalType,
    userLocation,
    nearbyEnabled,
  ]);

  const hospitalTypes = useMemo(
    () =>
      [...new Set(hospitals.map((hospital) => hospital.hospital_type))]
        .filter(Boolean)
        .sort(),
    [hospitals]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    areaSearch.trim() !== "" ||
    hospitalType !== "all" ||
    nearbyEnabled;

  return (
    <main className="hospitals-page">
      <div className="hospitals-container">

        {/* PAGE HEADER */}

        <header className="hospitals-header">
          <div className="hospitals-header-content">
            <div className="hospitals-eyebrow">
              <Building2 size={15} />
              VAXCARE HEALTHCARE DIRECTORY
            </div>

            <h1>
              Find the Right Hospital
              <span> Near You</span>
            </h1>

            <p>
              Discover verified hospitals, explore their locations
              and find healthcare facilities in your area.
            </p>

            <div className="hospitals-header-highlights">
              <span>
                <ShieldPlusIcon />
                Verified information
              </span>

              <span>
                <MapPin size={15} />
                Location-based discovery
              </span>
            </div>
          </div>

          <div className="hospitals-header-illustration">
            <div className="hospitals-illustration-circle">
              <Building2 size={66} strokeWidth={1.5} />
            </div>

            <div className="hospitals-illustration-pin">
              <MapPin size={21} />
            </div>
          </div>
        </header>

        {/* SEARCH AND FILTERS */}

        <section className="hospitals-search-section">
          <div className="hospitals-search-heading">
            <div>
              <span className="hospitals-section-label">
                HOSPITAL DIRECTORY
              </span>

              <h2>Search hospitals</h2>

              <p>
                Search by hospital name, location or hospital category.
              </p>
            </div>

            <div className="hospitals-search-heading-icon">
              <SlidersHorizontal size={22} />
            </div>
          </div>

          <div className="hospitals-search-fields">

            {/* HOSPITAL NAME SEARCH */}

            <div className="hospitals-field hospitals-main-search">
              <label htmlFor="hospital-name-search">
                Hospital name or keyword
              </label>

              <div className="hospitals-input-wrapper">
                <Search size={19} />

                <input
                  id="hospital-name-search"
                  type="search"
                  placeholder="Search hospital name, type or city..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    className="hospitals-input-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear hospital search"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* AREA SEARCH */}

            <div className="hospitals-field">
              <label htmlFor="hospital-area-search">
                Location
              </label>

              <div className="hospitals-input-wrapper">
                <MapPin size={19} />

                <input
                  id="hospital-area-search"
                  type="text"
                  placeholder="Locality, city or pincode"
                  value={areaSearch}
                  onChange={(event) => setAreaSearch(event.target.value)}
                />
              </div>
            </div>

            {/* HOSPITAL TYPE */}

            <div className="hospitals-field">
              <label htmlFor="hospital-type-filter">
                Hospital category
              </label>

              <div className="hospitals-select-wrapper">
                <Building2 size={18} />

                <select
                  id="hospital-type-filter"
                  value={hospitalType}
                  onChange={(event) =>
                    setHospitalType(event.target.value)
                  }
                >
                  <option value="all">All hospital types</option>

                  {hospitalTypes.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEARCH ACTIONS */}

          <div className="hospitals-search-actions">
            <button
              type="button"
              className="hospitals-nearby-button"
              onClick={handleNearbySearch}
              disabled={loading}
            >
              <Navigation size={18} />
              Find Hospitals Near Me
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                className="hospitals-clear-button"
                onClick={clearAllFilters}
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>

          {locationMessage && (
            <div
              className={`hospitals-location-message ${
                nearbyEnabled ? "success" : ""
              }`}
            >
              <MapPin size={16} />
              <span>{locationMessage}</span>
            </div>
          )}
        </section>

        {/* RESULTS */}

        <section className="hospitals-results-section">
          <div className="hospitals-results-heading">
            <div>
              <span className="hospitals-section-label">
                HEALTHCARE FACILITIES
              </span>

              <h2>
                {nearbyEnabled
                  ? "Hospitals Near You"
                  : "Available Hospitals"}
              </h2>

              <p>
                {loading
                  ? "Loading hospital directory..."
                  : `${hospitalResults.length} verified ${
                      hospitalResults.length === 1
                        ? "location"
                        : "locations"
                    } found`}
              </p>
            </div>

            <button
              type="button"
              className="hospitals-refresh-button"
              onClick={fetchHospitals}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "hospitals-refresh-spinning" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="hospitals-error">
              <strong>Unable to load hospitals</strong>
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchHospitals}
              >
                Try Again
              </button>
            </div>
          )}

          {!error && loading ? (
            <div className="hospitals-loading">
              <div className="hospitals-loading-spinner" />
              <h3>Finding hospitals</h3>
              <p>Please wait while we load verified hospital information.</p>
            </div>
          ) : !error && hospitalResults.length > 0 ? (
            <div className="hospitals-grid">
              {hospitalResults.map((location) => {
                const hospital = location.hospital;

                return (
                  <article
                    className="hospital-public-card"
                    key={location.id}
                  >
                    <div className="hospital-public-card-top">
                      <div className="hospital-public-icon">
                        {hospital.logo_url ? (
                          <img
                            src={hospital.logo_url}
                            alt={`${hospital.name} logo`}
                          />
                        ) : (
                          <Building2 size={30} />
                        )}
                      </div>

                      <div className="hospital-public-type">
                        {hospital.hospital_type || "Hospital"}
                      </div>
                    </div>

                    <div className="hospital-public-title">
                      <h3>{hospital.name}</h3>

                      {location.branch_name && (
                        <p>{location.branch_name}</p>
                      )}
                    </div>

                    <div className="hospital-public-divider" />

                    <div className="hospital-public-address">
                      <MapPin size={18} />

                      <span>
                        {[
                          location.address,
                          location.locality,
                          location.city,
                          location.state,
                          location.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>

                    {location.distance !== null && (
                      <div className="hospital-public-distance">
                        <Navigation size={15} />
                        {location.distance.toFixed(1)} km away
                      </div>
                    )}

                    <div className="hospital-public-contact">
                      {hospital.phone && (
                        <a href={`tel:${hospital.phone}`}>
                          <Phone size={16} />
                          Call Hospital
                        </a>
                      )}

                      {hospital.website_url && (
                        <a
                          href={hospital.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe size={16} />
                          Website
                        </a>
                      )}
                    </div>

                    <Link
                      to={`/hospitals/${hospital.slug}`}
                      className="hospital-public-details-link"
                    >
                      View Hospital Details
                      <ArrowRight size={17} />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : !error && (
            <div className="hospitals-empty">
              <div className="hospitals-empty-icon">
                {nearbyEnabled ? (
                  <MapPinned size={43} />
                ) : (
                  <Building2 size={43} />
                )}
              </div>

              <h3>
                {nearbyEnabled
                  ? "No nearby hospitals found"
                  : "No verified hospitals found"}
              </h3>

              <p>
                {nearbyEnabled
                  ? "There are no verified hospital locations with map coordinates within 30 km of your current location. Try searching by area instead."
                  : "There are currently no matching verified hospital locations. Try another hospital name, locality or pincode."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                >
                  <X size={16} />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* DIRECTORY INFORMATION */}

        <div className="hospitals-directory-note">
          <ShieldPlusIcon />

          <p>
            VaxCare displays hospital information that has passed its
            review process. Always contact the hospital directly to
            confirm services, availability and consultation details.
          </p>
        </div>
      </div>
    </main>
  );
}

function ShieldPlusIcon() {
  return <Building2 size={15} />;
}

export default Hospitals;
