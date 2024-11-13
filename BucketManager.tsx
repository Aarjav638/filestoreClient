import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './App';
import {getConfig} from './utils/configrations';

const BucketManager = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'BucketManager'>) => {
  const [awsConfig, setAwsConfig] = useState<any>(null);
  const [azureConfig, setAzureConfig] = useState<any>(null);
  const [wasabiConfig, setWasabiConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [aws, azure, wasabi] = await Promise.all([
          getConfig('aws'),
          getConfig('azure'),
          getConfig('wasabi'),
        ]);
        setAwsConfig(aws);
        setAzureConfig(azure);
        setWasabiConfig(wasabi);

        if (!aws && !azure && !wasabi) {
          Alert.alert(
            'Error',
            'Please configure at least one service to continue.',
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);


  const buckets: {
    name: string;
    config: any;
    icon: any;
    serviceName: string;
  }[] = [
    {
      name: 'AWS Bucket',
      config: awsConfig,
      icon: require('./assets/aws.png'),
      serviceName: 'aws',
    },
    {
      name: 'Azure Bucket',
      config: azureConfig,
      icon: require('./assets/azure.png'),
      serviceName: 'azure',
    },
    {
      name: 'Wasabi Bucket',
      config: wasabiConfig,
      icon: require('./assets/wasabi.png'),
      serviceName: 'wasabi',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleNavigation = (serviceName: string) => {
    if (serviceName === 'aws' && awsConfig) {
      navigation.navigate('AwsFolderScreen');
    } else if (serviceName === 'azure' && azureConfig) {
      navigation.navigate('AzureFolderScreen');
    } else if (serviceName === 'wasabi' && wasabiConfig) {
      navigation.navigate('WasabiFolderScreen');
    } else {
      Alert.alert(
        'Error',
        'Please configure the selected service to continue.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Bucket to Continue</Text>
      {buckets.map(bucket => (
        <View key={bucket.serviceName} style={styles.bucketRow}>
          <TouchableOpacity
            style={styles.bucketButton}
            onPress={() => handleNavigation(bucket.serviceName)}>
            <Image source={bucket.icon} style={styles.bucketIcon} />
            <Text style={styles.bucketText}>{bucket.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gearButton}
            onPress={() =>
              navigation.navigate('SettingsScreen', {
                serviceName: bucket.serviceName,
              })
            }>
            <Image
              source={require('./assets/gear.png')}
              style={styles.gearIcon}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default BucketManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  bucketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    height: Dimensions.get('screen').height / 20,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: 'lightblue',
    marginBottom: 10,
  },
  bucketButton: {
    width: '60%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bucketIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  bucketText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gearButton: {
    width: '15%',
  },
  gearIcon: {
    width: '100%',
    height: 30,
    resizeMode: 'contain',
  },
});
