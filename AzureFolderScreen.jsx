import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BlobServiceClient } from '@azure/storage-blob';
import * as DocumentPicker from 'react-native-document-picker';
import { getConfig } from './utils/configrations';

const AzureFolderScreen = () => {
  const [containers, setContainers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [blobSasUrl, setBlobSasUrl] = useState();
  const [currentPath, setCurrentPath] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentContainer, setCurrentContainer] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const config = await getConfig('azure');
        console.log('Azure config:', config);
        setBlobSasUrl(config);
      } catch (error) {
        console.error('Error fetching Azure config:', error.message);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (blobSasUrl) {
      listContainers();
    }
  }, [blobSasUrl]);

  useEffect(() => {
    if (currentContainer) {
      listFiles(currentPath);
    }
  }, [currentPath, currentContainer]);

  const blobServiceClient = blobSasUrl
    ? new BlobServiceClient(blobSasUrl)
    : null;

  const listContainers = async () => {
    setLoading(true);
    try {
      const containersList = [];
      for await (const container of blobServiceClient.listContainers()) {
        containersList.push(container.name);
      }
      setContainers(containersList);
    } catch (error) {
      console.error('Error listing containers:', error.message);
      Alert.alert('Error', 'Failed to list containers.');
    } finally {
      setLoading(false);
    }
  };

  const listFiles = async (path) => {
    console.log('Listing files:', path);
    if (!currentContainer) return;

    setLoading(true);
    
    console.log('Current container:', currentContainer);
    try {
      const containerClient = blobServiceClient.getContainerClient(
        currentContainer
      );
      const items = [];
      const iter = containerClient.listBlobsByHierarchy('/', { prefix: path });

      for await (const item of iter) {
        if (item.kind === 'prefix') {
          const folderName = item.name.replace(path, '');
          items.push({ name: folderName, isFolder: true });
        } else {
            const fileName = item.name.replace(path, '');
          items.push({ name: fileName, isFolder: false });
        }
      }

      setFileList(
        items.filter(
          (item) =>
            item.name !==''
        )
      );
    } catch (error) {
      console.error('Error listing files:', error.message);
      Alert.alert('Error', 'Failed to retrieve file list.');
    } finally {
      setLoading(false);
    }
  };
  console.log('fileList:',fileList)

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Folder name cannot be empty.');
      return;
    }
    if (!currentContainer) {
      Alert.alert('Error', 'Please select a container first.');
      return;
    }

    try {
      const containerClient = blobServiceClient.getContainerClient(
        currentContainer
      );
      const folderPath = `${currentPath}${newFolderName.trim()}/`;
      const folderBlobClient = containerClient.getBlockBlobClient(folderPath);
      await folderBlobClient.upload('', 0);
      Alert.alert('Success', `Folder "${newFolderName}" created.`);
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error.message);
      Alert.alert('Error', 'Failed to create folder.');
    }
  };

  const selectFiles = async () => {
    if (!currentContainer) {
      Alert.alert('Error', 'Please select a container first.');
      return;
    }

    try {
      const files = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      if (files) {
        uploadFiles(files);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('Document picker canceled.');
      } else {
        console.error('Error picking document:', error.message);
      }
    }
  };

  const uploadFiles = async (files) => {
    if (!currentContainer) {
      Alert.alert('Error', 'Please select a container first.');
      return;
    }

    setLoading(true);
    try {
      const containerClient = blobServiceClient.getContainerClient(
        currentContainer
      );
      const promises = [];
      for (const file of files) {
        const blockBlobClient = containerClient.getBlockBlobClient(
          `${currentPath}${file.name}`
        );
        promises.push(blockBlobClient.uploadBrowserData(file));
      }
      await Promise.all(promises);
      listFiles(currentPath);
    } catch (error) {
      console.error('Error uploading files:', error.message);
      Alert.alert('Error', 'Failed to upload files.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentPath((prevPath) => `${prevPath}${folder.name}`);
  };

  const goBack = () => {
    if (!currentPath) return;
    setCurrentPath((prevPath) => {
      const parts = prevPath.split('/').filter(Boolean);
      parts.pop();
      return parts.length > 0 ? `${parts.join('/')}/` : '';
    });
  };

  const selectContainer = (container) => {
    console.log('Selected container:', container);
    setCurrentContainer(container);
    setCurrentPath('');
    setFileList([]);
    listFiles(currentPath);
  };

  if (!blobSasUrl) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  console.log(',,,',fileList)

  return (
    <View style={styles.container}>
      {!currentContainer && (
        <>
          <Text style={styles.title}>Select a Container</Text>
          {loading && <ActivityIndicator size="large" />}
          <FlatList
            data={containers}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectContainer(item)}
                style={styles.item}
              >
                <Text>📦 {item}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {currentContainer && (
        <>
          <Text style={styles.path}>
            Current Container: {currentContainer}
          </Text>
          <Text style={styles.path}>Current Path: {currentPath || '/'}</Text>
          <TextInput
            placeholder="Enter folder name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            style={styles.input}
          />
          <Button title="Create Folder" onPress={createFolder} />
          <Button title="Upload File" onPress={selectFiles} />
          {loading && <ActivityIndicator size="large" />}
          {!loading && fileList.length === 0 && (
            <Text>No files or folders found.</Text>
          )}
          <FlatList
            data={fileList}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item.isFolder
                    ? navigateToFolder(item)
                    : Alert.alert('File', item.name)
                }
                style={styles.item}
              >
                <Text>
                  {item.isFolder
                    ? `📁 ${item.name.slice(0, -1)}`
                    : `📄 ${item.name}`}
                </Text>
              </TouchableOpacity>
            )}
          />
          {currentPath && <Button title="Go Back" onPress={goBack} />}
          <Button
            title="Select Another Container"
            onPress={() => setCurrentContainer(null)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap:20,
    padding: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  path: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AzureFolderScreen;
