import * as React from "react";
import { Text, StyleSheet, Image, View, Dimensions } from "react-native";

const IPhone1314Configuraes = () => {
  return (
    <View style={styles.iphone1314Configuraes}>
      <Text style={styles.olSomosO}>{`Olá, somos o MeEscuta! `}</Text>
      <Text style={[styles.verso10, styles.verso10Typo]}>versão 1.0</Text>
      <Image
        style={styles.transparenteFundoBranco1Icon}
        source={require("./assets/transparente-fundo-branco.png")}
      />
      <Text style={[styles.poweredBy, styles.verso10Typo]}>Powered by:</Text>
      <View style={styles.logosContainer}>
        <Image
          style={styles.lipsFundoBranco1Icon}
          resizeMode="center"
          source={require("./assets/LIPS-Fundo_branco.png")}
        />
        <Image
          style={styles.logoUfmg1Icon}
          resizeMode="center"
          source={require("./assets/Logo_UFMG.png")}
        />
      </View>
    </View>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  verso10Typo: {
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
    fontSize: 12,
    position: "absolute",
  },
  olSomosO: {
    top: height * 0.05,
    color: "#000",
    textAlign: "center",
    fontSize: 16,
     position: "absolute",
  },
  verso10: {
    top: height * 0.83,
    fontFamily: "Arial",
    color: "rgba(0, 0, 0, 0.6)",
    position: "absolute",
  },
  transparenteFundoBranco1Icon: {
    top: height * 0.27,
    width: "100%",
    height: height * 0.25,
    position: "absolute",
  },
  poweredBy: {
    top: height * 0.70,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
    position: "absolute",
  },
  logosContainer: {
    top: height * 0.73,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    position: "absolute",
  },
  lipsFundoBranco1Icon: {
    width: "45%",
    height: height * 0.05,
  },
  logoUfmg1Icon: {
    width: "45%",
    height: height * 0.05,
  },
  iphone1314Configuraes: {
    backgroundColor: "#fff",
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default IPhone1314Configuraes;
