import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Text, Loader } from "@mantine/core";

const VerificationPage = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/api/profiles/verify/${token}`);
        setStatus("success");
        setMessage("Email verified successfully! You can now log in");

        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Verification failed. Token may be invalid or expired"
        );
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <Container size="sm" py="xl" style={{ textAlign: "center" }}>
      {status === "loading" && (
      <>
        <Loader size="md" />
        <Text mt="md">Verifying your email...</Text>
      </>
    )}
      {status === "success" && <Text color="green">{message}</Text>}
      {status === "error" && <Text color="red">{message}</Text>}
    </Container>
  );
};

export default VerificationPage;