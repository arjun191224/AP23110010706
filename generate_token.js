import axios from 'axios';
import fs from 'fs';

// PLEASE FILL IN YOUR DETAILS HERE
const USER_DETAILS = {
  email: "arjunawasthi_arjun@srmap.edu.in",
  name: "Arjun Awasthi",
  rollNo: "AP23110010706",
  mobileNo: "9682764558",
  githubUsername: "arjun191224",
  accessCode: "QkbpxH"
};

const BASE_URL = 'http://20.207.122.201/evaluation-service';

async function generateToken() {
  try {
    console.log("Step 1: Registering to get client credentials...");
    const regResponse = await axios.post(`${BASE_URL}/register`, USER_DETAILS);
    
    const clientID = regResponse.data.clientID;
    const clientSecret = regResponse.data.clientSecret;
    
    console.log("Registration successful! Saving Client ID and Secret.");
    
    // Save locally just in case
    fs.writeFileSync('credentials.json', JSON.stringify({ clientID, clientSecret }, null, 2));

    console.log("Step 2: Authenticating to get access token...");
    const authPayload = {
      email: USER_DETAILS.email,
      name: USER_DETAILS.name,
      rollNo: USER_DETAILS.rollNo,
      accessCode: USER_DETAILS.accessCode,
      clientID: clientID,
      clientSecret: clientSecret
    };

    const authResponse = await axios.post(`${BASE_URL}/auth`, authPayload);
    const accessToken = authResponse.data.access_token;

    console.log("\n========================================");
    console.log("SUCCESS! Here is your access token:");
    console.log(accessToken);
    console.log("========================================\n");
    
    console.log("Copy this token and place it in:");
    console.log("1. notification_app_be/index.js (ACCESS_TOKEN)");
    console.log("2. logging_middleware/index.js (ACCESS_TOKEN)");

  } catch (error) {
    console.error("Error generating token:", error.response?.data || error.message);
  }
}

generateToken();
