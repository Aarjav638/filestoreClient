import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BucketManager from './BucketManager';
import FolderScreen from './AwsFolderScreen';
import Settings from './Settings';
import AwsFolderScreen from './AwsFolderScreen';
import WasabiFolderScreen from './WasabiFolderScreen';
import AzureFolderScreen from './AzureFolderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
    BucketManager: undefined;
    AwsFolderScreen: undefined;
    WasabiFolderScreen: undefined;
    AzureFolderScreen: undefined;
    SettingsScreen: {
        serviceName: string;
    };
};
const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="BucketManager" screenOptions={{
                headerStyle: {
                    backgroundColor: 'lightblue',
                },
                headerTintColor: 'black',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },

            }}>
                <Stack.Screen name="BucketManager" component={BucketManager} options={{ title: 'Select Bucket' }} />
                <Stack.Screen name="AwsFolderScreen" component={AwsFolderScreen} options={{ title: 'Aws Folder Manager' }} />
                <Stack.Screen name="WasabiFolderScreen" component={WasabiFolderScreen} options={{ title: 'Wasabi Folder Manager' }} />
                <Stack.Screen name="AzureFolderScreen" component={AzureFolderScreen} options={{ title: 'Azure Folder Manager' }} />
                <Stack.Screen name="SettingsScreen" component={Settings} options={{ title: 'Settings' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
