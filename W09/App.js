import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(2000); // Valor predeterminado en metros (5 km)
  const [region, setRegion] = useState({
    latitude: 4.5709, // Latitud por defecto
    longitude: -74.2973, // Longitud por defecto
    latitudeDelta: 15.0, // Delta por defecto
    longitudeDelta: 20.0, // Delta por defecto
  });

  useEffect(() => {
    async function getCurrentLocation() {
      // Solicitar permisos y obtener ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922, // Ajusta el zoom si es necesario
        longitudeDelta: 0.0421, // Ajusta el zoom si es necesario
      });
      // Consultar los puntos de interés cercanos
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    }

    getCurrentLocation();
  }, []);

  async function fetchNearbyPlaces(latitude, longitude) {
    const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${latitude},${longitude});
          node["tourism"="attraction"](around:${radius},${latitude},${longitude});
          node["amenity"="restaurant"](around:${radius},${latitude},${longitude});
        );
        out body;
      `;

    try {
      const response = await axios.get(`${OVERPASS_URL}?data=${overpassQuery}`);

      if (response.status !== 200)
        throw new Error("Error al obtener puntos de interés");

      setPlaces(
        response.data.elements.map((item, index) => ({
          title: item.tags.name || `Punto de Interés ${index + 1}`, // Si no tiene nombre, asigna uno genérico
          location: {
            latitude: item.lat,
            longitude: item.lon,
          },
          description:
            item.tags.amenity || item.tags.tourism || "Sin descripción",
        })),
      ); // Guardar los lugares en el estado
    } catch (error) {
      // console.error("Error al obtener puntos de interés:", error);
    }
  }

  const handleChangeRadius = (newRadius) => {
    if (radius + newRadius > 0) setRadius(radius + newRadius * 1000);
    else setRadius(0);
  };

  let text = "Esperando...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitud: ${location.coords.latitude}, Longitud: ${location.coords.longitude}`;
  }

  const getColor = (description) => {
    switch (description) {
      case "restaurant":
        return "yellow";
      case "hospital":
        return "red";
      case "attraction":
        return "blue";
      default:
        return "gray";
    }
  };

  const showLocationsOfInterest = () => {
    if (!places || places.length === 0) return null;
    return places.map((item, index) => {
      return (
        <Marker
          key={index}
          coordinate={item.location}
          title={item.title}
          description={item.description}
          pinColor={getColor(item.description)}
        />
      );
    });
  };
  const findNearbyPlaces = async () => {
    // Convertir a metros
    console.log(radius, location);
    const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${location.coords.latitude},${location.coords.longitude});
          node["tourism"="attraction"](around:${radius},${location.coords.latitude},${location.coords.longitude});
          node["amenity"="restaurant"](around:${radius},${location.coords.latitude},${location.coords.longitude});
        );
        out body;
      `;
    try {
      const response = await axios.get(OVERPASS_URL, {
        params: { data: overpassQuery },
      });
      setPlaces(
        response.data.elements.map((item, index) => ({
          title: item.tags.name || `Punto de Interés ${index + 1}`, // Si no tiene nombre, asigna uno genérico
          location: {
            latitude: item.lat,
            longitude: item.lon,
          },
          description:
            item.tags.amenity || item.tags.tourism || "Sin descripción",
        })),
      );
    } catch (error) {
      console.error("Error al obtener puntos de interés:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} region={region}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
            description="Ubicación obtenida desde el GPS"
            pinColor="green"
          />
        )}
        {showLocationsOfInterest()}
      </MapView>
      <Text style={styles.paragraph}>{text}</Text>
      <Text style={styles.paragraph}>
        Radio de búsqueda: {radius / 1000} km
      </Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Ajustar radio (+2 km)"
            onPress={() => handleChangeRadius(2)}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Ajustar radio (-2 km)"
            onPress={() => handleChangeRadius(-2)}
          />
        </View>
      </View>

      <Pressable style={styles.searchButton} onPress={findNearbyPlaces}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#ccc", // Light gray background
  },
  paragraph: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
    color: "#333", // Darker text for better readability
  },
  map: {
    width: "100%",
    height: "65%",
    borderRadius: 15, // Rounded corners for a modern feel
    overflow: "hidden", // Ensures the rounded border applies
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5, // Spacing between buttons
  },
  searchButton: {
    marginTop: 10,
    backgroundColor: "#007bff", // Blue primary color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
