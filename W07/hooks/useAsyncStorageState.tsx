import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function useAsyncStorageState<T extends unknown>({
  key,
  initialValue,
}: Props<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  async function save() {
    try {
      await AsyncStorage.setItem(
        key,
        JSON.stringify({
          key: value,
        }),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  async function restore() {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        const { key: storedValue } = JSON.parse(item);
        setValue(storedValue ?? value);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  useEffect(() => {
    restore();

    return setValue((value) => value);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue];
}

interface Props<T> {
  initialValue: T;
  key: string;
}
