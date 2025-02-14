import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const storedBusinesses = await AsyncStorage.getItem('businesses');
      if (storedBusinesses) {
        setBusinesses(JSON.parse(storedBusinesses));
      }
    } catch (error) {
      console.error("Error loading businesses", error);
    }
  };

  const saveBusinesses = async (newBusinesses) => {
    try {
      await AsyncStorage.setItem('businesses', JSON.stringify(newBusinesses));
      setBusinesses(newBusinesses);
    } catch (error) {
      console.error("Error saving businesses", error);
    }
  };

  const addBusiness = (name, website, phone, email, services, category) => {
    if (!name || !website || !phone || !email || !services || !category) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    const newBusiness = { id: Date.now(), name, website, phone, email, services, category };
    const updatedBusinesses = [...businesses, newBusiness];
    saveBusinesses(updatedBusinesses);
  };

  const deleteBusiness = (id) => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar esta empresa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => {
            const updatedBusinesses = businesses.filter(b => b.id !== id);
            saveBusinesses(updatedBusinesses);
          }
        }
      ]
    );
  };

  return (
    <DatabaseContext.Provider value={{ businesses, addBusiness, deleteBusiness }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);

export const BusinessList = () => {
  const { businesses, deleteBusiness } = useDatabase();
  return (
    <FlatList
      data={businesses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.businessItem}>
          <Text style={styles.businessText}>{item.name} ({item.category})</Text>
          <Button title="Eliminar" color="red" onPress={() => deleteBusiness(item.id)} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  businessItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  businessText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
