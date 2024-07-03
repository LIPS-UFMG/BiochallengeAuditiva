import * as React from "react";
import { Text, StyleSheet, Image, View, Pressable } from "react-native";

const IPhone1314Dispositivos = () => {
  return (
    <View style={styles.iphone1314Dispositivos}>
      <View style={[styles.bottomTabBar, styles.bottomTabBarShadowBox]}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tabBarItem, styles.tabItemPosition]}
            onPress={() => {}}
          >
            <Text style={[styles.incio, styles.incioTypo]}>Início</Text>
            <Image
              style={styles.iconhome}
              resizeMode="cover"
              source="Icon/Home.png"
            />
          </Pressable>
          <View style={styles.tabBarItem1}>
            <Text style={[styles.dispositivos, styles.incioTypo]}>
              Dispositivos
            </Text>
            <Image
              style={styles.iconhome}
              resizeMode="cover"
              source="Icon/Radio.png"
            />
          </View>
          <Pressable
            style={[styles.tabBarItem2, styles.tabItemPosition]}
            onPress={() => {}}
          >
            <Text style={[styles.configuraes, styles.incioTypo]}>
              Configurações
            </Text>
            <Image
              style={styles.icon}
              resizeMode="cover"
              source="263100 1.png"
            />
          </Pressable>
        </View>
        <View style={[styles.homeIndicator, styles.homeLayout]}>
          <View style={[styles.homeIndicator1, styles.homeLayout]} />
        </View>
      </View>
      <Image style={styles.transparenteFundoBranco1Icon} source={require('./assets/transparente-fundo-branco.png')} />
      <View style={[styles.buttonSecondary, styles.buttonSecondaryFlexBox]}>
        <Image
          style={styles.buttonSecondaryChild}
          resizeMode="cover"
          source={require('./assets/Ellipse.png')}
        />
        <Text
          style={[
            styles.conectarNovoDispositivo,
            styles.dispositivosConectadosTypo,
          ]}
        >
          Conectar novo dispositivo
        </Text>
      </View>
      <Text
        style={[
          styles.dispositivosConectados,
          styles.dispositivosConectadosTypo,
        ]}
      >
      Dispositivos conectados:
      </Text>
      <View
        style={[styles.iphone1314DispositivosChild, styles.iphone1314Layout]}
      />
      <View
        style={[styles.iphone1314DispositivosItem, styles.iphone1314Layout]}
      />
      <View
        style={[styles.iphone1314DispositivosInner, styles.rectangleViewLayout]}
      />
      <View style={[styles.rectangleView, styles.rectangleViewLayout]} />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabBarShadowBox: {
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: -0.5,
    },
    backgroundColor: "#aaa",
  },
  tabItemPosition: {
    opacity: 0.5,
    width: 76,
    left: "50%",
    height: 49,
    top: 0,
    position: "absolute",
  },
  incioTypo: {
    textAlign: "center",
    color: "#000",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    letterSpacing: 0,
    fontSize: 10,
    bottom: 2,
    left: "50%",
    position: "absolute",
  },
  homeLayout: {
    height: 5,
    width: 134,
    left: "50%",
    position: "absolute",
  },
  buttonSecondaryFlexBox: {
    alignItems: "center",
    position: "absolute",
  },
  dispositivosConectadosTypo: {
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    color: "#000",
    fontWeight: "500",
  },
  iphone1314Layout: {
    height: 191,
    width: 169,
    backgroundColor: "#d9d9d9",
    borderRadius: 21,
    position: "absolute",
  },
  rectangleViewLayout: {
    height: 114,
    width: 165,
    backgroundColor: "#d9d9d9",
    borderRadius: 21,
    position: "absolute",
  },
  incio: {
    marginLeft: -12,
  },
  iconhome: {
    top: 7,
    left: 26,
    width: 24,
    height: 24,
    position: "absolute",
    overflow: "hidden",
  },
  tabBarItem: {
    marginLeft: -172,
  },
  dispositivos: {
    marginLeft: -28,
  },
  tabBarItem1: {
    marginLeft: -38,
    width: 76,
    left: "50%",
    height: 49,
    top: 0,
    position: "absolute",
  },
  configuraes: {
    marginLeft: -34,
  },
  icon: {
    top: 5,
    left: 24,
    width: 27,
    height: 27,
    position: "absolute",
  },
  tabBarItem2: {
    marginLeft: 96,
  },
  tabs: {
    right: 0,
    height: 49,
    top: 0,
    left: 0,
    position: "absolute",
    overflow: "hidden",
  },
  homeIndicator1: {
    marginLeft: -67,
    bottom: 0,
    borderRadius: 100,
    backgroundColor: "#000",
  },
  homeIndicator: {
    marginLeft: -66,
    bottom: 8,
  },
  bottomTabBar: {
    top: 751,
    shadowColor: "#aaaaa",
    shadowRadius: 0,
    elevation: 0,
    width: 390,
    height: 93,
    left: 0,
    shadowOpacity: 0,
    shadowOffset: {
      width: 0,
      height: -0.5,
    },
    position: "absolute",
  },
  transparenteFundoBranco1Icon: {
    top: 2,
    left: 84,
    width: 221,
    height: 135,
    position: "absolute",
  },
  buttonSecondaryChild: {
    width: 13,
    color: "#aaaa",
    height: 13,
  },
  conectarNovoDispositivo: {
    fontSize: 17,
    lineHeight: 26,
    marginLeft: 8,
  },
  buttonSecondary: {
    top: 150,
    left: 46,
    elevation: 40,
    borderRadius: 150,
    borderWidth: 2,
    width: 298,
    height: 57,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 14,
    shadowOpacity: 0,
    shadowOffset: {
      width: 0,
      height: -0.5,
    },
    backgroundColor: "white",
    borderColor: "#81b71a"
  },
  dispositivosConectados: {
    top: 225,
    left: 16,
    fontSize: 20,
    lineHeight: 30,
    display: "flex",
    width: 379,
    height: 61,
    alignItems: "center",
    position: "absolute",
  },
  iphone1314DispositivosChild: {
    left: 20,
    top: 300,
  },
  iphone1314DispositivosItem: {
    top: 428,
    left: 198,
  },
  iphone1314DispositivosInner: {
    left: 198,
    top: 300,
  },
  rectangleView: {
    top: 505,
    left: 22,
  },
  iphone1314Dispositivos: {
    flex: 1,
    width: "100%",
    height: 844,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});

export default IPhone1314Dispositivos;
