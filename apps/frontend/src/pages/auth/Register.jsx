// REACT
import { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

// REDUX
import { useDispatch } from "react-redux";
import { setLoggedInUser } from "../../reducers/userReducer";

// FIREBASE
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// FUNCTIONS
import { createOrUpdateUser } from "../../functions/auth";

// STYLE
import {
  Flex,
  Input,
  Button,
  Heading,
  Text,
  Link,
  Select,
} from "@chakra-ui/react";
import AuthWrapper from "./AuthWrapper";

const Register = () => {
  let dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // create user
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // get user id token
      const user = userCredential.user;
      const idTokenResult = await user.getIdTokenResult();

      // redux store
      const res = await createOrUpdateUser({
        token: idTokenResult.token,
        role,
      });
      // redirect
      if (role === "doctor") {
        navigate("/doctor");
      } else if (role === "patient") {
        navigate("/patient");
      } else {
        navigate("/admin");
      }

      dispatch(
        setLoggedInUser({
          name: res.data.name,
          email: res.data.email,
          token: idTokenResult.token,
          role: res.data.role,
          _id: res.data._id,
        })
      );

      toast({
        title: "Account created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Failed to create or update user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <Flex
        as="form"
        h="100vh"
        w="325px"
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        onSubmit={handleSubmit}
      >
        <Flex
          gap="6px"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Heading size="lg">Bienvenue!</Heading>
          <Text color="darkgray">Bienvenue! Merci de créer votre compte</Text>
        </Flex>
        <Flex w="100%" direction="column" gap={2}>
          <Input
            focusBorderColor="primary.500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            autoFocus
            size={{ sm: "sm", md: "md" }}
            mt={2}
          />

          <Input
            focusBorderColor="primary.500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            size={{ sm: "sm", md: "md" }}
          />
          <Flex w="100%" gap={4} alignItems="center">
            <Text flexWrap="nowrap" whiteSpace="nowrap">
              Vous êtes un{" "}
            </Text>
            <Select
              onChange={(e) => setRole(e.target.value)}
              focusBorderColor="primary.500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Docteur</option>
            </Select>
          </Flex>
        </Flex>
        <Flex direction="column" gap={2} w="100%">
          <Button
            tyep="submit"
            isDisabled={!email || password.length < 6}
            isLoading={loading}
            colorScheme="primary"
            size="sm"
            _hover={{
              opacity: email && password.length >= 6 && "0.8",
            }}
          >
            S'inscrire
          </Button>
        </Flex>

        <Flex fontSize="sm">
          <Text color="gray" mr={1}>
            Vous avez déjà un compte?
          </Text>
          <Link
            as={NavLink}
            to="/login"
            color="primary.500"
            fontWeight="semibold"
            _hover={{ textDecoration: "underline" }}
          >
            Se connecter
          </Link>
        </Flex>
      </Flex>
    </AuthWrapper>
  );
};

export default Register;
