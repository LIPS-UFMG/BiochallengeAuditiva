import * as React from "react";
import { Text, StyleSheet, Image, View, Pressable } from "react-native";

const IPhone1314Configuraes = () => {
  return (
    <View style={styles.iphone1314Configuraes}>
      <View style={styles.bottomTabBar}>
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
          <Pressable
            style={[styles.tabBarItem1, styles.tabItemPosition]}
            onPress={() => {}}
          >
            <Text style={[styles.dispositivos, styles.incioTypo]}>
              Dispositivos
            </Text>
            <Image
              style={styles.iconhome}
              resizeMode="cover"
              source="Icon/Radio.png"
            />
          </Pressable>
          <View style={styles.tabBarItem2}>
            <Text style={[styles.configuraes, styles.incioTypo]}>
              Configurações
            </Text>
            <Image
              style={styles.icon}
              resizeMode="cover"
              source="263100 1.png"
            />
          </View>
        </View>
        <View style={[styles.homeIndicator, styles.homeLayout]}>
          <View style={[styles.homeIndicator1, styles.homeIndicator1Bg]} />
        </View>
      </View>
      <View
        style={[styles.iphone1314ConfiguraesChild, styles.iphone1314Layout1]}
      />
      <View
        style={[styles.iphone1314ConfiguraesItem, styles.iphone1314Layout]}
      />
      <View
        style={[styles.iphone1314ConfiguraesInner, styles.iphone1314Layout1]}
      />
      <View style={[styles.rectangleView, styles.iphone1314Layout]} />
      <View
        style={[styles.iphone1314ConfiguraesChild1, styles.iphone1314Layout]}
      />
      <View style={styles.profileAvatar}>
        <Image
          style={styles.graphicIcon}
          resizeMode="cover"
          source="Graphic.png"
        />
        <View style={styles.copy}>
          <Text style={styles.olJuliana} numberOfLines={1}>
            Olá, Juliana
          </Text>
        </View>
      </View>
      <View
        style={[styles.iphone1314ConfiguraesChild2, styles.homeIndicator1Bg]}
      />
      <Text style={styles.editarPerfil}>Editar perfil</Text>
      <Text style={styles.aaTexto}>
        <Text style={styles.aaTextoTxtContainer}>
          <Text style={styles.aa}>{`Aa  `}</Text>
          <Text style={styles.texto}>Texto</Text>
        </Text>
      </Text>
      <Text style={[styles.sensibilidade, styles.sobreOAppTypo]}>
        Sensibilidade
      </Text>
      <Text style={[styles.dispositivos1, styles.sobreOAppTypo]}>
        Dispositivos
      </Text>
      <Text style={[styles.compartilhe, styles.sobreOAppTypo]}>
        Compartilhe
      </Text>
      <Text style={[styles.sobreOApp, styles.sobreOAppTypo]}>Sobre o app</Text>
      <Image
        style={styles.iconradio1}
        resizeMode="cover"
        source="Icon/Radio.png"
      />
      <Image
        style={[styles.share1Icon, styles.iconPosition]}
        resizeMode="cover"
        source="Share 1.png"
      />
      <Image
        style={styles.ellipseIcon}
        resizeMode="cover"
        source="Ellipse 7.png"
      />
      <Text style={styles.i}>i</Text>
      <Image
        style={[styles.pngtreeMicrophoneVectorIcon, styles.iconPosition]}
        resizeMode="cover"
        source="pngtree-microphone-vector-icon-png-image_355818.jpg 1.png"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  homeIndicator1Bg: {
    backgroundColor: "#000",
    position: "absolute",
  },
  iphone1314Layout1: {
    height: 68,
    width: 482,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
    borderStyle: "solid",
    position: "absolute",
  },
  iphone1314Layout: {
    left: -47,
    height: 68,
    width: 482,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
    borderStyle: "solid",
    position: "absolute",
  },
  sobreOAppTypo: {
    height: 67,
    width: 363,
    left: 117,
    lineHeight: 42,
    fontSize: 30,
    textAlign: "left",
    display: "flex",
    fontFamily: "Montserrat-Medium",
    alignItems: "center",
    color: "#000",
    fontWeight: "500",
    position: "absolute",
  },
  iconPosition: {
    width: 56,
    left: 23,
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
    width: 76,
    left: "50%",
    height: 49,
    top: 0,
    position: "absolute",
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
    height: 5,
    width: 134,
    left: "50%",
  },
  homeIndicator: {
    marginLeft: -66,
    bottom: 8,
    position: "absolute",
  },
  bottomTabBar: {
    top: 693,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: -0.5,
    },
    shadowRadius: 0,
    elevation: 0,
    shadowOpacity: 1,
    width: 390,
    height: 93,
    left: 0,
    position: "absolute",
    backgroundColor: "#fff",
  },
  iphone1314ConfiguraesChild: {
    top: 278,
    left: -36,
  },
  iphone1314ConfiguraesItem: {
    top: 346,
  },
  iphone1314ConfiguraesInner: {
    left: -61,
    top: 414,
  },
  rectangleView: {
    top: 482,
  },
  iphone1314ConfiguraesChild1: {
    top: 550,
  },
  graphicIcon: {
    borderRadius: 81,
    height: 138,
    width: 137,
    overflow: "hidden",
  },
  olJuliana: {
    fontSize: 14,
    lineHeight: 20,
    justifyContent: "center",
    width: 100,
    display: "flex",
    fontFamily: "Montserrat-Medium",
    alignItems: "center",
    textAlign: "center",
    color: "#000",
    fontWeight: "500",
    overflow: "hidden",
  },
  copy: {
    marginTop: 8,
    alignItems: "center",
    width: 137,
  },
  profileAvatar: {
    top: 49,
    left: 126,
    height: 165,
    width: 137,
    position: "absolute",
  },
  iphone1314ConfiguraesChild2: {
    top: 224,
    left: 150,
    borderRadius: 50,
    width: 90,
    height: 17,
  },
  editarPerfil: {
    top: 225,
    left: 165,
    lineHeight: 14,
    color: "#fff",
    fontFamily: "Montserrat-Medium",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 10,
    position: "absolute",
  },
  aa: {
    fontSize: 50,
  },
  texto: {
    fontSize: 30,
  },
  aaTextoTxtContainer: {
    width: "100%",
  },
  aaTexto: {
    top: 277,
    width: 394,
    textAlign: "left",
    left: 23,
    display: "flex",
    fontFamily: "Montserrat-Medium",
    alignItems: "center",
    height: 68,
    color: "#000",
    fontWeight: "500",
    position: "absolute",
  },
  sensibilidade: {
    top: 346,
  },
  dispositivos1: {
    top: 414,
  },
  compartilhe: {
    top: 482,
  },
  sobreOApp: {
    top: 549,
  },
  iconradio1: {
    top: 423,
    width: 55,
    height: 55,
    left: 23,
    position: "absolute",
    overflow: "hidden",
  },
  share1Icon: {
    top: 488,
    height: 56,
  },
  ellipseIcon: {
    top: 561,
    left: 29,
    width: 44,
    height: 44,
    position: "absolute",
  },
  i: {
    top: 572,
    left: 47,
    width: 12,
    height: 21,
    lineHeight: 42,
    fontSize: 30,
    textAlign: "left",
    display: "flex",
    fontFamily: "Montserrat-Medium",
    alignItems: "center",
    color: "#000",
    fontWeight: "500",
    position: "absolute",
  },
  pngtreeMicrophoneVectorIcon: {
    top: 354,
    height: 54,
  },
  iphone1314Configuraes: {
    flex: 1,
    height: 844,
    overflow: "hidden",
    width: "100%",
    backgroundColor: "#fff",
  },
});

export default IPhone1314Configuraes;
