import React from 'react';
import { Box, Paper } from "@mui/material";
import PageLayout from "./PageLayout";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <PageLayout>
      <Box sx={{ m: 1 }}>Oops!! This page doesn't exist</Box>
      <Box sx={{ m: 1 }}>
        <Link to="/">Go to Home</Link>
      </Box>
    </PageLayout>
  );
}
