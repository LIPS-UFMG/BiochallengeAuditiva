import * as React from "react";
import {Text, StyleSheet, Image, View} from "react-native";

const IPhone1314Configuraes = () => {
  	
  	return (
    		<View style={styles.iphone1314Configuraes}>
      			<Text style={styles.olSomosO}>{`olá, somos o MeEscuta! `}</Text>
      			<Text style={[styles.verso10, styles.verso10Typo]}>versão 1.0</Text>
      			<Image style={styles.transparenteFundoBranco1Icon} source={require('./assets/transparente-fundo-branco.png')} />
      			<Text style={[styles.poweredBy, styles.verso10Typo]}>Powered by:</Text>
      			<Image style={styles.lipsFundoBranco1Icon} resizeMode="center" source={require('./assets/LIPS-Fundo_branco.png')} />
      			<Image style={styles.logoUfmg1Icon} resizeMode="center" source={require('./assets/Logo_UFMG.png')} />
    		</View>);
};

const styles = StyleSheet.create({
  	verso10Typo: {
    		color: "rgba(0, 0, 0, 0.6)",
    		textAlign: "center",
    		fontSize: 12,
    		position: "absolute"
  	},
  	olSomosO: {
    		top: 511,
    		left: 128,
    		color: "#000",
    		textAlign: "center",
    		fontSize: 12,
    		fontFamily: "Inter-Regular",
    		position: "absolute"
  	},
  	verso10: {
    		top: 526,
    		left: 166,
    		fontFamily: "Inter-Regular",
    		color: "rgba(0, 0, 0, 0.6)"
  	},
  	transparenteFundoBranco1Icon: {
    		top: 56,
			left: 20,
    		width: 351,
    		height: 214,
    		position: "absolute"
  	},
  	poweredBy: {
    		top: 571,
    		left: 158,
    		fontWeight: "700",
    		fontFamily: "Inter-Bold"
  	},
  	lipsFundoBranco1Icon: {
    		top: 596,
    		left: 103,
    		width: 82,
    		height: 46,
    		position: "absolute"
  	},
  	logoUfmg1Icon: {
    		top: 598,
    		left: 185,
    		width: 106,
    		height: 41,
    		position: "absolute"
  	},
  	iphone1314Configuraes: {
    		backgroundColor: "#fff",
    		flex: 1,
    		width: "100%",
    		height: 844,
    		overflow: "hidden"
  	}
});

export default IPhone1314Configuraes;
