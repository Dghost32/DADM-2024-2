import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import alert from "./alert";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

const App = () => {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState("");
  const [classification, setClassification] = useState("consultoría");
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const storedCompanies = await AsyncStorage.getItem("companies");
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    }
  };

  const saveCompanies = async (updatedCompanies) => {
    setCompanies(updatedCompanies);
    await AsyncStorage.setItem("companies", JSON.stringify(updatedCompanies));
  };

  const addCompany = () => {
    if (!name || !website || !phone || !email || !services) {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Congrats! this is dialog box success",
        button: "close",
      });
      return;
    }

    const newCompanies = editingId
      ? companies.map((company) =>
          company.id === editingId
            ? {
                id: editingId,
                name,
                website,
                phone,
                email,
                services,
                classification,
              }
            : company,
        )
      : [
          ...companies,
          {
            id: Date.now(),
            name,
            website,
            phone,
            email,
            services,
            classification,
          },
        ];

    saveCompanies(newCompanies);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setWebsite("");
    setPhone("");
    setEmail("");
    setServices("");
    setClassification("consultoría");
  };

  const confirmDeleteCompany = (id) => {
    alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar esta empresa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => deleteCompany(id) },
      ],
    );
  };

  const deleteCompany = (id) => {
    const filteredCompanies = companies.filter((company) => company.id !== id);
    saveCompanies(filteredCompanies);
  };

  const editCompany = (company) => {
    setEditingId(company.id);
    setName(company.name);
    setWebsite(company.website);
    setPhone(company.phone);
    setEmail(company.email);
    setServices(company.services);
    setClassification(company.classification);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      (search
        ? company.name.toLowerCase().includes(search.toLowerCase())
        : true) && (filter ? company.classification === filter : true),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Directorio de Empresas</Text>
      <View
        style={{
          ...styles.floatingCard,
          ...{
            borderColor: editingId ? "#007bff" : "#28a745",
            borderWidth: 1,
          },
        }}
      >
        <Text style={styles.subHeader}>
          {editingId ? "Actualizar Empresa" : "Agregar Empresa"}
        </Text>
        <TextInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Página Web"
          value={website}
          onChangeText={setWebsite}
          style={styles.input}
        />
        <TextInput
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Productos y Servicios"
          value={services}
          onChangeText={setServices}
          style={styles.input}
        />
        <Picker
          selectedValue={classification}
          onValueChange={setClassification}
          style={styles.picker}
        >
          <Picker.Item label="Consultoría" value="consultoría" />
          <Picker.Item label="Desarrollo a la medida" value="desarrollo" />
          <Picker.Item label="Fábrica de software" value="fábrica" />
        </Picker>
        <Button
          title={editingId ? "Actualizar" : "Agregar"}
          onPress={addCompany}
        />
      </View>

      <View style={styles.floatingCard}>
        <Text style={styles.subHeader}>Buscar y Filtrar</Text>
        <TextInput
          placeholder="Buscar por nombre"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <Picker
          selectedValue={filter}
          onValueChange={setFilter}
          style={styles.picker}
        >
          <Picker.Item label="Todas" value="" />
          <Picker.Item label="Consultoría" value="consultoría" />
          <Picker.Item label="Desarrollo a la medida" value="desarrollo" />
          <Picker.Item label="Fábrica de software" value="fábrica" />
        </Picker>
        <FlatList
          data={filteredCompanies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.company}>
              <Text>
                {item.name} ({item.classification})
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Editar" onPress={() => editCompany(item)} />
                <Button
                  title="Eliminar"
                  color="red"
                  onPress={() => confirmDeleteCompany(item.id)}
                />
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: { height: 50, marginBottom: 10 },
  company: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  floatingCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  stateText: { marginBottom: 5, alignSelf: "flex-end" },
});

export default App;
