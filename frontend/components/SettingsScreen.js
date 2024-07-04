import * as React from "react";
import {Text, StyleSheet, View} from "react-native";

const IPhone1314Configuraes = () => {
  	
  	return (
    		<View style={styles.iphone1314Configuraes}>
      			<View style={[styles.button, styles.buttonFlexBox]}>
        				<View style={[styles.stateLayer, styles.buttonFlexBox]}>
          					<Text style={styles.labelText}>{`Aa | Texto                      >`}</Text>
        				</View>
      			</View>
      			<View style={[styles.button1, styles.buttonFlexBox]}>
        				<View style={[styles.stateLayer, styles.buttonFlexBox]}>
          					<Text style={styles.labelText}>{`      | Contraste              >`}</Text>
        				</View>
      			</View>
      			<View style={[styles.button2, styles.buttonFlexBox]}>
        				<View style={[styles.stateLayer, styles.buttonFlexBox]}>
          					<Text style={styles.labelText}>{`   i  | Sobre o app           >`}</Text>
        				</View>
      			</View>
    		</View>);
};

const styles = StyleSheet.create({
  	buttonFlexBox: {
    		justifyContent: "center",
    		alignItems: "center"
  	},
  	labelText: {
    		fontSize: 28,
    		lineHeight: 36,
    		fontFamily: "Roboto-Regular",
    		color: "#fff",
    		textAlign: "center"
  	},
  	stateLayer: {
    		alignSelf: "stretch",
    		backgroundColor: "#1b1b1b",
    		flexDirection: "row",
    		paddingHorizontal: 24,
    		paddingVertical: 10,
    		alignItems: "center",
    		flex: 1
  	},
  	button: {
    		top: 450,
    		height: 56,
    		width: 324,
    		backgroundColor: "#green",
    		borderRadius: 100,
    		left: 33,
    		position: "absolute",
    		alignItems: "center",
    		overflow: "hidden"
  	},
  	button1: {
    		top: 520,
    		height: 56,
    		width: 324,
    		backgroundColor: "#65558f",
    		borderRadius: 100,
    		left: 33,
    		position: "absolute",
    		alignItems: "center",
    		overflow: "hidden"
  	},
  	button2: {
    		top: 590,
    		height: 56,
    		width: 324,
    		backgroundColor: "#65558f",
    		borderRadius: 100,
    		left: 33,
    		position: "absolute",
    		alignItems: "center",
    		overflow: "hidden"
  	},
  	iphone1314Configuraes: {
    		backgroundColor: "#fff",
    		width: "100%",
    		height: 844,
    		overflow: "hidden",
    		flex: 1
  	}
});

export default IPhone1314Configuraes;
