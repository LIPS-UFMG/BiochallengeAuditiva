import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from './components/HomeScreen';
import AlertsScreen from './components/AlertsScreen';
import SettingsScreen from './components/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Início"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./assets/icon-home.png')}
                style={{ width: 20, height: 20, opacity: focused ? 1 : 0.3 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Dispositivos"
          component={AlertsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./assets/icon-devices.png')}
                style={{ width: 20, height: 15, opacity: focused ? 1 : 0.3 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Sobre"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./assets/icon-settings.png')}
                style={{ width: 20, height: 20, opacity: focused ? 1 : 0.3 }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
