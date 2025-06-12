import { encryptData, decryptData } from "../Components/Util/crypto";
import storage from "redux-persist/lib/storage";

const encryptedStorage = {
  setItem: (key, value) => {
    try {
      const encryptedValue = encryptData(value);
      return storage.setItem(key, encryptedValue);
    } catch (e) {
      return storage.setItem(key, value);
    }
  },
  getItem: (key) => {
    return storage.getItem(key).then((value) => {
      try {
        return decryptData(value);
      } catch (e) {
        return value;
      }
    });
  },
  removeItem: (key) => storage.removeItem(key),
};

export default encryptedStorage;
