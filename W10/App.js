import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

const API_URL = "http://www.datos.gov.co/resource/wwkg-r6te.json";

export default function App() {
  const [departamento, setDepartamento] = useState(null);
  const [municipio, setMunicipio] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}?$SELECT=departamento,COUNT(*)&$GROUP=departamento`)
      .then((res) => res.json())
      .then((data) =>
        setDepartamentos(
          data.map((item) => ({
            label: item.departamento,
            value: item.departamento,
          })),
        ),
      )
      .catch((err) => console.error("Error fetching departamentos:", err));
  }, []);

  const fetchMunicipios = (departamento) => {
    fetch(
      `${API_URL}?$select=municipio&$where=departamento='${departamento}'&$group=municipio`,
    )
      .then((res) => res.json())
      .then((data) =>
        setMunicipios(
          data.map((item) => ({
            label: item.municipio,
            value: item.municipio,
          })),
        ),
      )
      .catch((err) => console.error("Error fetching municipios:", err));
  };

  const fetchEventos = () => {
    fetch(
      `${API_URL}?$where=departamento='${departamento}'&municipio='${municipio}'`,
    )
      .then((res) => res.json())
      .then(setEventos)
      .catch((err) => console.error("Error fetching eventos:", err));
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "white",
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={styles.title}>⚠️ Emergencias en Colombia</Text>

        <Dropdown
          style={styles.dropdown}
          data={departamentos}
          labelField="label"
          valueField="value"
          placeholder="Departamento"
          value={departamento}
          onChange={(item) => {
            setDepartamento(item.value);
            fetchMunicipios(item.value);
          }}
          renderLeftIcon={() => (
            <AntDesign
              name="earth"
              size={20}
              color="black"
              style={styles.icon}
            />
          )}
        />

        <Dropdown
          style={styles.dropdown}
          data={municipios}
          labelField="label"
          valueField="value"
          placeholder="Municipio"
          value={municipio}
          onChange={(item) => setMunicipio(item.value)}
          renderLeftIcon={() => (
            <AntDesign
              name="enviroment"
              size={20}
              color="black"
              style={styles.icon}
            />
          )}
        />

        <Pressable style={styles.button} onPress={fetchEventos}>
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setEventoSeleccionado(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.cardTitle}>{item.evento}</Text>
            <Text style={styles.cardText}>
              <AntDesign
                name="enviroment"
                size={20}
                color="black"
                style={styles.icon}
              />{" "}
              {item.municipio}, {item.departamento}
            </Text>
            <Text style={styles.cardText}>
              <AntDesign
                name="calendar"
                size={20}
                color="black"
                style={styles.icon}
              />{" "}
              {item.fecha}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Detalles del Evento</Text>
              {eventoSeleccionado && (
                <>
                  <Text style={styles.modalText}>
                    📅 Fecha: {eventoSeleccionado.fecha}
                  </Text>
                  <Text style={styles.modalText}>
                    📍 {eventoSeleccionado.municipio},{" "}
                    {eventoSeleccionado.departamento}
                  </Text>
                  <Text style={styles.modalText}>
                    ⚠️ Evento: {eventoSeleccionado.evento}
                  </Text>
                </>
              )}
              <TouchableOpacity
                style={styles.buttonClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ccc" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  icon: { marginRight: 10 },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  cardText: { fontSize: 14, color: "#555" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 5 },
  buttonClose: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
});
