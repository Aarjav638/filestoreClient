import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import React from 'react';
import {configuration, saveConfig} from './utils/configrations';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './App';
const Settings = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'SettingsScreen'>) => {
  const serviceName = route.params.serviceName;
  const [config, setConfig] = React.useState<configuration>({
    accessKey: '',
    secretKey: '',
    bucketName: '',
    region: '',
  });
  const [BlobSasUrl, setBlobSasUrl] = React.useState('');
  const handleSaveConfig = async () => {
    if (serviceName === 'azure') {
        await saveConfig(serviceName,undefined,BlobSasUrl);
    }
    else{

        await saveConfig(serviceName, config,undefined);
    }

    navigation.navigate('BucketManager');
  };
  return (
    <View style={styles.container}>
      {serviceName === 'azure' ? (
        <>
        <Text>Configure Azure</Text>
        <Text>Service Name</Text>
          <TextInput
            placeholder="Enter Service Name"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={serviceName}
            editable={false}
          />
          <Text>BlobSasUrl</Text>
          <TextInput
            placeholder="Enter BlobSasUrl"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={BlobSasUrl}
            onChangeText={setBlobSasUrl}
          />
          </>
      ) : (
        <>
          <Text>Configure Bucket</Text>
          <Text>Service Name</Text>
          <TextInput
            placeholder="Enter Service Name"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={serviceName}
            editable={false}
          />
          <Text>Access Key</Text>
          <TextInput
            placeholder="Enter Access Key"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={config.accessKey}
            onChangeText={text => setConfig({...config, accessKey: text})}
          />
          <Text>Secret Key</Text>
          <TextInput
            placeholder="Enter Secret Key"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={config.secretKey}
            onChangeText={text => setConfig({...config, secretKey: text})}
          />
          <Text>Bucket Name</Text>
          <TextInput
            placeholder="Enter Bucket Name"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={config.bucketName}
            onChangeText={text => setConfig({...config, bucketName: text})}
          />

          <Text>Region</Text>

          <TextInput
            placeholder="Enter Region"
            style={{
              width: '80%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            value={config.region}
            onChangeText={text => setConfig({...config, region: text})}
          />
        </>
      ) }

      <Button title="Save" onPress={handleSaveConfig} />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
  },
});
