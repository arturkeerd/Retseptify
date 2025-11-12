import React from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  StyleSheet,
} from "react-native";

type Props = TextInputProps & {
  errorText?: string;
};

export default function WhiteTextField({ errorText, style, ...rest }: Props) {
  return (
    <View style={s.wrap}>
      <TextInput {...rest} style={[s.input, style]} />
      {!!errorText && <Text style={s.err}>{errorText}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  err: { color: "#c62828", fontSize: 12, marginTop: 4 },
});
