import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { getConfig, configuration } from './utils/configrations';

type Content = {
  name: string;
  isFolder: boolean;
};

const AwsFolderScreen = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<Content[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [awsConfig, setAwsConfig] = useState<configuration | null>(null);

  const allowedExtensions = [
    '.3g2', '.3gp', '.7z', '.aac', '.asf', '.avi', '.bmp', '.doc', '.docx',
    '.f4a', '.f4b', '.f4p', '.f4v', '.flac', '.flv', '.gif', '.gz', '.jpeg',
    '.jpg', '.m2ts', '.m2v', '.m4a', '.m4b', '.m4p', '.m4r', '.m4s', '.m4v',
    '.mkv', '.mov', '.mp3', '.mp4', '.mpeg', '.mpg', '.mts', '.ogg', '.opus',
    '.pdf', '.png', '.ppt', '.pptx', '.rar', '.tar', '.tgz', '.ts', '.txt',
    '.wav', '.webm', '.wma', '.wmv', '.xls', '.xlsx', '.zip',
  ];

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setLoading(true);
        const config = await getConfig('aws');
        if (config) {
          setAwsConfig(config);
        } else {
          Alert.alert('Error', 'AWS configuration not found.');
        }
      } catch (error) {
        console.error('Error fetching AWS configuration:', error);
        Alert.alert('Error', 'Failed to load AWS configuration.');
      } finally {
        setLoading(false);
      }
    };
    initializeConfig();
  }, []);

  useEffect(() => {
    if (awsConfig) {
      fetchContents();
    }
  }, [currentPath, awsConfig]);


  console.log(awsConfig)

  const fetchContents = async () => {
    if (!awsConfig) return;

    setLoading(true);
    try {
      const response = await axios.post('https://filestoreserver.onrender.com/aws/fetch-content', {
        currentPath,
        accessKeyId: awsConfig.accessKey,
        secretAccessKey: awsConfig.secretKey,
        region: awsConfig.region,
        bucketName: awsConfig.bucketName,
      });
      setContents([...response.data.folders, ...response.data.files]);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      Alert.alert('Error', 'Failed to load folder contents.');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Folder name cannot be empty.');
      return;
    }
    if (!awsConfig) return;

    setLoading(true);
    try {
      await axios.post('https://filestoreserver.onrender.com/aws/create-folder', {
        folderName: newFolderName,
        currentPath,
        accessKeyId: awsConfig.accessKey,
        secretAccessKey: awsConfig.secretKey,
        region: awsConfig.region,
        bucketName: awsConfig.bucketName,
      });
      setNewFolderName('');
      fetchContents();
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    
    const formData = new FormData();
    if (!awsConfig) return;

    try {
        formData.append('accessKeyId', awsConfig.accessKey);
        formData.append('secretAccessKey', awsConfig.secretKey);
        formData.append('region', awsConfig.region);
        formData.append('bucketName', awsConfig.bucketName);
        formData.append('currentPath', currentPath);
      const files = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [DocumentPicker.types.allFiles],
      });
      console.log('Files:', files);
      files.forEach((file) => {
        const { uri, name ,type} = file;
        const extension = name?name.split('.').pop() :'';
        if (!allowedExtensions.includes(`.${extension}`)) {
          Alert.alert('Error', `File type not allowed: ${extension}`);
          return;
        }
        const sanitizedFileName = name ? name.replace(/[^a-zA-Z0-9._-]/g, '_') : '';
        formData.append('files', {
            uri: uri,
            type: type,
            name: sanitizedFileName,
        });
      });

      console.log('FormData:', formData.getParts());


      const response = await axios.post(
        'https://filestoreserver.onrender.com/aws/upload-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Upload response:', response.data);


      Alert.alert('Success', 'Files uploaded successfully!');
      fetchContents();
    } catch (error) {
      console.error('Error uploading files:', (error as Error).message);
      Alert.alert('Error', 'Failed to upload files.');
    }
  };

  const navigateToFolder = (folder: Content) => {
    setCurrentPath((prevPath) => `${prevPath}${folder.name}`);
  };

  const goBack = () => {
    if (!currentPath) return;
    setCurrentPath((prevPath) => {
      const parts = prevPath.split('/').filter(Boolean);
      parts.pop();
      return parts.length>0 ? `${parts.join('/')}/` : '';
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.path}>Current Path: {currentPath || '/'}</Text>
      <TextInput
        placeholder="Enter folder name"
        value={newFolderName}
        onChangeText={setNewFolderName}
        style={styles.input}
      />
      <Button title="Create Folder" onPress={createFolder} />
      <Button title="Upload File" onPress={uploadFile} />
      {loading && <ActivityIndicator size="large" />}
      {!loading && contents.length === 0 && <Text>No files or folders found.</Text>}
      <FlatList
        data={contents}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => (item.isFolder ? navigateToFolder(item) : Alert.alert('File', item.name))}
            style={styles.item}
          >
            <Text>{item.isFolder ? `📁 ${item.name}` : `📄 ${item.name}`}</Text>
          </TouchableOpacity>
        )}
      />
      {currentPath && <Button title="Go Back" onPress={goBack} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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

export default AwsFolderScreen;
