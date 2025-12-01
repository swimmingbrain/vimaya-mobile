import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { register } from "@/services/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (email.includes(" ")) {
      setError("Email cannot contain spaces");
      return false;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.includes(" ")) {
      setError("Password cannot contain spaces");
      return false;
    }
    /*if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }*/
    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPassword.includes(" ")) {
      setError("Confirm password cannot contain spaces");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await register({ username, email, password });
      if (response.status.toLocaleLowerCase() === "success") {
        router.replace("/login");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        >
          <View className="flex-1 justify-center">
            <Text className="text-3xl font-bold text-center mb-12 text-secondary">
              Create Account
            </Text>

            <View className="flex flex-col gap-4">
              {error ? (
                <Text className="text-red-500 text-center">{error}</Text>
              ) : null}

              <TextInput
                className="border border-secondary rounded-lg p-4 text-secondary"
                placeholder="Username"
                placeholderTextColor="#c1c1c1"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setError("");
                }}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                className="border border-secondary rounded-lg p-4 text-secondary"
                placeholder="Email"
                placeholderTextColor="#c1c1c1"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                className="border border-secondary rounded-lg p-4 text-secondary"
                placeholder="Password"
                placeholderTextColor="#c1c1c1"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                className="border border-secondary rounded-lg p-4 text-secondary"
                placeholder="Confirm Password"
                placeholderTextColor="#c1c1c1"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError("");
                }}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                className={`p-4 rounded-lg ${
                  isSubmitting ? "bg-gray-500" : "bg-secondary"
                }`}
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                <Text className="text-primary text-center font-semibold">
                  {isSubmitting ? "Registering..." : "Register"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Text className="text-secondary">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-secondary font-semibold">Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
